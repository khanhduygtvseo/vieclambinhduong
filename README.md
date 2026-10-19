# CareerViet — Cẩm nang và công cụ tăng ca

Nguồn chính duy nhất: thư mục này. `build.mjs` dựng HTML thật từ `content.mjs`, `site.css`, `site.js` và `calculator.mjs` vào `dist/`. Không sửa trực tiếp `dist/`.

## Chạy và kiểm tra

```powershell
node test-calculator.mjs
node build.mjs
node verify.mjs
node serve.mjs 4188
```

`qa-browser.mjs` kiểm tra bản phục vụ ở cổng 4188 bằng Chromium có sẵn trong runtime. Kết quả nằm trong `qa/`.

Có thể mở trực tiếp `dist/index.html` bằng Chrome để duyệt ngoại tuyến. Bản build dùng đường dẫn tài nguyên tương đối và tự đổi liên kết nội bộ sang các tệp `index.html` khi chạy qua `file://`; khi chạy trên máy chủ, URL sạch vẫn được giữ nguyên.

## Quyết định đã chốt

- Dùng tên CareerViet, bản xem trước riêng tư.
- Không có liên kết HTTP/HTTPS về CareerViet hoặc site vệ tinh khác.
- Chỉ sử dụng logo CareerViet chính thức tải từ miền tài nguyên của CareerViet. Chưa có ảnh/banner; người dùng sẽ cung cấp sau. Không tạo favicon.
- Giao diện than đen, đỏ rượu vang và điểm nhấn vàng đồng. Không dùng lại giao diện các bản trước.
- Không lưu hoặc gửi dữ liệu lương. Không tích hợp đăng ký, hồ sơ ứng tuyển hay form liên hệ giả.
- Phần danh mục là nội dung hướng dẫn khám phá công việc, không giả lập kho tin tuyển dụng trực tiếp.

## Nguồn thông tin

URL đối chiếu nằm trong trường `source` của `content.mjs`, không được xuất ra giao diện. Thông tin liên hệ đối chiếu trang chủ CareerViet, tên đơn vị đối chiếu quy chế sàn CareerViet. Các bài mới được đăng và rà soát ngày 19/10/2026; không dùng ngày đăng của nguồn làm ngày đăng bài mới.

Công thức được đối chiếu Điều 98, 106 Bộ luật Lao động 2019; Điều 55–57 Nghị định 145/2020/NĐ-CP. Liên kết văn bản chính thức có trên trang công cụ vì cần cho người dùng kiểm tra cách áp dụng.

## Trước khi xuất bản công khai

Chốt tên miền, cập nhật `config.json` và build lại metadata. Chỉ chuyển `preview` sang `false` sau khi hoàn tất duyệt nội dung. Chế độ preview dùng noindex/nofollow, robots Disallow và sitemap rỗng. Khi public, generator tạo canonical tự trỏ, sitemap đủ các trang hoàn thiện và robots Allow theo đúng origin.

Kết nối Search Console và kiểm tra index trên tên miền cuối; không thể xác nhận index từ một bản riêng tư. Nếu thêm ảnh, kiểm tra tỷ lệ và chất lượng riêng trên desktop/mobile trước khi tích hợp.
