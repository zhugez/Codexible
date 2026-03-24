## Why

Hệ thống hiện dùng token nội bộ/mock cho luồng dashboard nên chưa đồng bộ với nguồn token thật từ CLIProxyAPI và chưa có trung tâm quản trị admin tương đương CPAMC. Cần tích hợp ngay để user đăng nhập bằng token phát hành thực tế, frontend/backend nhất quán dữ liệu, và admin có công cụ quản lý user/token tập trung.

## What Changes

- Tích hợp backend với CLIProxyAPI để xác thực token đăng nhập và lấy metadata user/token phục vụ dashboard.
- Chuẩn hóa frontend login/dashboard để dùng luồng backend thật (không phụ thuộc localStorage/mock token cho môi trường vận hành).
- Bổ sung khu vực dashboard admin cho quản lý user/token và các thao tác quản trị cốt lõi theo mô hình CLI Proxy API Management Center (CPAMC).
- Thêm lớp cấu hình, quyền truy cập và xử lý lỗi khi upstream CLIProxyAPI/CPAMC không khả dụng.
- Đồng bộ contract API giữa frontend và backend cho user thường và admin.

## Capabilities

### New Capabilities
- `cliproxyapi-token-auth`: Đăng nhập dashboard bằng token do CLIProxyAPI phát hành, qua backend validation/upstream integration.
- `admin-management-center`: Dashboard admin quản lý user/token và các thao tác quản trị chính theo mô hình CPAMC.
- `dashboard-api-integration`: Frontend dashboard sử dụng API backend thống nhất cho auth, profile, token state và admin data.

### Modified Capabilities
- None.

## Impact

- Frontend: `app/dashboard/login`, `app/dashboard/*`, `app/lib/api.ts`, các màn hình/settings liên quan key/token/admin.
- Backend: `backend/src/routes/*`, `backend/src/services/*`, `backend/src/extractors/auth.rs`, model/DTO cho user-token-admin data.
- Cấu hình hệ thống: biến môi trường endpoint/credential để kết nối CLIProxyAPI và CPAMC.
- Rủi ro tích hợp: độ trễ upstream, lỗi mạng, lệch schema dữ liệu từ hệ thống ngoài cần được kiểm soát bằng fallback/error mapping rõ ràng.
