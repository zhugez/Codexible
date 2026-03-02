# cliproxyapi-token-auth Specification

## Purpose
TBD - created by syncing change integrate-cliproxyapi-management-center. Update Purpose after archive.
## Requirements
### Requirement: Dashboard Login MUST Validate Tokens Through CLIProxyAPI Integration
Hệ thống SHALL xác thực token đăng nhập dashboard bằng tích hợp backend với CLIProxyAPI thay vì dựa vào token mock/local-only.

#### Scenario: Valid CLIProxyAPI token can log in
- **WHEN** user gửi token hợp lệ tại màn hình dashboard login
- **THEN** backend SHALL xác thực token qua integration client với CLIProxyAPI
- **AND** hệ thống SHALL trả về trạng thái đăng nhập hợp lệ cùng metadata user/session cần thiết cho dashboard

#### Scenario: Invalid token is rejected consistently
- **WHEN** user gửi token không hợp lệ hoặc bị thu hồi
- **THEN** backend SHALL trả về trạng thái không hợp lệ
- **AND** frontend SHALL hiển thị lỗi xác thực rõ ràng mà không tạo session hợp lệ

### Requirement: Login Response MUST Include Role-Aware Session Metadata
Luồng xác thực SHALL trả metadata session chuẩn hóa để frontend điều hướng đúng giữa user dashboard và admin dashboard.

#### Scenario: Admin token receives admin role
- **WHEN** token thuộc quyền quản trị theo chính sách backend
- **THEN** auth response SHALL chứa role `admin`
- **AND** frontend SHALL có thể kích hoạt module quản trị dựa trên role này

#### Scenario: Regular token receives user role
- **WHEN** token hợp lệ nhưng không có quyền quản trị
- **THEN** auth response SHALL chứa role `user`
- **AND** frontend SHALL giới hạn truy cập ở phạm vi dashboard người dùng thường

### Requirement: Upstream Validation Failures MUST Be Mapped to Safe Client Errors
Lỗi mạng, timeout hoặc lỗi upstream từ CLIProxyAPI SHALL được map thành response an toàn và nhất quán cho client.

#### Scenario: Upstream timeout during validation
- **WHEN** backend không nhận được phản hồi upstream trong ngưỡng timeout cấu hình
- **THEN** backend SHALL trả mã lỗi dịch vụ tạm thời với thông điệp có thể xử lý
- **AND** frontend SHALL không coi token là hợp lệ

#### Scenario: Upstream unavailable during validation
- **WHEN** CLIProxyAPI upstream không khả dụng
- **THEN** hệ thống SHALL trả trạng thái degraded/temporary failure rõ ràng
- **AND** không được fallback sang token mock trong production mode
