# API quản lý giảng viên

Backend NestJS dùng MongoDB database `QLHocPhan`. Một tài khoản quản trị duy nhất được cấu hình trong `backend/.env`; không có đăng ký hoặc collection quản trị.

## Chạy backend

Chọn Node 24 từ root (`source ~/.nvm/nvm.sh`, `nvm use`), sau đó vào `backend/`, chạy `npm ci` nếu chưa cài dependencies. Nếu chưa có `.env`, tạo từ `.env.example`; không ghi đè `.env` đã có thông tin riêng.

Cấu hình `MONGODB_URI` trỏ đúng database `QLHocPhan`, `JWT_SECRET` là chuỗi ngẫu nhiên ít nhất 32 byte, `JWT_EXPIRES_IN=1h`. Cấu hình bốn biến `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER=QLHocPhan` để upload ảnh. Không đưa bí mật vào app hay Git.

```bash
npm run start:dev
```

Swagger: `http://localhost:3000/docs`; OpenAPI JSON: `/docs-json`. Trong Swagger, đăng nhập, sao chép `accessToken`, chọn **Authorize** rồi dán token.

Thêm tài khoản vào `backend/.env` (không phải `app/.env`):

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-own-strong-password
ADMIN_FULLNAME=Quản trị viên
```

Đặt mật khẩu riêng ít nhất 8 ký tự, tối đa 72 byte UTF-8. Thiếu/sai cấu hình sẽ khiến backend từ chối khởi động. Khởi động lại sau khi đổi `.env`. Đổi email hoặc mật khẩu sẽ vô hiệu token cũ. Collection `QuanTriVien` cũ nếu có sẽ không được đọc, sửa hay tự động xóa.

## API

Các đường dẫn dưới đây có prefix `/api`. Trừ `GET /api` và đăng nhập, mọi API đều cần header `Authorization: Bearer <accessToken>`.

| Method | Đường dẫn            | Nội dung                                                                               |
| ------ | -------------------- | -------------------------------------------------------------------------------------- |
| GET    | `/`                  | Kiểm tra API tại `/api`                                                                |
| POST   | `/auth/login`        | Đăng nhập, trả `accessToken` và `tokenType: Bearer`                                    |
| GET    | `/auth/me`           | Hồ sơ quản trị đang đăng nhập                                                          |
| POST   | `/uploads/image`     | Multipart, trường `file`; trả `{ "Image": "https://..." }`                             |
| GET    | `/giang-vien`        | Danh sách giảng viên, tùy chọn `?search=...` tìm theo tên hoặc mã, sắp xếp theo `IDGV` |
| GET    | `/giang-vien/export` | Tải `GiangVien.json` chỉ chứa bốn trường nghiệp vụ                                     |
| GET    | `/giang-vien/:IDGV`  | Chi tiết theo mã giảng viên                                                            |
| POST   | `/giang-vien`        | Thêm giảng viên                                                                        |
| PATCH  | `/giang-vien/:IDGV`  | Sửa một hoặc nhiều trường, cho phép đổi mã nếu không trùng                             |
| DELETE | `/giang-vien/:IDGV`  | Xóa giảng viên                                                                         |

`GET /api` chỉ xác nhận API hoạt động, không phải endpoint chẩn đoán tình trạng database.

Đăng nhập:

```json
{
  "Email": "admin@example.com",
  "Password": "your-own-strong-password"
}
```

Email được trim và chuyển chữ thường; mật khẩu không được trim. Không lưu tài khoản hay token vào MongoDB. API `/auth/me` giữ cấu trúc `{ _id: "admin", Fullname, Email }` để tương thích app; `_id` là định danh cố định, không phải document MongoDB. API không trả mật khẩu hoặc giá trị dùng để so sánh mật khẩu.

Giảng viên:

```json
{
  "IDGV": "GV001",
  "Fullname": "Nguyễn Văn B",
  "Image": "https://res.cloudinary.com/your-cloud/image/upload/v1/QLHocPhan/example.jpg",
  "SumClass": 3
}
```

Upload ảnh trước, sau đó dùng URL trả về làm `Image` trong API thêm/sửa giảng viên. Upload chấp nhận JPEG, PNG, WebP tối đa 5 MiB; kiểm tra chữ ký nội dung file thay vì chỉ tin phần mở rộng. Backend ký request Cloudinary; app không cần biết API secret. Thay `:IDGV` bằng mã được URL-encode khi mã chứa ký tự đặc biệt.

`IDGV` do người dùng nhập, trim, tối đa 50 ký tự và duy nhất, phân biệt chữ hoa/thường. `Fullname` bắt buộc, tối đa 120 ký tự. `SumClass` là số nguyên không âm. `Image` là URL HTTPS trên `res.cloudinary.com`. Trường không khai báo bị từ chối. Collection `GiangVien` chỉ có `IDGV`, `Fullname`, `Image`, `SumClass` và `_id` bắt buộc của MongoDB; không thêm `__v` hoặc timestamps.

Tìm kiếm dùng `GET /api/giang-vien?search=Nguyễn` hoặc `?search=gv001`. API tìm chuỗi con trong `Fullname` hoặc `IDGV`, không phân biệt hoa/thường nhưng vẫn phân biệt dấu tiếng Việt. Từ khóa được trim, tối đa 120 ký tự và được hiểu là văn bản thường (không phải regex). Không truyền hoặc truyền từ khóa rỗng trả toàn bộ danh sách; không tìm thấy trả `[]`. API vẫn yêu cầu JWT. Xuất JSON luôn xuất toàn bộ dữ liệu, không áp dụng từ khóa tìm kiếm.

## Lỗi và giới hạn

- `400`: dữ liệu không hợp lệ, thiếu file hoặc sai loại ảnh.
- `401`: sai thông tin đăng nhập, thiếu/sai/hết hạn token hoặc cấu hình tài khoản đã thay đổi.
- `404`: mã giảng viên không tồn tại.
- `409`: mã giảng viên trùng, kể cả khi gửi đồng thời.
- `413`: file vượt giới hạn dung lượng.
- `429`: vượt giới hạn request; đăng nhập tối đa 10 request/phút/IP; các API khác 120 request/phút/IP cho mỗi endpoint. Bộ đếm nằm trong tiến trình, phù hợp một instance bài tập.
- `503`: thiếu cấu hình hoặc upload Cloudinary thất bại.

Chỉ dùng một JWT access token có hạn. Đăng xuất phía app bằng cách xóa token; không có endpoint thu hồi token hay refresh token. Token dùng được tới hết hạn nếu cấu hình xác thực không đổi. Một tài khoản có thể đăng nhập trên nhiều thiết bị.

Xóa hoặc thay ảnh giảng viên không tự xóa ảnh Cloudinary vì có thể có bản ghi dùng chung URL. Upload và lưu giảng viên là hai request riêng, ảnh upload chưa được lưu vào bản ghi vẫn nằm trên Cloudinary. Chưa có tác vụ dọn ảnh tự động.

Backend đợi tạo unique index khi khởi động. Nếu database cũ chứa dữ liệu trùng, xử lý dữ liệu có chủ đích; không tự xóa dữ liệu hoặc index để vượt qua lỗi khởi động.

## Kiểm tra

```bash
npm run typecheck
npm test
```

`npm test` build rồi kiểm tra cấu hình tài khoản, đăng nhập, đổi tài khoản làm mất hiệu lực token cũ và API đăng ký không còn tồn tại. Kiểm thử HTTP dùng MongoDB local cổng 27017; mỗi lần tạo database `qlhocphan_test_<random>` và chỉ xóa database đó khi kết thúc. Test không dùng Atlas, xác nhận không tạo collection quản trị, bao phủ JWT, unique index đồng thời, CRUD, tìm kiếm, xuất JSON và upload. Cloudinary được giả lập ở ranh giới SDK, không upload thật. Muốn xác minh Cloudinary thật, thử upload qua Swagger với cấu hình riêng.

## Nộp dữ liệu

Đăng nhập và tải `GET /api/giang-vien/export` để lấy JSON dữ liệu nghiệp vụ. Chụp collection `GiangVien` trên Compass/Atlas theo yêu cầu bài tập. Không nộp `.env` hoặc mật khẩu thật.
