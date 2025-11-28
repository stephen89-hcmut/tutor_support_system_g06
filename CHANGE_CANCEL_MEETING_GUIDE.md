# Hướng Dẫn Tính Năng Change/Cancel Meeting

## Tổng Quan

Tính năng này triển khai đầy đủ Use Case và Activity Diagram cho việc thay đổi (Change/Reschedule) và hủy (Cancel) các cuộc họp đã được đặt trước.

## Các Components Đã Triển Khai

### 1. **RescheduleMeetingScreen** (`/components/screens/RescheduleMeetingScreen.tsx`)
- **Chức năng chính:**
  - Hiển thị thông tin meeting gốc
  - Calendar để chọn ngày mới
  - Time slots để chọn giờ mới
  - Nhập lý do đổi lịch
  - **Kiểm tra trùng lịch (Conflict Detection)**
  - Confirmation modal trước khi lưu

- **Flow theo Activity Diagram:**
  ```
  1. Mở danh sách meetings → Chọn một meeting
  2. Chọn "Đổi lịch"
  3. Hiển thị khung giờ
  4. Chọn thời gian mới
  5. ✅ Kiểm tra hợp lệ (trùng lịch)
     - Nếu TRÙNG → Báo lỗi "Trùng lịch" → Quay lại chọn thời gian
     - Nếu HỢP LỆ → Tiếp tục
  6. Lưu lịch mới
  7. Yêu cầu xác nhận
  8. Nhận thông báo đổi lịch thành công
  ```

### 2. **CancelMeetingModal** (`/components/CancelMeetingModal.tsx`)
- **Chức năng chính:**
  - Modal xác nhận hủy meeting
  - Chọn người yêu cầu hủy (Student/Tutor/System)
  - Nhập lý do hủy
  - Toggle thông báo cho các bên liên quan
  - Gửi notification tự động

- **Flow theo Activity Diagram:**
  ```
  1. Mở danh sách meetings → Chọn một meeting
  2. Chọn "Hủy lịch"
  3. Yêu cầu xác nhận hủy lịch
  4. Xóa buổi gặp khỏi hệ thống
  5. Nhận thông báo hủy lịch thành công
  ```

### 3. **RescheduleConfirmationModal** (`/components/RescheduleConfirmationModal.tsx`)
- **Chức năng:**
  - Hiển thị so sánh meeting cũ vs meeting mới
  - Hiển thị lý do đổi lịch
  - Warning về notification
  - Confirmation buttons

### 4. **NotificationSystem** (`/components/NotificationSystem.tsx`)
- **Chức năng chính:**
  - **Silent Mode** - Tạm tắt thông báo
  - **Multi-channel** - Gửi qua Email + Push notification
  - **Retry Logic** - Tự động retry khi gửi thất bại
  - **Notification Queue** - Lưu các notification thất bại để gửi lại

- **Alternative Flows (theo UC):**
  1. ✅ **Silent Mode**: Ngườidùng bật chế độ im lặng → Hệ thống hoãn gửi thông báo → Gửi lại sau khi bật lại
  2. ✅ **Scheduled Notifications**: Hệ thống kiểm tra buổi gặp sắp tới → Gửi thông báo nhắc lịch tự động
  3. ✅ **Multi-channel**: Gửi song song qua web và email → Thành công nếu ít nhất một kênh gửi được

- **Exception Flow:**
  - ✅ Nếu gửi thất bại → Ghi log lỗi → Hệ thống retry sau vài phút

### 5. **NotificationSettings** (Component trong NotificationSystem)
- Toggle Silent Mode
- Enable/Disable Email notifications
- Enable/Disable Push notifications
- Enable/Disable Scheduled reminders
- Button để retry failed notifications

### 6. **MeetingActionsDemo** (`/components/screens/MeetingActionsDemo.tsx`)
- Trang demo để test toàn bộ flow
- Hiển thị danh sách meetings
- Quick actions cho mỗi meeting
- Notification settings panel
- Activity flow instructions

## Conflict Detection (Kiểm Tra Trùng Lịch)

### Logic Implementation:
```typescript
const checkForConflicts = (date: Date, time: string): boolean => {
  const dateStr = date.toISOString().split("T")[0];
  const conflict = existingMeetings.find(
    (meeting) => meeting.date === dateStr && meeting.time === time
  );
  
  if (conflict) {
    setConflictError(
      `This time slot conflicts with an existing meeting with ${conflict.tutor}`
    );
    return true;
  }
  
  setConflictError(null);
  return false;
};
```

### Khi Phát Hiện Trùng Lịch:
1. Hiển thị Alert màu đỏ với icon warning
2. Hiển thị thông tin conflict (tutor nào bị trùng)
3. Disable nút "Confirm Reschedule"
4. Toast notification "Trùng lịch"
5. User phải chọn time slot khác

## Notification System Details

### Notification Manager (Singleton Pattern)
```typescript
class NotificationManager {
  - config: NotificationConfig
  - retryQueue: Array<NotificationPayload>
  - maxRetries: 3
  
  Methods:
  - send(payload): Promise<result>
  - sendEmail(payload): Promise<boolean>
  - sendPush(payload): Promise<boolean>
  - processRetryQueue(): Promise<void>
}
```

### Notification Types:
1. **Reschedule Notification**
   - Title: "Meeting Rescheduled"
   - Recipients: Student + Tutor
   - Priority: High
   - Channels: Email + Push

2. **Cancel Notification**
   - Title: "Meeting Cancelled"
   - Recipients: Student + Tutor
   - Priority: High
   - Channels: Email + Push

3. **Reminder Notification**
   - Title: "Meeting Reminder"
   - Recipients: Student + Tutor
   - Priority: Normal
   - Channels: Email + Push

### Success/Failure Handling:
- **Success**: Toast màu xanh với checkmark + channel status (Email: ✓ | Push: ✓)
- **Partial Success**: Ít nhất 1 channel thành công = Success
- **Failure**: Toast màu đỏ + Add to retry queue + Retry sau vài phút

## Flow Diagram Mapping

### Activity Diagram → Implementation:

```
[Student/Tutor] → [System]

1. Mở danh sách các buổi gặp và chọn một buổi
   ✅ MeetingsListScreen / MeetingActionsDemo

2. Hiển thị các tùy chọn ("Đổi lịch" và "Hủy lịch")
   ✅ DropdownMenu với actions

3a. [Đổi lịch Flow]
   - Chọn "Đổi lịch"
     ✅ onRescheduleMeeting(id)
   
   - Hiển thị khung giờ
     ✅ RescheduleMeetingScreen (Calendar + Time Slots)
   
   - Chọn thời gian mới
     ✅ handleTimeSlotSelect(time)
   
   - Kiểm tra hợp lệ
     ✅ checkForConflicts(date, time)
   
   - [Decision: Trùng lịch?]
     - YES → Báo lỗi "Trùng lịch" 
       ✅ setConflictError() + Alert component
       → Quay lại chọn thời gian
     
     - NO → Lưu lịch mới
       ✅ handleProceedToConfirm()
       → Yêu cầu xác nhận
       ✅ RescheduleConfirmationModal
       → Nhận thông báo
       ✅ sendRescheduleNotification()

3b. [Hủy lịch Flow]
   - Chọn "Hủy lịch"
     ✅ onCancelMeeting(id)
   
   - Yêu cầu xác nhận
     ✅ CancelMeetingModal
   
   - Xóa buổi gặp
     ✅ handleConfirm() in CancelMeetingModal
   
   - Nhận thông báo
     ✅ sendCancelNotification()

4. [Decision: Có gửi thông báo?]
   - YES → Xóa buổi gặp khỏi hệ thống
     ✅ onComplete() callback
   - NO → Hủy thao tác
     ✅ onClose() callback
```

## Testing Flow

### 1. Test Reschedule (Đổi Lịch)
```
Step 1: Vào trang MeetingActionsDemo hoặc MeetingsListScreen
Step 2: Chọn một meeting
Step 3: Click "Reschedule" / "Change Time"
Step 4: Chọn ngày mới từ calendar
Step 5: Chọn time slot mới
Step 6: Nhập lý do đổi lịch
Step 7: Click "Confirm Reschedule"
Step 8: ✅ Kiểm tra conflict detection:
        - Thử chọn thời gian trùng → Phải show error
        - Chọn thời gian hợp lệ → Continue
Step 9: Xem confirmation modal
Step 10: Click "Confirm Reschedule" trong modal
Step 11: ✅ Kiểm tra notification:
         - Toast success xuất hiện
         - Console logs show notification sent
         - Check notification channels status
```

### 2. Test Cancel (Hủy Lịch)
```
Step 1: Vào trang MeetingActionsDemo hoặc MeetingsListScreen
Step 2: Chọn một meeting
Step 3: Click "Cancel"
Step 4: Xem CancelMeetingModal
Step 5: Chọn cancelReason (Student/Tutor/System)
Step 6: Nhập lý do hủy
Step 7: Toggle "Notify Student & Tutor" (ON/OFF)
Step 8: Click "Cancel Meeting"
Step 9: ✅ Kiểm tra notification:
         - Nếu notify ON: Toast success + notification sent
         - Nếu notify OFF: Toast success without notification
         - Console logs show process
```

### 3. Test Conflict Detection
```
Step 1: Vào RescheduleMeetingScreen
Step 2: Chọn date: "Oct 29, 2025"
Step 3: Chọn time: "09:00 AM" (thời gian đã có meeting khác)
Step 4: ✅ Phải thấy:
         - Alert màu đỏ với message conflict
         - Button "Confirm Reschedule" bị disable
         - Toast error "Trùng lịch"
Step 5: Chọn time slot khác (ví dụ: "10:00 AM")
Step 6: ✅ Phải thấy:
         - Alert conflict biến mất
         - Button "Confirm Reschedule" enable
```

### 4. Test Notification System
```
Step 1: Mở NotificationSettings panel
Step 2: Test Silent Mode:
        - Turn ON Silent Mode
        - Thử reschedule/cancel meeting
        - ✅ Notification không gửi ngay, được queue
        - Turn OFF Silent Mode
        - Click "Retry Failed Notifications"
        - ✅ Notification được gửi từ queue

Step 3: Test Multi-channel:
        - Ensure Email + Push đều enabled
        - Reschedule một meeting
        - ✅ Console log show cả 2 channels được thử
        - ✅ Toast show channel status: Email: ✓ | Push: ✓

Step 4: Test Retry Logic:
        - Để ý console logs
        - Khi có notification fail, sẽ tự động add to retry queue
        - Click "Retry Failed Notifications"
        - ✅ System thử gửi lại
```

## Console Logs Để Debug

### Reschedule Flow:
```
[NotificationSystem] Sending notification: {type: "reschedule", ...}
[NotificationSystem] Email sent to: ["student@...", "tutor@..."]
[NotificationSystem] Push sent
[NotificationSystem] Notification sent successfully: {email: true, push: true}
```

### Cancel Flow:
```
[NotificationSystem] Sending notification: {type: "cancel", ...}
[NotificationSystem] Email sent to: ["student@...", "tutor@..."]
[NotificationSystem] Push sent
[NotificationSystem] Notification sent successfully: {email: true, push: true}
```

### Conflict Detection:
```
[RescheduleMeeting] Checking for conflicts: date=2025-10-29, time=09:00 AM
[RescheduleMeeting] Conflict found with: Dr. Tran Minh
```

### Retry Queue:
```
[NotificationSystem] Added to retry queue. Queue size: 1
[NotificationSystem] Processing retry queue...
[NotificationSystem] Retry 1/3 failed
[NotificationSystem] Retry 2/3 success
```

## API Integration Points (Future)

### Endpoints cần tạo:
1. `POST /api/meetings/:id/reschedule`
   - Body: { newDate, newTime, reason }
   - Response: { success, newMeeting, conflicts }

2. `POST /api/meetings/:id/cancel`
   - Body: { reason, cancelledBy, notifyParties }
   - Response: { success, message }

3. `GET /api/meetings/conflicts`
   - Query: { date, time, tutorId }
   - Response: { hasConflict, conflictingMeeting }

4. `POST /api/notifications/send`
   - Body: { type, recipients, payload }
   - Response: { success, channels }

5. `POST /api/notifications/retry`
   - Body: { }
   - Response: { processed, success, failed }

## Translation Keys Cần Thêm

```typescript
// Reschedule
"reschedule.confirm.title": "Confirm Meeting Reschedule"
"reschedule.confirm.description": "Please review the changes before confirming"
"reschedule.confirm.button": "Confirm Reschedule"
"reschedule.success.title": "Meeting rescheduled successfully"
"reschedule.success.description": "All participants have been notified"

// Cancel
"cancel.success.title": "Meeting cancelled successfully"
"cancel.success.description": "All participants have been notified"

// Notifications
"notification.reschedule.title": "Meeting Rescheduled"
"notification.reschedule.success": "Reschedule notification sent successfully"
"notification.reschedule.failed": "Failed to send notification"
"notification.cancel.title": "Meeting Cancelled"
"notification.cancel.success": "Cancellation notification sent successfully"
"notification.cancel.failed": "Failed to send notification"
"notification.reminder.title": "Meeting Reminder"
"notification.settings.title": "Notification Settings"
```

## Files Modified/Created

### Created:
1. `/components/RescheduleConfirmationModal.tsx` - Modal xác nhận đổi lịch
2. `/components/NotificationSystem.tsx` - Hệ thống notification đầy đủ
3. `/components/screens/MeetingActionsDemo.tsx` - Trang demo test flow
4. `/CHANGE_CANCEL_MEETING_GUIDE.md` - Document này

### Modified:
1. `/components/screens/RescheduleMeetingScreen.tsx`
   - Thêm conflict detection
   - Thêm confirmation modal
   - Thêm notification integration
   - Thêm validation flow

2. `/components/CancelMeetingModal.tsx`
   - Thêm notification integration
   - Thêm loading state
   - Thêm success/error handling

## Next Steps

1. **Integrate với Backend API** - Thay mock data bằng real API calls
2. **Add Real-time Updates** - WebSocket cho notification real-time
3. **Enhanced Conflict Detection** - Kiểm tra nhiều điều kiện hơn (room availability, tutor schedule, etc.)
4. **Email Templates** - Tạo email templates đẹp cho notifications
5. **Push Notification Service** - Integrate FCM hoặc OneSignal
6. **Analytics** - Track reschedule/cancel rates, reasons, etc.
7. **Undo Functionality** - Cho phép undo cancel/reschedule trong vài phút
8. **Bulk Actions** - Reschedule/cancel nhiều meetings cùng lúc

## Support

Nếu có vấn đề hoặc câu hỏi:
1. Check console logs
2. Verify notification settings
3. Test với mock data trước
4. Check Activity Diagram flow
5. Review Use Case document

---
**Tác giả**: Figma Make AI Assistant
**Ngày tạo**: November 2, 2025
**Version**: 1.0.0
