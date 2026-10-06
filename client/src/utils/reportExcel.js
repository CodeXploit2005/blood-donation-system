const statusLabels = {
  registered: 'Đã đăng ký', checked_in: 'Đã điểm danh',
  screened_eligible: 'Đủ điều kiện', screened_ineligible: 'Không đủ điều kiện',
  donated: 'Đã hiến máu', no_show: 'Không đến', cancelled: 'Đã hủy',
};
const dateText = (value) => value ? new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '';

export async function buildReportWorkbook(report) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Nhịp Sống';
  workbook.created = new Date();
  const summary = workbook.addWorksheet('Tổng quan');
  summary.columns = [{ width: 34 }, { width: 85 }];
  summary.addRows([
    ['BÁO CÁO HIẾN MÁU', report.event.title],
    ['Địa điểm', report.event.location],
    ['Bắt đầu', dateText(report.event.startDate)],
    ['Kết thúc', dateText(report.event.endDate)],
    ['Thời điểm xuất (giờ Việt Nam)', dateText(new Date())],
    ['Người đăng ký', report.totalRegistrations],
    ['Đã điểm danh', report.totalCheckedIn],
    ['Đã hiến máu', report.totalDonated],
    ['Thể tích thu (ml)', report.totalVolumeMl],
    ['Tỷ lệ có mặt (%)', report.checkInRate],
    ['Tỷ lệ hiến thành công (%)', report.conversionRate],
    ['Quy ước', 'Loại đơn đã hủy. Chỉ tính thể tích đã ghi nhận của lượt đã hiến; không mặc định 350 ml.'],
  ]);
  const detail = workbook.addWorksheet('Người tham gia', { views: [{ state: 'frozen', ySplit: 1 }] });
  detail.columns = [
    ['Mã đăng ký', 24], ['Họ và tên', 30], ['Điện thoại', 18], ['Email', 34],
    ['Nhóm máu khai báo', 20], ['Nhóm máu xác nhận', 22], ['Cân nặng (kg)', 18],
    ['Khung giờ', 20], ['Sàng lọc', 24], ['Trạng thái', 26],
    ['Điểm danh', 20], ['Thời gian điểm danh', 25], ['Thể tích (ml)', 18],
    ['Ghi chú y tế', 45], ['Ngày đăng ký', 25],
  ].map(([header, width]) => ({ header, width }));
  for (const r of report.registrations || []) {
    detail.addRow([
      r.qrCode?.code || String(r._id || ''), r.fullName || '', String(r.phone || ''), r.email || '',
      r.bloodType || '', r.confirmedBloodType || '', r.weight ?? null, r.preferredTimeSlot || '',
      ({ eligible: 'Đủ điều kiện sơ bộ', ineligible: 'Không đủ điều kiện', deferred: 'Cần khám lại' })[r.screeningResult?.doctorConclusion] || 'Chưa khám',
      statusLabels[r.donationStatus] || r.donationStatus || '',
      (r.checkIn?.status === 'checked_in' || ['checked_in', 'donated'].includes(r.donationStatus)) ? 'Đã có mặt' : 'Chưa có mặt',
      dateText(r.checkIn?.checkInTime), r.donationStatus === 'donated' ? r.donationVolume ?? null : null,
      r.checkIn?.nurseNotes || r.screeningResult?.notes || '', dateText(r.registeredAt),
    ]);
  }
  detail.autoFilter = { from: 'A1', to: 'O1' };
  detail.getColumn(3).numFmt = '@';
  for (const sheet of [summary, detail]) {
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC4384A' } };
    sheet.getRow(1).height = 30;
    sheet.eachRow((row, index) => {
      row.alignment = { vertical: 'middle', wrapText: true };
      if (index > 1) {
        row.height = 32;
        if (index % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F3EF' } };
      }
    });
  }
  return workbook;
}
