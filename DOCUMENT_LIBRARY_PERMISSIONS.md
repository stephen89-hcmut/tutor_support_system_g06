# Document Library - Role-Based Access Control (RBAC)

## Phân quyền theo Use Cases

### UCD1.1 – AccessLibraryDocuments
**Mô tả**: Người dùng truy cập và xem tài liệu học tập từ thư viện HCMUT

**Actors**: Student, Tutor, Manager

**Permissions**:
- ✅ **Student**: Có thể xem và tìm kiếm tài liệu public
- ✅ **Tutor**: Có thể xem tài liệu public và restricted (nếu được cấp quyền)
- ✅ **Manager**: Có thể xem tất cả tài liệu (public, restricted, private)

**Implementation**:
- Tất cả users có thể search và filter documents
- Access level filter chỉ hiển thị cho Manager
- Documents được filter dựa trên accessLevel và role

---

### UCD1.2 – ShareDocuments
**Mô tả**: Người dùng chia sẻ hoặc tải lên tài liệu học tập cho người khác

**Actors**: Student, Tutor, Manager

**Permissions**:
- ❌ **Student**: KHÔNG có quyền upload tài liệu
- ✅ **Student**: CÓ quyền chia sẻ link tài liệu (share button)
- ✅ **Tutor**: CÓ quyền upload tài liệu mới
- ✅ **Tutor**: CÓ quyền chia sẻ tài liệu
- ✅ **Manager**: Full permissions (upload + share)

**Implementation**:
```typescript
const canUpload = userRole === "Tutor" || userRole === "Manager";
```
- Upload button chỉ hiển thị cho Tutor và Manager
- Share button hiển thị cho tất cả users (UCD1.2 requirement)

---

### UCD1.3 – ManageDocumentAccess
**Mô tả**: Quản lý quyền truy cập và chỉnh sửa tài liệu học tập

**Actor**: Manager ONLY

**Permissions**:
- ❌ **Student**: KHÔNG có quyền manage access
- ❌ **Tutor**: KHÔNG có quyền manage access
- ✅ **Manager**: CÓ quyền manage access cho tất cả documents

**Implementation**:
```typescript
const canManageAccess = userRole === "Manager";
```
- "Manage Access" option trong dropdown menu chỉ hiển thị cho Manager
- ManageAccessModal chỉ có thể được mở bởi Manager
- Manager có thể:
  - Thay đổi access level (public/restricted/private)
  - Cấp quyền theo role (All Students, All Tutors, etc.)
  - Cấp quyền cho individual users

---

### UCD1.3 – Delete Documents
**Mô tả**: Xóa tài liệu khỏi hệ thống

**Permissions**:
- ❌ **Student**: KHÔNG có quyền delete
- ✅ **Tutor**: CÓ quyền delete TÀI LIỆU CỦA CHÍNH MÌNH
- ✅ **Manager**: CÓ quyền delete BẤT KỲ tài liệu nào

**Implementation**:
```typescript
const isOwner = uploadedBy === currentUserName;
const canDelete = userRole === "Manager" || (userRole === "Tutor" && isOwner);
```
- Delete option trong dropdown menu hiển thị based on permissions
- Permission check khi thực hiện delete action

---

### UCE1.1 – ViewAccessRights
**Mô tả**: Xem quyền truy cập của người dùng

**Actor**: Manager ONLY

**Permissions**:
- ❌ **Student**: KHÔNG có quyền view access control
- ❌ **Tutor**: KHÔNG có quyền view access control
- ✅ **Manager**: CÓ quyền view access rights của tất cả documents

**Implementation**:
```typescript
const canViewAccessControl = userRole === "Manager";
```
- Access Level filter chỉ hiển thị cho Manager
- Manager có thể filter documents theo access level (public/restricted/private)

---

### UCE1.2 – UpdateRoleandPermission
**Mô tả**: Chỉnh sửa, thêm mới hoặc gỡ bỏ vai trò và quyền

**Actor**: Manager ONLY

**Permissions**:
- ❌ **Student**: KHÔNG có quyền update roles/permissions
- ❌ **Tutor**: KHÔNG có quyền update roles/permissions
- ✅ **Manager**: CÓ quyền update roles và permissions

**Implementation**:
- ManageAccessModal cho phép Manager cấu hình:
  - Role-based access (All Students, All Tutors, All Managers)
  - Individual user access
  - Access level cho từng document

---

## Bảng Tóm Tắt Permissions

| Feature | Student | Tutor | Manager |
|---------|---------|-------|---------|
| **View Documents** (Public) | ✅ | ✅ | ✅ |
| **View Documents** (Restricted) | ❌ | ✅ (nếu có quyền) | ✅ |
| **View Documents** (Private) | ❌ | ❌ | ✅ |
| **Search & Filter** | ✅ | ✅ | ✅ |
| **Download Documents** | ✅ | ✅ | ✅ |
| **Share Documents** (Link) | ✅ | ✅ | ✅ |
| **Upload Documents** | ❌ | ✅ | ✅ |
| **Delete Own Documents** | ❌ | ✅ | ✅ |
| **Delete Any Documents** | ❌ | ❌ | ✅ |
| **Manage Access Rights** | ❌ | ❌ | ✅ |
| **View Access Control** | ❌ | ❌ | ✅ |
| **Update Permissions** | ❌ | ❌ | ✅ |

---

## Code Implementation

### LibraryScreen.tsx
```typescript
// Permissions based on roles
const canUpload = userRole === "Tutor" || userRole === "Manager"; // UCD1.2
const canManageAccess = userRole === "Manager"; // UCD1.3
const canDelete = userRole === "Manager"; // UCD1.3
const canViewAccessControl = userRole === "Manager"; // UCE1.1
```

### DocumentCard.tsx
```typescript
// Permission logic
const isManager = userRole === "Manager";
const isTutor = userRole === "Tutor";
const isOwner = uploadedBy === currentUserName;

// UCD1.3 - Only Manager can manage access
const canManageAccess = isManager;

// UCD1.3 - Manager can delete any, Tutor can delete own
const canDelete = isManager || (isTutor && isOwner);
```

---

## UI Behavior

### Upload Button
- Hiển thị cho: **Tutor, Manager**
- Ẩn cho: **Student**

### Access Level Filter
- Hiển thị cho: **Manager**
- Ẩn cho: **Student, Tutor**

### Document Actions (Dropdown Menu)
- **View Details**: Tất cả users
- **Manage Access**: Chỉ Manager
- **Delete**: Manager (all docs) hoặc Tutor (own docs only)

### Action Buttons
- **Download**: Tất cả users
- **Share**: Tất cả users

---

## Security Notes

1. **Frontend validation** đã được implement, nhưng trong production cần có **backend validation**
2. Tất cả permission checks nên được thực hiện ở cả frontend và backend
3. Access tokens và user roles nên được verify qua HCMUT SSO
4. Document access logs nên được ghi lại cho audit trail
5. Sensitive documents nên được encrypt khi lưu trữ

---

## Testing Checklist

### As Student
- [ ] Có thể xem documents public
- [ ] KHÔNG thấy upload button
- [ ] KHÔNG thấy manage access option
- [ ] KHÔNG thể delete documents
- [ ] CÓ thể download và share documents

### As Tutor  
- [ ] Có thể xem documents public và restricted (nếu có quyền)
- [ ] THẤY upload button và có thể upload
- [ ] KHÔNG thấy access level filter
- [ ] CÓ thể delete documents của chính mình
- [ ] KHÔNG thể manage access rights

### As Manager
- [ ] Có thể xem TẤT CẢ documents (public/restricted/private)
- [ ] THẤY upload button
- [ ] THẤY access level filter
- [ ] CÓ thể manage access rights cho bất kỳ document nào
- [ ] CÓ thể delete bất kỳ document nào
- [ ] CÓ thể cấp/thu hồi permissions

---

## Related Files

- `/components/screens/LibraryScreen.tsx` - Main library screen với role-based features
- `/components/DocumentCard.tsx` - Document card với permission-based actions
- `/components/ManageAccessModal.tsx` - Modal quản lý access rights (Manager only)
- `/components/UploadDocumentModal.tsx` - Modal upload documents (Tutor, Manager)
- `/components/LanguageContext.tsx` - Translations cho library module
- `/App.tsx` - Pass userRole to LibraryScreen

---

**Last Updated**: 2025-11-02
**Author**: HCMUT Tutor Support System Team
