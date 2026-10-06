// Run from repository root. --repair updates only derived event counters.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.resolve(__dirname, '../..');
require('../node_modules/dotenv').config({ path: path.join(root, 'server/.env') });
const mongoose = require('../node_modules/mongoose');
const ExcelJS = require('../../client/node_modules/exceljs');
require('../dist/models/User');
const { getDashboardAnalytics } = require('../dist/services/reportService');
const { getEventReport } = require('../dist/controllers/reportController');
const exporter = fs.readFileSync(path.join(root, 'client/src/utils/reportExcel.js'), 'utf8')
  .replace('export async function', 'async function')
  .replace("const { default: ExcelJS } = await import('exceljs');", '');
const buildWorkbook = new Function('ExcelJS', exporter + '; return buildReportWorkbook;')(ExcelJS);
const present = r => r.checkIn?.status === 'checked_in' || ['checked_in', 'donated'].includes(r.donationStatus);

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;
  const registrations = await db.collection('registrations').find({}).toArray();
  const events = await db.collection('blooddonationevents').find({}).toArray();
  const users = await db.collection('users').find({}, { projection: { _id: 1 } }).toArray();
  const active = registrations.filter(r => r.donationStatus !== 'cancelled');
  const donated = active.filter(r => r.donationStatus === 'donated');
  const expected = {
    totalRegistrations: active.length,
    totalCheckedIn: active.filter(present).length,
    totalDonated: donated.length,
    totalVolumeCollectedMl: donated.reduce((s, r) => s + (r.donationVolume > 0 ? r.donationVolume : 0), 0),
  };
  const dashboard = await getDashboardAnalytics();
  for (const [key, value] of Object.entries(expected)) assert.equal(dashboard[key], value, key);
  const changes = [];
  for (const event of events) {
    const rows = active.filter(r => String(r.eventId) === String(event._id));
    const next = { currentParticipants: rows.length, collectedBloodUnits: rows.filter(r => r.donationStatus === 'donated').length };
    if (event.currentParticipants !== next.currentParticipants || event.collectedBloodUnits !== next.collectedBloodUnits) {
      changes.push({ eventId: String(event._id), previous: { currentParticipants: event.currentParticipants, collectedBloodUnits: event.collectedBloodUnits }, next });
    }
    let report;
    const res = { status() { return this; }, json(body) { assert.equal(body.success, true); report = body.data; } };
    await getEventReport({ params: { eventId: String(event._id) } }, res);
    assert.equal(report.totalRegistrations, rows.length);
    assert.equal(report.totalCheckedIn, rows.filter(present).length);
    assert.equal(report.totalDonated, next.collectedBloodUnits);
    assert.equal(report.totalVolumeMl, rows.filter(r => r.donationStatus === 'donated').reduce((s, r) => s + (r.donationVolume > 0 ? r.donationVolume : 0), 0));
    const workbook = await buildWorkbook(report);
    const reopened = new ExcelJS.Workbook();
    await reopened.xlsx.load(await workbook.xlsx.writeBuffer());
    const detail = reopened.getWorksheet('Người tham gia');
    assert.equal(detail.rowCount, rows.length + 1);
    let volume = 0;
    for (let n = 2; n <= detail.rowCount; n++) {
      const row = detail.getRow(n);
      assert.equal(typeof row.getCell(3).value, 'string', 'Phone must remain text');
      volume += Number(row.getCell(13).value || 0);
    }
    assert.equal(volume, report.totalVolumeMl, 'Excel volume mismatch');
    assert.equal(reopened.getWorksheet('Tổng quan').getCell('B6').value, rows.length);
  }
  const issues = {
    missingEvents: registrations.filter(r => !events.some(e => String(e._id) === String(r.eventId))).length,
    missingUsers: registrations.filter(r => !users.some(u => String(u._id) === String(r.userId))).length,
    invalidDonatedRecords: donated.filter(r => !present(r) || !(r.donationVolume > 0) || !r.confirmedBloodType || r.confirmedBloodType === 'unknown').length,
    inconsistentScreening: donated.filter(r => r.screeningResult?.doctorConclusion === 'ineligible').length,
    duplicateQrCodes: registrations.length - new Set(registrations.map(r => r.qrCode?.code)).size,
  };
  const repair = process.argv.includes('--repair');
  const summary = { auditedAt: new Date().toISOString(), database: db.databaseName, events: events.length, metrics: expected, issues, counterChanges: changes, repaired: repair, excelRoundTripsPassed: events.length };
  // Save the previous counters before any repair. This contains no personal profiles.
  if (repair || !fs.existsSync(path.join(root, 'docs/data-audit.json'))) {
    fs.writeFileSync(path.join(root, 'docs/data-audit.json'), JSON.stringify(summary, null, 2));
  }
  if (repair) for (const change of changes) {
    await db.collection('blooddonationevents').updateOne({ _id: new mongoose.Types.ObjectId(change.eventId) }, { $set: change.next });
  }
  console.log(JSON.stringify(summary, null, 2));
  await mongoose.disconnect();
})().catch(async error => { console.error(error.message); await mongoose.disconnect(); process.exitCode = 1; });
