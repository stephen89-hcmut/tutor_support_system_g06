namespace TutorSupportSystem.Domain.Enums
{
    public enum TutorStatus
    {
        Pending = 0,    // Chờ Manager duyệt
        Approved = 1,   // Đã duyệt (Được phép mở lớp)
        Rejected = 2,   // Từ chối
        Locked = 3      // Bị khóa do vi phạm
    }
}