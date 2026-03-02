## Why

Dashboard login hiện bị chặn do Content Security Policy (`connect-src 'self'`) không cho phép gọi API backend tại `http://localhost:3001`, khiến người dùng không thể xác thực token. Đồng thời, các lỗi từ browser extension (`runtime.lastError`, `lockdown-install.js`) làm nhiễu console và khó chẩn đoán lỗi thật.

## What Changes

- Chuẩn hóa CSP cho frontend để `connect-src` cho phép gọi backend API origin được cấu hình (không mở wildcard không cần thiết).
- Đồng bộ policy CSP giữa môi trường dev/prod dựa trên biến môi trường API URL.
- Cải thiện xử lý lỗi login/network để hiển thị thông điệp rõ ràng khi bị chặn bởi CSP hoặc không kết nối được backend.
- Bổ sung hướng dẫn phân biệt lỗi ứng dụng với lỗi phát sinh từ browser extension nhằm giảm nhiễu khi debug.

## Capabilities

### New Capabilities
- `frontend-csp-connect-policy`: Quản lý và thực thi chính sách `connect-src` an toàn nhưng đủ quyền để dashboard gọi backend auth/API endpoints theo cấu hình.

### Modified Capabilities
- `dashboard-api-integration`: Bổ sung yêu cầu tương thích CSP cho luồng gọi backend và yêu cầu thông điệp lỗi chẩn đoán rõ ràng khi request bị chặn bởi policy/network.

## Impact

- Frontend security config: `next.config.ts` (hoặc nơi set security headers/CSP) và biến môi trường liên quan API URL.
- Dashboard/login và API client: `app/dashboard/login/*`, `app/lib/api.ts`, xử lý lỗi fetch/CSP.
- Tài liệu vận hành/debug: cập nhật phần troubleshooting để tách lỗi app với lỗi extension/browser noise.
