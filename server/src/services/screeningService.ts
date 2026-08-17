import { IHealthInfo, IScreeningResultData } from '../models/Registration';

export interface ScreeningEvaluation {
  result: 'eligible' | 'ineligible' | 'deferred';
  doctorConclusion: 'eligible' | 'ineligible' | 'deferred';
  notes: string;
  reasons: string[];
}

export const evaluateHealthScreening = (
  weight: number,
  healthInfo: IHealthInfo,
  gender?: string
): ScreeningEvaluation => {
  const reasons: string[] = [];
  let isStrictIneligible = false;
  let isDeferred = false;

  // 1. Weight criteria: >= 45kg
  if (weight < 45) {
    reasons.push('Cân nặng dưới 45kg (tiêu chuẩn tối thiểu là 45kg để hiến máu toàn phần)');
    isStrictIneligible = true;
  }

  // 2. Fever or active infection
  if (healthInfo.hasFever) {
    reasons.push('Đang có triệu chứng sốt hoặc cảm cúm, viêm nhiễm cấp tính');
    isStrictIneligible = true;
  }

  // 3. Chronic disease
  if (healthInfo.hasChronicDisease) {
    reasons.push('Có tiền sử hoặc đang mắc bệnh mãn tính (tim mạch, gan, thận, huyết học...)');
    isStrictIneligible = true;
  }

  // 4. Pregnancy / Nursing
  if (healthInfo.isPregnantOrNursing) {
    reasons.push('Đang mang thai hoặc nuôi con bằng sữa mẹ dưới 12 tháng');
    isStrictIneligible = true;
  }

  // 5. Recent surgery
  if (healthInfo.recentSurgery) {
    reasons.push('Vừa trải qua phẫu thuật hoặc can thiệp y tế lớn trong vòng 6 tháng');
    isDeferred = true;
  }

  // 6. Medication
  if (healthInfo.takingMedication) {
    reasons.push('Đang trong quá trình sử dụng thuốc điều trị / kháng sinh (cần bác sĩ khám sàng lọc trực tiếp)');
    isDeferred = true;
  }

  // 7. Tattoo / Piercing in 6 months
  if (healthInfo.hasTattooOrPiercingIn6Months) {
    reasons.push('Có xăm hình, xỏ khuyên hoặc châm cứu trong vòng 6 tháng gần nhất');
    isDeferred = true;
  }

  // 8. Donation interval (minimum 84 days = 12 weeks for whole blood)
  if (healthInfo.lastDonationDate) {
    const lastDate = new Date(healthInfo.lastDonationDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 84) {
      reasons.push(`Khoảng cách từ lần hiến máu trước (${diffDays} ngày) chưa đủ tối thiểu 84 ngày (12 tuần)`);
      isStrictIneligible = true;
    }
  }

  if (isStrictIneligible) {
    return {
      result: 'ineligible',
      doctorConclusion: 'ineligible',
      notes: reasons.join('. '),
      reasons,
    };
  }

  if (isDeferred) {
    return {
      result: 'deferred',
      doctorConclusion: 'deferred',
      notes: `Cần bác sĩ thăm khám và tư vấn trực tiếp tại sự kiện vì: ${reasons.join('; ')}`,
      reasons,
    };
  }

  return {
    result: 'eligible',
    doctorConclusion: 'eligible',
    notes: 'Đủ điều kiện sơ bộ tham gia hiến máu theo tiêu chuẩn của Bộ Y Tế.',
    reasons: [],
  };
};
