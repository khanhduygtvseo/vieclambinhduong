# Đối chiếu yêu cầu — CareerViet Web 2.0

Nguồn kiểm tra: `C:\Codex\Tiêu chuẩn build web 2.0-v2.xlsx` và `C:\Codex\Skill\Checklist final.md`. Áp dụng yêu cầu mới nhất của người dùng: bản xem trước riêng tư; dùng tên CareerViet; không backlink về website gốc; bỏ toàn bộ hình ảnh để người dùng cung cấp sau; không tạo favicon.

## Phạm vi đã dựng

26 trang nội dung và trang 404: trang chủ, điểm bắt đầu Việc làm, hub khu vực, 6 trang khu vực, hub ngành nghề, 6 trang ngành nghề, cẩm nang, 4 bài viết, công cụ tăng ca, giới thiệu, liên hệ, quyền riêng tư, điều khoản.

| Nhóm | Kết quả và bằng chứng |
| --- | --- |
| Nguồn mã | Một nguồn chính, build bằng `build.mjs`; CSS/JS/calculator trong `dist` trùng hash nguồn. |
| Home P-01 | Menu 5 mục, hero, 6 khu vực nhóm theo miền, 6 ngành nghề, 3 bài nổi bật, công cụ, giới thiệu và liên hệ, footer. |
| Khu vực P-02 | Breadcrumb, H1, intro; nhóm miền trong hub; 6 trang riêng, mỗi phần nội dung 181–189 từ và 3 bài liên quan. |
| Ngành nghề P-03 | Hub 6 ngành, mỗi ngành có nhóm công việc, trang riêng 186–192 từ và 3 bài liên quan. |
| Blog P-04/P-05 | HTML thật, 4 chủ đề, bộ lọc và tìm kiếm có bỏ dấu; tóm tắt, ngày đăng/cập nhật thật của bản mới, tác giả CareerViet, H2, bài liên quan; liên kết bổ sung đến nguồn chính phủ có liên quan. Không hiển thị ghi chú biên tập nội bộ. |
| Thông tin G-03/G-08 | Không dựng tin việc làm, người dùng, đánh giá, lượt xem, thành tích hoặc dữ liệu thị trường giả. Địa chỉ/điện thoại/email đối chiếu trang chủ CareerViet; đơn vị vận hành đối chiếu quy chế sàn. |
| Liên kết G-09 | Không có liên kết HTTP/HTTPS về CareerViet, không liên kết site vệ tinh. Email và điện thoại là kênh liên hệ, không phải backlink website. |
| Thiết kế | Than đen, đỏ rượu vang, vàng đồng. Nguồn CSS/JS/build/content khác các file cùng vai trò trong bản editorial trước. Kiểm footprint ở phạm vi mã local và outgoing link; không tự nhận chứng nhận footprint của công cụ tìm kiếm. |
| Hình ảnh, favicon | Không có ảnh, hotlink, khung ảnh trống hoặc favicon, đúng quyết định mới của người dùng. Hai vòng hình tự tạo không được tích hợp. |
| Responsive | Quét 27 trang × 7 viewport: 320/375/390/440/768/1366/1440 px, không tràn ngang hoặc control ra ngoài viewport. Sau chỉnh sửa kiểm lại home, tool và toàn bộ cẩm nang ở cả 7 viewport. |
| Tương tác | 33 kiểm tra trình duyệt đạt: menu mở/đóng/Escape/bàn phím/chọn link; bộ lọc/tìm kiếm/trống; nhập thiếu/sai; tất cả nhánh hệ số; reset; disclosure; no-JS; reduced-motion; 404. |
| Công thức TL-03 | 33 kiểm tra có thể chạy lại đạt. Các mức ban ngày 150/200/300%; ban đêm 200/210/270/390%; quy đổi tháng, giờ thập phân, 0 giờ, biên và dữ liệu sai. |
| Công cụ đầy đủ | Form và kết quả, breakdown, công thức, bảng hệ số, 2 ví dụ, 8 FAQ, căn cứ pháp lý, phạm vi sử dụng, ngày cập nhật, 3 bài liên quan. |
| Quyền riêng tư TL-04 | Không gửi lương qua mạng; không lưu localStorage/sessionStorage/cookie; không cần email. Kiểm tra trình duyệt xác nhận. |
| Accessibility | Focus rõ, HTML ngữ nghĩa, 1 H1/trang, label/fieldset/legend, aria-expanded, aria-pressed, thông báo lỗi và live region. Nội dung vẫn đọc được khi tắt JS; motion giảm theo hệ điều hành. 9 cặp màu chính đạt AA chữ thường. Không tuyên bố đây là audit WCAG toàn diện. |
| SEO kỹ thuật | 27 title và meta riêng, canonical tự trỏ đúng origin bản riêng tư, schema JSON-LD đọc được, breadcrumb. 828 liên kết nội bộ/tài nguyên được kiểm tra. |
| Build và gói | Build/verify đạt; chỉ HTML, CSS, JS, calculator, robots và sitemap trong thư mục tĩnh. Tài liệu nội bộ, mã kiểm tra và ảnh QA không thuộc gói web. |

## Các phần thuộc giai đoạn xuất bản công khai

- **Chờ tên miền cuối:** người dùng yêu cầu xem trước riêng tư trước. Hiện giữ `noindex, nofollow`, `robots.txt` Disallow và sitemap rỗng; không tự nhận site đã được index. Generator đã có nhánh tạo sitemap đầy đủ và canonical đúng domain khi chốt tên miền và chuyển sang public.
- **Search Console và kiểm index thực tế:** cần tên miền và quyền sở hữu property. Chưa thiết lập hoặc xác nhận index trên bản riêng tư.
- **Đo volume TL-01:** đã thử connector Ahrefs nhưng nhận `Access denied: MCP token is invalid`. Chưa có con số volume được xác nhận; không tự tạo số. Topic tăng ca do người dùng chỉ định.
- **SERP TL-01:** ghi chú trong file tiêu chuẩn mô tả kết quả ngày 14/10/2026; chưa có kiểm toán top 10 theo đúng vị trí địa lý tại ngày bàn giao. Không trình bày nhận định cạnh tranh như kết quả đã kiểm chứng mới.
- **Ảnh:** bổ sung khi người dùng cung cấp. Trước khi đưa lên cần kiểm tra tỷ lệ, crop và mobile; hiện không dùng tài sản cần duyệt.

## Bằng chứng có thể chạy lại

- `node test-calculator.mjs`: công thức và trường hợp biên.
- `node build.mjs` và `node verify.mjs`: HTML, link, metadata, cấu trúc, đồng bộ nguồn/build.
- `node audit-footprint.mjs`: đối chiếu nguồn local, link và độ dài nội dung.
- `node qa-browser.mjs`: kiểm tra toàn site; `--focused` kiểm tra các trang đã thay đổi và toàn bộ tương tác.
- `qa/full-viewport-scan.json`, `qa/browser-checks.json`, `qa/static-checks.json`, `qa/contrast-checks.json`, `qa/footprint-checks.json`: kết quả kiểm tra.

Các lỗi reset và thông báo khi tắt JavaScript đã được sửa ở nguồn và kiểm tra lại đạt. Bản này đáp ứng phạm vi xem trước; các mục index, Search Console và volume nêu trên vẫn mở, không đánh dấu hoàn tất toàn bộ tiêu chuẩn xuất bản công khai.
