# Quick Start: Test Change/Cancel Meeting

## 🚀 Cách Test Nhanh

### Bước 1: Đăng Nhập
1. Click "Sign in with HCMUT SSO"
2. Đợi 2 giây để auto-login

### Bước 2: Vào Trang Demo
1. Nhìn sidebar bên trái
2. Click "**Meeting Actions Demo**" (menu thứ 3)
3. Bạn sẽ thấy:
   - Danh sách 3 meetings
   - Notification Settings panel bên phải
   - Activity Flow instructions ở dưới

### Bước 3: Test Change Meeting (Đổi Lịch)

#### 3.1. Từ Demo Page:
```
1. Click vào một meeting card
2. Card sẽ highlight màu xanh
3. Click button "Change Time" (màu xanh)
   HOẶC click menu "..." → "Reschedule"
```

#### 3.2. Reschedule Screen:
```
4. Chọn ngày mới từ calendar
5. Chọn time slot mới
6. Nhập lý do (bắt buộc)
7. Click "Confirm Reschedule"
```

#### 3.3. Test Conflict Detection:
```
8. Thử chọn: Oct 29, 2025 - 09:00 AM
   ➡️ Sẽ thấy:
   - Alert đỏ: "Conflicts with Dr. Tran Minh"
   - Button "Confirm Reschedule" disabled
   - Toast error

9. Chọn time slot khác (ví dụ: 10:00 AM)
   ➡️ Conflict error biến mất
   ➡️ Button enabled lại
```

#### 3.4. Confirmation:
```
10. Click "Confirm Reschedule"
11. Xem modal so sánh:
    - Meeting cũ (màu đỏ)
    - Meeting mới (màu xanh)
    - Lý do đổi lịch
12. Click "Confirm Reschedule" trong modal
```

#### 3.5. Success:
```
13. ✅ Toast success xuất hiện
14. ✅ Console logs notification sent
15. ✅ Quay về dashboard
```

### Bước 4: Test Cancel Meeting (Hủy Lịch)

#### 4.1. Từ Demo Page:
```
1. Click vào một meeting card
2. Click button "Cancel" (màu đỏ)
   HOẶC click menu "..." → "Cancel"
```

#### 4.2. Cancel Modal:
```
3. Chọn ai yêu cầu hủy:
   - Student Request
   - Tutor Request  
   - System Issue / Administrative

4. Nhập lý do hủy (bắt buộc)

5. Toggle "Notify Student & Tutor":
   - ON: Gửi thông báo qua email + push
   - OFF: Không gửi thông báo

6. Click "Cancel Meeting"
```

#### 4.3. Success:
```
7. ✅ Toast success xuất hiện
8. ✅ Console logs notification sent (nếu notify ON)
9. ✅ Quay về dashboard
```

### Bước 5: Test Notification System

#### 5.1. Silent Mode:
```
1. Trong Notification Settings panel
2. Click "Silent Mode" → Turn ON
3. Thử reschedule/cancel một meeting
4. ✅ Console log: "Silent mode active - notification queued"
5. Click "Silent Mode" → Turn OFF
6. Click "Retry Failed Notifications"
7. ✅ Notification được gửi từ queue
```

#### 5.2. Multi-channel:
```
1. Ensure Email + Push đều checked
2. Reschedule một meeting
3. ✅ Toast hiển thị: "Email: ✓ | Push: ✓"
4. ✅ Console log show cả 2 channels
```

#### 5.3. Retry Logic:
```
1. Mở Console (F12)
2. Xem logs khi send notification
3. Nếu có fail, sẽ tự động add to retry queue
4. Click "Retry Failed Notifications"
5. ✅ System thử gửi lại
```

## 📝 Console Logs Cần Chú Ý

### Reschedule Success:
```
Profile menu: Navigate to profile clicked
App: Navigating to profile screen
App: Rendering screen: meetingActionsDemo
[NotificationSystem] Sending notification: {type: "reschedule", ...}
[NotificationSystem] Email sent to: ["Nguyen Van A", "Dr. Tran Minh"]
[NotificationSystem] Push sent
[NotificationSystem] Notification sent successfully: {email: true, push: true}
```

### Conflict Detection:
```
[RescheduleMeeting] Checking for conflicts: date=2025-10-29, time=09:00 AM
[RescheduleMeeting] Conflict found with: Dr. Tran Minh
```

### Cancel Success:
```
[NotificationSystem] Sending notification: {type: "cancel", ...}
[NotificationSystem] Email sent to: ["Nguyen Van A", "Dr. Tran Minh"]
[NotificationSystem] Push sent
[NotificationSystem] Notification sent successfully: {email: true, push: true}
```

## 🎯 Các Tính Năng Đã Implement

### ✅ Change Meeting (Đổi Lịch)
- [x] Calendar selection
- [x] Time slot selection
- [x] Conflict detection (kiểm tra trùng lịch)
- [x] Validation
- [x] Confirmation modal
- [x] Notification system
- [x] Success feedback

### ✅ Cancel Meeting (Hủy Lịch)
- [x] Cancel reason selection
- [x] Text reason input
- [x] Notification toggle
- [x] Confirmation modal
- [x] Notification system
- [x] Success feedback

### ✅ Notification System
- [x] Silent Mode (tạm tắt thông báo)
- [x] Multi-channel (Email + Push)
- [x] Retry logic (tự động gửi lại khi fail)
- [x] Notification queue
- [x] Success/Error handling

### ✅ According to Activity Diagram
- [x] Mở danh sách meetings
- [x] Chọn một meeting
- [x] Hiển thị các tùy chọn
- [x] Chọn thời gian mới
- [x] Kiểm tra hợp lệ
- [x] Báo lỗi trùng lịch
- [x] Quay lại chọn thời gian
- [x] Lưu lịch mới
- [x] Yêu cầu xác nhận
- [x] Nhận thông báo thành công
- [x] Xóa buổi gặp khỏi hệ thống

## 🔍 Troubleshooting

### Không thấy menu "Meeting Actions Demo"
- Đảm bảo đã đăng nhập
- Check sidebar bên trái
- Refresh trang

### Conflict detection không hoạt động
- Mở Console (F12)
- Xem logs
- Kiểm tra xem có error không

### Notification không gửi
- Check Notification Settings
- Đảm bảo Silent Mode = OFF
- Check console logs

### Toast không hiển thị
- Check xem có `<Toaster />` component không
- Xem console có error không

## 📚 Tài Liệu Chi Tiết

Xem file `/CHANGE_CANCEL_MEETING_GUIDE.md` để biết:
- Implementation details
- API integration points
- Translation keys
- Full activity diagram mapping
- Advanced testing scenarios

## 🎨 UI Components Used

1. **Calendar** (shadcn/ui) - Date selection
2. **Button** - Actions
3. **Card** - Meeting cards, info display
4. **Alert** - Conflict warnings
5. **Dialog/Modal** - Confirmations
6. **Badge** - Status indicators
7. **Textarea** - Reason input
8. **RadioGroup** - Cancel reason selection
9. **Switch** - Notification toggle
10. **DropdownMenu** - Meeting actions

## 💡 Tips

1. **Conflict Detection**: Thử chọn các time slots khác nhau để test
2. **Notification System**: Bật/tắt Silent Mode để xem khác biệt
3. **Console Logs**: Luôn mở Console để debug
4. **Toast Messages**: Chú ý các toast notifications
5. **Modal Confirmations**: Đọc kỹ thông tin trước khi confirm

---

**Happy Testing! 🎉**

Nếu có vấn đề, check:
1. Console logs
2. `/CHANGE_CANCEL_MEETING_GUIDE.md`
3. Activity Diagram trong requirements
