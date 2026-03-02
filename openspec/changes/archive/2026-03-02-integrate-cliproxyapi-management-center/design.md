## Context

Hiện tại luồng dashboard đang pha trộn giữa backend thật và dữ liệu/mock token phía frontend:

- Login gọi `POST /api/auth/validate` nhưng nếu backend lỗi sẽ fallback sang token mock.
- Dashboard settings quản lý API key bằng `localStorage`, chưa đồng bộ với backend.
- Chưa có khu admin để vận hành CLIProxyAPI Management Center (CPAMC) features.

Yêu cầu mới cần tích hợp với hệ sinh thái CLIProxyAPI/CPAMC:

- User đăng nhập bằng token phát hành từ CLIProxyAPI.
- Frontend/backend dùng contract API thống nhất.
- Admin có khả năng quản lý user/token và các chức năng vận hành chính của Management API.

Ràng buộc quan trọng:

- Management key của CLIProxyAPI là bí mật vận hành, không được lộ ở frontend.
- Tính năng phải chịu được lỗi mạng/upstream timeout từ CLIProxyAPI.
- Cần giữ tương thích luồng dashboard hiện có trong giai đoạn chuyển đổi.

## Goals / Non-Goals

**Goals:**
- Xác thực token dashboard dựa trên CLIProxyAPI thay vì token mock/local-only.
- Chuẩn hóa API backend cho login, profile, token metadata, admin management data/actions.
- Thêm admin dashboard với các chức năng quản trị cốt lõi theo mô hình CPAMC.
- Tách bạch quyền user/admin và bảo vệ management operations bằng backend authorization.
- Chuẩn hóa lỗi và trạng thái degraded khi upstream không khả dụng.

**Non-Goals:**
- Clone 100% toàn bộ giao diện CPAMC trong một lần triển khai.
- Thay đổi toàn bộ business logic metering nội bộ hiện có trong phase đầu.
- Mở quyền gọi trực tiếp Management API từ browser bằng management key.
- Thiết kế lại toàn bộ UI dashboard ngoài phạm vi auth/admin integration.

## Decisions

1. Dùng backend làm lớp tích hợp duy nhất với CLIProxyAPI/CPAMC.
- Decision: Frontend chỉ gọi backend nội bộ; backend gọi upstream CLIProxyAPI endpoint và `/v0/management` khi cần.
- Rationale: Bảo mật management key và thống nhất error handling/rate-limit/retry.
- Alternative considered:
  - Frontend gọi trực tiếp CPAMC API: loại vì lộ secret và khó kiểm soát quyền.

2. Chuẩn hóa hai luồng token: user token và management key.
- Decision: User login xác thực bằng token do user nhập; các thao tác admin dùng management channel ở backend với key cấu hình server-side.
- Rationale: Phù hợp mô hình CLIProxyAPI (management key tách biệt api-keys).
- Alternative considered:
  - Dùng chung một token cho mọi thao tác: loại vì rủi ro bảo mật và quyền hạn không rõ ràng.

3. Thêm role-based access cho dashboard route.
- Decision: Backend trả `role` trong auth/session response; frontend điều hướng module admin theo role.
- Rationale: Tránh hardcode UI admin và cho phép backend kiểm soát quyền tập trung.
- Alternative considered:
  - Chỉ ẩn/hiện bằng frontend flag: loại vì không đủ an toàn.

4. Xây dựng Admin Management MVP theo lát cắt CPAMC có giá trị vận hành cao.
- Decision: MVP bao gồm các nhóm chính: connection/system status, API key management, usage snapshot, log access, và user/token overview.
- Rationale: Bao phủ nhu cầu vận hành thiết yếu trước, tránh phạm vi quá lớn.
- Alternative considered:
  - Triển khai toàn bộ tab CPAMC ngay lập tức: loại vì rủi ro timeline và độ phức tạp cao.

5. Giữ chế độ chuyển đổi có kiểm soát bằng feature flag.
- Decision: Bật/tắt tích hợp bằng env flag và fallback có giới hạn khi upstream tạm lỗi.
- Rationale: Giảm rủi ro rollout, hỗ trợ rollback nhanh.
- Alternative considered:
  - Cutover cứng một lần: loại vì khó xử lý sự cố production.

## Risks / Trade-offs

- [Risk] CLIProxyAPI schema hoặc endpoint behavior thay đổi theo version.
  -> Mitigation: Thêm adapter layer + contract tests và kiểm tra minimum supported version.

- [Risk] Upstream timeout làm login/dashboard chậm hoặc lỗi dây chuyền.
  -> Mitigation: Timeout/retry có ngưỡng, mapping lỗi rõ ràng, degraded mode hữu hạn.

- [Risk] Phân quyền admin không chặt có thể lộ chức năng nhạy cảm.
  -> Mitigation: Enforce authorization ở backend cho mọi admin endpoint; audit log thao tác admin.

- [Trade-off] MVP CPAMC feature subset chưa đầy đủ như UI gốc.
  -> Mitigation: Chia phase rõ ràng và thiết kế API mở rộng dần theo từng nhóm tính năng.

## Migration Plan

1. Bổ sung config/env cho CLIProxyAPI upstream + management credentials.
2. Tạo backend integration client + auth/session endpoints mới theo contract thống nhất.
3. Chuyển frontend login/dashboard/settings từ mock/local sang backend API.
4. Thêm admin dashboard modules và bảo vệ route theo role.
5. Chạy test tích hợp và rollout qua feature flag.
6. Rollback: tắt feature flag để quay về luồng cũ nếu upstream không ổn định.

## Open Questions

- Nguồn xác định role admin chuẩn sẽ dựa trên metadata nào (allowlist, upstream tags, hay mapping nội bộ)?
- Mức độ feature CPAMC cho phase 1 sẽ dừng ở nhóm nào (logs read-only hay có config mutation)?
- Cần đồng bộ usage/quota hiển thị giữa hệ thống nội bộ và CLIProxyAPI theo ưu tiên nguồn dữ liệu nào?
