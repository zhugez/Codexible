## Context

Frontend hiện đặt CSP toàn cục trong `next.config.ts` với `connect-src 'self'`, trong khi login/dashboard gọi backend qua `NEXT_PUBLIC_API_URL` (ví dụ `http://localhost:3001`). Kết quả là request auth bị chặn bởi browser policy trước khi đến backend và user không thể login.

Ngoài ra, console còn có nhiều log từ browser extension (`Unchecked runtime.lastError`, `lockdown-install.js`) dễ gây nhầm lẫn với lỗi app thật. Cần tách rõ lỗi do policy/network của app với lỗi ngoài phạm vi hệ thống.

## Goals / Non-Goals

**Goals:**
- Cho phép frontend gọi backend API origin được cấu hình mà vẫn giữ CSP chặt chẽ.
- Đảm bảo login/dashboard hiển thị thông điệp lỗi rõ ràng khi request bị chặn bởi CSP hoặc lỗi mạng.
- Cập nhật hướng dẫn debug để phân biệt lỗi app với lỗi extension-origin.
- Giữ tương thích với luồng auth/backend contract hiện tại.

**Non-Goals:**
- Tắt CSP hoặc nới lỏng bằng wildcard (`*`) trong `connect-src`.
- Sửa trực tiếp lỗi phát sinh từ browser extensions/SES của bên thứ ba.
- Thay đổi business logic xác thực token của backend.

## Decisions

1. Dùng CSP `connect-src` theo allowlist từ cấu hình API URL.
- Decision: Parse `NEXT_PUBLIC_API_URL` thành origin và thêm origin này vào `connect-src` cùng với `'self'`.
- Rationale: Giải quyết lỗi blocked request mà vẫn giữ chính sách tối thiểu cần thiết.
- Alternatives considered:
  - Dùng `connect-src *`: loại vì rủi ro bảo mật cao.
  - Chỉ giữ `'self'`: loại vì không tương thích khi backend chạy khác origin.

2. Giữ CSP tập trung một nơi (security headers), không hardcode ở nhiều module.
- Decision: Tạo builder/pattern tạo CSP header nhất quán từ env thay vì rải rác cấu hình.
- Rationale: Tránh drift giữa môi trường và dễ kiểm soát policy khi rollout.
- Alternatives considered:
  - Mỗi route tự set CSP: loại vì khó bảo trì và dễ lệch policy.

3. Chuẩn hóa error surface cho login khi fetch bị chặn do policy/network.
- Decision: Chuẩn hóa thông điệp lỗi theo nhóm (CSP blocked, backend unavailable, invalid token).
- Rationale: User và vận hành có thể xử lý nhanh thay vì thấy lỗi chung chung.
- Alternatives considered:
  - Chỉ hiện “Invalid token”: loại vì sai bản chất lỗi và gây khó debug.

4. Bổ sung troubleshooting cho console noise ngoài app.
- Decision: Document rõ các mẫu lỗi extension-origin/SES và cách xác nhận lỗi app thật.
- Rationale: Giảm thời gian chẩn đoán sai nguyên nhân.
- Alternatives considered:
  - Bỏ qua tài liệu: loại vì lỗi dạng này lặp lại trong môi trường dev thực tế.

## Risks / Trade-offs

- [Risk] `NEXT_PUBLIC_API_URL` cấu hình sai làm CSP vẫn chặn request.
  -> Mitigation: Validate format origin khi build/start và fallback thông báo cấu hình lỗi rõ ràng.

- [Risk] Nới `connect-src` sai cách làm tăng attack surface.
  -> Mitigation: Chỉ allow origin cụ thể; không dùng wildcard, không mở rộng directive khác.

- [Risk] Chuỗi lỗi CSP khác nhau giữa browser khiến nhận diện khó nhất quán.
  -> Mitigation: Dùng pattern nhận diện đa trình duyệt + fallback message trung tính.

## Migration Plan

1. Cập nhật CSP generation để include backend API origin theo env.
2. Cập nhật login/API client error mapping cho nhánh CSP/network.
3. Cập nhật tài liệu troubleshooting cho extension/SES noise.
4. Deploy frontend và chạy smoke test login bằng token demo + token invalid.
5. Theo dõi console/network logs trong 24h đầu rollout.

Rollback:
- Revert thay đổi CSP/error mapping và redeploy frontend.
- Nếu cần khẩn cấp, tạm đưa frontend gọi backend qua same-origin proxy rồi quay lại policy cũ.

## Open Questions

- Có cần hỗ trợ `ws://`/`wss://` trong `connect-src` cho các tính năng realtime sắp tới không?
- Có nên chuẩn hóa backend proxy qua cùng domain để loại bỏ cross-origin ở production?
