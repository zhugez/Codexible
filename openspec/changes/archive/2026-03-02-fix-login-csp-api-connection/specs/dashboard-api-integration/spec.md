## MODIFIED Requirements

### Requirement: Frontend Dashboard MUST Use Backend APIs as the Source of Truth
Frontend SHALL tiêu thụ dữ liệu auth/dashboard/settings từ backend APIs thống nhất thay vì local-only state cho các chức năng cốt lõi, và frontend security policy SHALL cho phép gọi backend API origin được cấu hình.

#### Scenario: Login flow uses backend validation contract
- **WHEN** user submit token tại dashboard login
- **THEN** frontend SHALL gọi backend auth endpoint chuẩn hóa
- **AND** kết quả điều hướng SHALL dựa trên auth response từ backend

#### Scenario: Dashboard overview loads from backend contract
- **WHEN** user đã có session/token hợp lệ
- **THEN** frontend SHALL tải dashboard overview qua backend API
- **AND** dữ liệu hiển thị SHALL phản ánh trạng thái từ backend thay vì token mock local

#### Scenario: Backend API origin is permitted by CSP
- **WHEN** frontend chạy khác origin với backend API theo cấu hình
- **THEN** browser request tới backend SHALL không bị chặn bởi CSP `connect-src`
- **AND** dashboard/auth requests SHALL tiếp cận được backend theo contract chuẩn hóa

### Requirement: Dashboard MUST Handle Integration Errors with Deterministic UX
Frontend SHALL hiển thị trạng thái lỗi/retry rõ ràng khi backend hoặc upstream integration gặp sự cố, bao gồm trường hợp request bị chặn bởi browser policy.

#### Scenario: Backend returns temporary integration failure
- **WHEN** request dashboard/auth gặp lỗi tạm thời từ integration layer
- **THEN** frontend SHALL hiển thị thông điệp degraded/retry nhất quán
- **AND** không được hiển thị dữ liệu giả gây hiểu nhầm là dữ liệu thật

#### Scenario: Unauthorized token during refresh
- **WHEN** token/session trở nên không hợp lệ trong lúc sử dụng dashboard
- **THEN** frontend SHALL reset trạng thái nhạy cảm và yêu cầu đăng nhập lại
- **AND** không tiếp tục gọi API bằng token đã bị từ chối

#### Scenario: Request blocked by CSP or browser network policy
- **WHEN** request tới backend bị chặn do CSP `connect-src` hoặc policy network tương đương
- **THEN** frontend SHALL hiển thị thông điệp lỗi chỉ rõ đây là lỗi kết nối/chính sách thay vì lỗi token
- **AND** SHALL cung cấp hướng dẫn retry hoặc kiểm tra cấu hình API/CSP
