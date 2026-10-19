// Nghị định 145/2020/NĐ-CP, Điều 55–57. No storage or network operations.
export const DAY_RATES = { weekday: 1.5, rest: 2, holiday: 3 };
export function overtime(input) {
  const { basis, wage, normalHours, hours, day, night, daytimeOvertime } = input;
  if (!['hourly', 'monthly'].includes(basis)) throw new Error('Chọn cách nhập tiền lương.');
  if (!Number.isFinite(wage) || wage <= 0 || wage > 1e12) throw new Error('Tiền lương phải lớn hơn 0 và không quá 1.000 tỷ đồng.');
  if (!Number.isFinite(hours) || hours < 0 || hours > 744) throw new Error('Số giờ làm thêm phải từ 0 đến 744 giờ.');
  if (!(day in DAY_RATES)) throw new Error('Chọn loại ngày làm thêm.');
  if (basis === 'monthly' && (!Number.isFinite(normalHours) || normalHours <= 0 || normalHours > 744)) throw new Error('Giờ làm việc bình thường phải lớn hơn 0 và không quá 744 giờ.');
  const hourly = basis === 'hourly' ? wage : wage / normalHours;
  const base = DAY_RATES[day];
  const daytime = day === 'weekday' ? (daytimeOvertime ? 1.5 : 1) : base;
  const nightExtra = night ? .3 : 0;
  const additional = night ? .2 * daytime : 0;
  const rate = base + nightExtra + additional;
  const total = hourly * rate * hours;
  if (!Number.isFinite(total) || total > Number.MAX_SAFE_INTEGER) throw new Error('Kết quả vượt phạm vi tính toán. Hãy kiểm tra lại dữ liệu.');
  return { hourly, base, nightExtra, additional, rate, hours, total, dayAmount: hourly * base * hours, nightAmount: hourly * nightExtra * hours, extraAmount: hourly * additional * hours };
}
