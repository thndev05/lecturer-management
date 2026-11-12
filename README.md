# Bộ khung bài tập React Native

Dự án khởi tạo từ stack tham khảo của `event-ticketing`, dùng Node.js 24 và npm. App dùng Expo SDK 58 theo yêu cầu mới, không sao chép SDK 54 của dự án tham khảo.

## Cấu trúc

- `app/`: Expo, React Native, TypeScript, Expo Router, NativeWind 4/Tailwind CSS 3, TanStack Query, Zustand, AsyncStorage, SecureStore và các package i18n.
- `backend/`: NestJS 11, TypeScript, Swagger, ConfigModule, DTO validation và MongoDB qua Mongoose.

App hiện có màn hình mặc định, chưa kết nối backend. Backend đã có đăng ký/đăng nhập quản trị, JWT, CRUD giảng viên, upload Cloudinary và xuất JSON. Xem [hướng dẫn API backend](backend/README.md). Zustand và i18n trong app mới được cài package, chưa thiết kế store hay bản dịch. Backend cần MongoDB hoạt động để khởi động.

## Chạy dự án

Từ thư mục `init-prj`:

```bash
source ~/.nvm/nvm.sh
nvm use
```

Chạy backend ở terminal thứ nhất:

```bash
cd backend
cp .env.example .env
npm run start:dev
```

- API mặc định: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

Chạy app ở terminal thứ hai, sau khi chuyển sang Node 24:

```bash
cd app
cp .env.example .env
npm start
```

Mở bằng Expo Go hỗ trợ SDK 58 hoặc chạy `npm run web`. Khi kết nối API trên điện thoại thật, đổi `EXPO_PUBLIC_API_URL` thành `http://<IP-LAN-máy-tính>:3000/api`; trên Android Emulator dùng `http://10.0.2.2:3000/api`. Khởi động lại Expo sau khi đổi `.env`. Biến `EXPO_PUBLIC_*` được đưa vào app nên chỉ chứa cấu hình công khai.

## Cơ sở dữ liệu

Chuẩn bị MongoDB local hoặc MongoDB Atlas. Cấu hình trong `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/QLHocPhan
```

Nếu dùng Atlas, thay bằng connection string riêng. `DATABASE_URL` cũ của PostgreSQL không còn được sử dụng. Không ghi connection string có mật khẩu vào Git.

Kết nối Mongoose được cấu hình trong `backend/src/app.module.ts`. Database gồm collection `GiangVien` và `QuanTriVien`. Không tự tạo dữ liệu mẫu; không cần generate Prisma Client hoặc Prisma migration. Điền JWT và Cloudinary theo `backend/.env.example`; không ghi đè `.env` đang sử dụng.

## Kiểm tra

```bash
cd app
npm run typecheck
npm run lint
npx expo install --check
```

```bash
cd backend
npm run typecheck
npm run build
npm test
```

Mỗi thư mục có `package-lock.json` riêng. Khi tải lại dự án, chạy `npm ci` trong cả `app/` và `backend/` sau khi chọn Node 24.

Chạy `npm audit` trong từng thư mục để xem cảnh báo dependency hiện tại. Không tự chạy `npm audit fix --force` vì có thể thay đổi major ngoài stack đã chọn.

## Tài liệu tham khảo

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/)
- [Cấu hình NativeWind](https://www.nativewind.dev/docs/getting-started/installation)
- [MongoDB với NestJS/Mongoose](https://docs.nestjs.com/techniques/mongodb)
