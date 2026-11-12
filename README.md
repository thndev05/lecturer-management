# Lecturer Management

Ứng dụng quản lý giảng viên bằng React Native/Expo và NestJS, sử dụng MongoDB database `QLHocPhan`.

## Công nghệ và chức năng

- **`app/`**: Expo SDK 58, React Native, TypeScript, Expo Router và NativeWind. Giao diện quản trị có đăng nhập, CRUD giảng viên, chọn ảnh, tìm kiếm/lọc/sắp xếp, xuất Excel/JSON, tiếng Việt/Anh và chế độ sáng/tối.
- **`backend/`**: NestJS, MongoDB/Mongoose, JWT và Cloudinary. Đăng nhập bằng một tài khoản trong `.env`, CRUD giảng viên, tìm kiếm theo tên/mã, upload ảnh và xuất JSON.

## Chạy dự án

Yêu cầu Node.js 24, npm và MongoDB local hoặc Atlas. Từ thư mục gốc, chọn Node trước khi chạy ở mỗi terminal:

```bash
source ~/.nvm/nvm.sh
nvm use
```

**Backend:**

```bash
cd backend
npm ci
cp -n .env.example .env
npm run start:dev
```

Trước khi chạy, điền MongoDB, JWT và Cloudinary vào `backend/.env` theo [hướng dẫn backend](backend/README.md). Swagger mặc định: `http://localhost:3000/docs`.

**App** — mở terminal khác từ thư mục gốc:

```bash
cd app
npm ci
cp -n .env.example .env
npm start
```

Dùng Expo Go hỗ trợ SDK 58 hoặc `npm run web`. Khi cần tunnel cho Metro trong WSL, chạy `npm start -- --tunnel`; tunnel backend được cấu hình riêng. `EXPO_PUBLIC_API_URL` trong `app/.env` phải là URL backend thiết bị truy cập được, có hậu tố `/api`.

Không đưa `.env` hoặc thông tin bí mật lên Git. Chi tiết API và cách kiểm thử nằm trong [backend/README.md](backend/README.md).

## Format mã nguồn

Trong `app/` hoặc `backend/`, chạy `npm run format` để format bằng Prettier, hoặc `npm run format:check` để kiểm tra. Hai phần dùng chung cấu hình `.prettierrc.json` ở thư mục gốc.
