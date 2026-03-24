# admin-management-center Specification

## Purpose
TBD - created by syncing change integrate-cliproxyapi-management-center. Update Purpose after archive.
## Requirements
### Requirement: Admin Management Center MUST Be Restricted to Authorized Admin Sessions
Dashboard management center SHALL chỉ cho phép truy cập với session có role admin và phải được backend enforcement.

#### Scenario: Admin can access management center
- **WHEN** user đăng nhập với session role `admin`
- **THEN** frontend SHALL hiển thị entry point quản trị
- **AND** backend SHALL cho phép gọi các admin management endpoint

#### Scenario: Non-admin is denied management center access
- **WHEN** user role `user` truy cập route hoặc endpoint quản trị
- **THEN** backend SHALL trả lỗi forbidden/unauthorized
- **AND** frontend SHALL chuyển hướng hoặc ẩn toàn bộ chức năng quản trị

### Requirement: Management Center MUST Support User/Token Operational Actions
Management center SHALL hỗ trợ tối thiểu các thao tác vận hành user/token cốt lõi theo mô hình CPAMC.

#### Scenario: Admin lists users and tokens
- **WHEN** admin mở trang quản trị user/token
- **THEN** hệ thống SHALL trả danh sách user/token với phân trang hoặc giới hạn hợp lý
- **AND** thông tin hiển thị SHALL bao gồm trạng thái hoạt động và mốc thời gian liên quan

#### Scenario: Admin mutates token state
- **WHEN** admin tạo mới, cập nhật, xoay hoặc thu hồi token
- **THEN** backend SHALL gọi management integration tương ứng
- **AND** UI SHALL phản ánh kết quả thành công/thất bại theo từng thao tác

### Requirement: Management Center MUST Expose Core CPAMC Operational Visibility
Management center SHALL cung cấp tối thiểu snapshot vận hành gồm trạng thái kết nối, usage summary và log access cơ bản.

#### Scenario: Admin views operational snapshot
- **WHEN** admin vào dashboard quản trị
- **THEN** hệ thống SHALL hiển thị trạng thái kết nối tới CLIProxyAPI cùng version/capability cơ bản
- **AND** hiển thị usage summary đủ để chẩn đoán nhanh trạng thái hệ thống

#### Scenario: Admin inspects logs with filters
- **WHEN** admin truy cập mục logs và áp dụng từ khóa/lọc cơ bản
- **THEN** backend SHALL trả log stream hoặc log batches theo filter
- **AND** UI SHALL cho phép xem log mà không lộ management credentials

### Requirement: Admin Actions MUST Produce Auditable Outcomes
Mọi thao tác mutate trong management center SHALL tạo sự kiện audit có thể truy vết.

#### Scenario: Token mutation creates audit event
- **WHEN** admin thực hiện thao tác thay đổi token
- **THEN** hệ thống SHALL ghi nhận ai thực hiện, thời điểm, loại thao tác và đối tượng bị tác động
- **AND** dữ liệu nhạy cảm của token SHALL không bị log ở dạng plaintext
