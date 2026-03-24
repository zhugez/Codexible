# dashboard-api-integration Specification

## Purpose
TBD - created by syncing change integrate-cliproxyapi-management-center. Update Purpose after archive.
## Requirements
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

### Requirement: Settings Token Management MUST Use Server-Backed Operations
Mục quản lý token trong dashboard/settings SHALL dùng API backend thay cho `localStorage`-only workflow.

#### Scenario: User lists own tokens
- **WHEN** user mở tab quản lý token
- **THEN** frontend SHALL fetch danh sách token từ backend
- **AND** danh sách SHALL thể hiện prefix/status/timestamps từ server data

#### Scenario: User creates and revokes tokens
- **WHEN** user thao tác tạo mới hoặc thu hồi token
- **THEN** frontend SHALL gọi backend mutation endpoints tương ứng
- **AND** UI SHALL cập nhật theo response thực tế của server

### Requirement: Role-Based UI Composition MUST Be Driven by Session Metadata
Frontend dashboard SHALL render module theo role backend trả về, bao gồm mở rộng admin modules khi role là admin.

#### Scenario: Admin sees admin modules
- **WHEN** session role là `admin`
- **THEN** frontend SHALL render navigation/module quản trị
- **AND** module quản trị SHALL dùng admin API contract tương ứng

#### Scenario: User does not see admin modules
- **WHEN** session role là `user`
- **THEN** frontend SHALL không render module quản trị
- **AND** mọi nỗ lực truy cập route admin SHALL bị chặn bởi backend authorization

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
