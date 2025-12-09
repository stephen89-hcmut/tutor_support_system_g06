namespace TutorSupportSystem.Domain.Enums;

public enum MeetingStatus
{
Open = 0,               // Đang mở đăng ký (Current < Max)
        Full = 1,               // Đã đủ chỗ (Current == Max)
        Confirmed = 2,          // Đã chốt tổ chức (>= Min Capacity, qua mốc 24h)
        InProgress = 3,         // Đang diễn ra
        Completed = 4,          // Đã kết thúc & chờ feedback
        CancelledBySystem = 5,  // Hủy tự động do thiếu người (< Min)
        CancelledByTutor = 6    // Hủy do Tutor bận đột xuất 
}
