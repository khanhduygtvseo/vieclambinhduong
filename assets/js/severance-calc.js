/* Công thức trợ cấp thôi việc / trợ cấp mất việc làm (Bộ luật Lao động 2019, Điều 46, 47; Nghị định 145/2020/NĐ-CP, Điều 8).
   Dùng chung cho trình duyệt và bước kiểm thử. Không lưu và không gửi dữ liệu đi đâu. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SeveranceCalc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var NOT_ENTITLED = {
    'luong-huu': 'Người lao động đã đủ điều kiện hưởng lương hưu nên không thuộc diện nhận trợ cấp thôi việc.',
    'bo-viec': 'Người lao động tự ý bỏ việc từ 05 ngày làm việc liên tục trở lên mà không có lý do chính đáng nên không thuộc diện nhận trợ cấp thôi việc.',
    'sa-thai': 'Hợp đồng chấm dứt do bị xử lý kỷ luật sa thải, không thuộc các trường hợp được trả trợ cấp thôi việc.',
    'trai-luat': 'Người lao động đơn phương chấm dứt hợp đồng trái pháp luật nên không được trợ cấp thôi việc.',
  };

  // Quy đổi số tháng thành số năm tính trợ cấp: phần tháng lẻ <= 6 tháng tính 1/2 năm, trên 6 tháng tính 1 năm.
  function yearsFromMonths(months) {
    var full = Math.floor(months / 12);
    var rest = months - full * 12;
    if (rest === 0) return full;
    return full + (rest <= 6 ? 0.5 : 1);
  }

  function toInt(v) { return typeof v === 'number' && isFinite(v) ? Math.floor(v) : NaN; }

  /* input: {
       type: 'thoi-viec' | 'mat-viec',
       situation: 'eligible' | 'luong-huu' | 'bo-viec' | 'sa-thai' | 'trai-luat',
       totalMonths, unemploymentMonths, paidMonths,   // số tháng nguyên >= 0
       avgSalary                                       // tiền lương bình quân 6 tháng liền kề, đồng
     } */
  function calc(input) {
    var type = input.type === 'mat-viec' ? 'mat-viec' : 'thoi-viec';
    var total = toInt(input.totalMonths), bh = toInt(input.unemploymentMonths || 0), paid = toInt(input.paidMonths || 0);
    var avg = input.avgSalary;
    if (!(total >= 0) || !(bh >= 0) || !(paid >= 0)) return { ok: false, error: 'Thời gian làm việc phải là số không âm.' };
    if (!(typeof avg === 'number' && isFinite(avg) && avg > 0)) return { ok: false, error: 'Hãy nhập tiền lương bình quân lớn hơn 0.' };
    if (bh + paid > total) return { ok: false, error: 'Thời gian đã tham gia bảo hiểm thất nghiệp và thời gian đã được trả trợ cấp cộng lại không thể lớn hơn tổng thời gian làm việc.' };

    var res = { ok: true, type: type, totalMonths: total, deductMonths: bh + paid, netMonths: total - bh - paid, avgSalary: avg };

    if (type === 'thoi-viec' && input.situation && input.situation !== 'eligible') {
      res.eligible = false; res.reason = NOT_ENTITLED[input.situation] || 'Trường hợp này không thuộc diện nhận trợ cấp thôi việc.';
      res.amount = 0; return res;
    }
    if (total < 12) {
      res.eligible = false; res.reason = 'Người lao động cần làm việc thường xuyên cho người sử dụng lao động từ đủ 12 tháng trở lên mới thuộc diện nhận trợ cấp.';
      res.amount = 0; return res;
    }

    res.eligible = true;
    res.years = yearsFromMonths(res.netMonths);
    if (type === 'thoi-viec') {
      res.rate = 0.5;
      res.monthsOfSalary = res.years * 0.5;
      res.minApplied = false;
    } else {
      res.rate = 1;
      res.monthsOfSalary = res.years * 1;
      res.minApplied = false;
      if (res.netMonths > 0 && res.monthsOfSalary < 2) { res.monthsOfSalary = 2; res.minApplied = true; }
    }
    res.amount = Math.round(res.monthsOfSalary * avg);
    return res;
  }

  function average(list) {
    var s = 0;
    for (var i = 0; i < list.length; i++) s += list[i];
    return list.length ? s / list.length : 0;
  }

  return { calc: calc, yearsFromMonths: yearsFromMonths, average: average, NOT_ENTITLED: NOT_ENTITLED };
});
