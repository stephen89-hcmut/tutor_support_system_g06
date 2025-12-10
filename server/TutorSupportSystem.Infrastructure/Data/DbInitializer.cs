using TutorSupportSystem.Domain.Entities;
using TutorSupportSystem.Domain.Enums;
using TutorSupportSystem.Infrastructure.Database;

namespace TutorSupportSystem.Infrastructure.Data;

public static class DbInitializer
{
    private static readonly Random _random = new();

    private static readonly string[] _firstNames = { "Nguyễn", "Trần", "Lê", "Phạm", "Huỳnh", "Hoàng", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ" };
    private static readonly string[] _middleNames = { "Văn", "Thị", "Hữu", "Đức", "Thanh", "Minh", "Quốc", "Gia", "Bảo", "Ngọc", "Thùy", "Phương" };
    private static readonly string[] _lastNames = { "Tùng", "Hoa", "Nam", "Linh", "Hùng", "Trang", "Tuấn", "Hương", "Sơn", "Ly", "Khanh", "Huy", "Dũng", "Nhi" };

    private static readonly string[] _positiveComments = { "Thầy dạy rất nhiệt tình, dễ hiểu.", "Bài giảng chi tiết, slide đẹp.", "Giải đáp thắc mắc cặn kẽ.", "Rất kiên nhẫn với sinh viên.", "Tuyệt vời, em đã hiểu bài hơn nhiều." };
    private static readonly string[] _neutralComments = { "Thầy dạy hơi nhanh.", "Cần thêm bài tập thực hành.", "Tạm ổn, đủ để qua môn.", "Giọng thầy hơi nhỏ." };
    private static readonly string[] _negativeComments = { "Khó hiểu quá.", "Thầy đến trễ 15 phút.", "Chưa chuẩn bị kỹ bài giảng." };

    public static void Initialize(AppDbContext context)
    {
        if (context.Users.Any()) return; // DB đã có dữ liệu thì bỏ qua seed

        Console.WriteLine("--> Bắt đầu Seed Data...");

        var facultyCS = new Faculty { Id = Guid.NewGuid(), Code = "CSE", Name = "Khoa học & Kỹ thuật Máy tính" };
        var facultyEE = new Faculty { Id = Guid.NewGuid(), Code = "EEE", Name = "Điện - Điện tử" };
        context.Faculties.AddRange(facultyCS, facultyEE);
        context.SaveChanges();

        var subjects = new List<Subject>();

        var genSubjectsData = new[] { "Giải tích 1", "Giải tích 2", "Đại số tuyến tính", "Vật lý 1", "Vật lý 2", "Pháp luật đại cương" };
        foreach (var name in genSubjectsData)
        {
            subjects.Add(new Subject { Id = Guid.NewGuid(), Code = "GEN" + _random.Next(100, 999), Name = name, Type = SubjectType.General, FacultyId = null });
        }

        var csSubjectsData = new[]
        {
            new { N = "Nhập môn Điện toán", T = SubjectType.Fundamental },
            new { N = "Kỹ thuật lập trình", T = SubjectType.Fundamental },
            new { N = "Cấu trúc dữ liệu & Giải thuật", T = SubjectType.Fundamental },
            new { N = "Trí tuệ nhân tạo", T = SubjectType.Specialized },
            new { N = "Công nghệ phần mềm", T = SubjectType.Specialized },
            new { N = "Hệ quản trị Cơ sở dữ liệu", T = SubjectType.Specialized },
            new { N = "Hệ điều hành", T = SubjectType.Specialized }
        };
        foreach (var item in csSubjectsData)
        {
            subjects.Add(new Subject { Id = Guid.NewGuid(), Code = "CO" + _random.Next(2000, 3999), Name = item.N, Type = item.T, FacultyId = facultyCS.Id });
        }

        var ceSubjectsData = new[]
        {
            new { N = "Mạch điện tử", T = SubjectType.Fundamental },
            new { N = "Kiến trúc máy tính", T = SubjectType.Specialized },
            new { N = "Hệ thống nhúng", T = SubjectType.Specialized },
            new { N = "Vi xử lý - Vi điều khiển", T = SubjectType.Specialized },
            new { N = "Thiết kế luận lý", T = SubjectType.Fundamental },
            new { N = "Tín hiệu và Hệ thống", T = SubjectType.Fundamental },
            new { N = "Lý thuyết mạch", T = SubjectType.Fundamental }
        };
        foreach (var item in ceSubjectsData)
        {
            subjects.Add(new Subject { Id = Guid.NewGuid(), Code = "CE" + _random.Next(2000, 3999), Name = item.N, Type = item.T, FacultyId = facultyEE.Id });
        }

        context.Subjects.AddRange(subjects);
        context.SaveChanges();

        var allSubjectNames = subjects.Select(s => s.Name).ToList();

        var users = new List<User>();
        var tutorProfiles = new List<TutorProfile>();
        var studentProfiles = new List<StudentProfile>();

        users.Add(new User
        {
            Id = Guid.NewGuid(),
            SsoId = "SSO_ADMIN",
            Email = "admin@hcmut.edu.vn",
            FullName = "Admin Quản Lý",
            Role = UserRole.Manager,
            IsActive = true,
            AvatarUrl = "https://ui-avatars.com/api/?name=Admin&background=000&color=fff"
        });

        for (int i = 1; i <= 12; i++)
        {
            bool isSeniorStudent = i <= 2;
            string ssoPrefix = isSeniorStudent ? "SSO_TUTOR_STU" : "SSO_TUTOR_LEC";
            string roleTitle = isSeniorStudent ? "Tutor (Senior Student)" : "Tutor (Lecturer)";

            var u = new User
            {
                Id = Guid.NewGuid(),
                SsoId = $"{ssoPrefix}_{i}",
                Email = isSeniorStudent ? $"tutor.student{i}@hcmut.edu.vn" : $"tutor.lecturer{i}@hcmut.edu.vn",
                FullName = GenerateVietnameseName(),
                Role = UserRole.Tutor,
                IsActive = true,
                AvatarUrl = $"https://ui-avatars.com/api/?name=Tutor+{i}&background=random"
            };
            users.Add(u);

            var expertise = new List<string>();
            int expCount = _random.Next(2, 5);
            for (int k = 0; k < expCount; k++) expertise.Add(allSubjectNames[_random.Next(allSubjectNames.Count)]);

            tutorProfiles.Add(new TutorProfile
            {
                UserId = u.Id,
                TutorCode = isSeniorStudent ? (2010000 + i).ToString() : "CB" + (1000 + i),
                Type = isSeniorStudent ? TutorType.SeniorStudent : TutorType.Lecturer,
                Status = TutorStatus.Approved,
                Bio = $"<p>Xin chào, tôi là {roleTitle}. Tôi có kinh nghiệm giảng dạy các môn {string.Join(", ", expertise)}.</p>",
                Expertise = string.Join(",", expertise.Distinct()),
                TeachingMethod = _random.NextDouble() > 0.5 ? "Visual, Practical" : "Logical, Theory-based",
                AverageRating = 5.0,
                TotalReviews = 0,
                TotalTeachingHours = 0
            });
        }

        for (int i = 1; i <= 80; i++)
        {
            var u = new User
            {
                Id = Guid.NewGuid(),
                SsoId = $"SSO_STUDENT_{i}",
                Email = $"student{i}@hcmut.edu.vn",
                FullName = GenerateVietnameseName(),
                Role = UserRole.Student,
                IsActive = true,
                AvatarUrl = $"https://ui-avatars.com/api/?name=Student+{i}&background=random"
            };
            users.Add(u);

            bool isCS = _random.NextDouble() > 0.4;
            var faculty = isCS ? facultyCS : facultyEE;

            var weakSubjects = new List<string>();
            int weakCount = _random.Next(1, 4);
            for (int k = 0; k < weakCount; k++) weakSubjects.Add(allSubjectNames[_random.Next(allSubjectNames.Count)]);

            studentProfiles.Add(new StudentProfile
            {
                UserId = u.Id,
                StudentCode = (2210000 + i).ToString(),
                FacultyId = faculty.Id,
                Major = isCS ? "Khoa học Máy tính" : "Kỹ thuật Điện tử",
                EnrollmentYear = _random.Next(2021, 2024),
                WeakSubjects = string.Join(",", weakSubjects.Distinct()),
                LearningStyles = _random.NextDouble() > 0.5 ? "Visual" : "Auditory"
            });
        }

        context.Users.AddRange(users);
        context.TutorProfiles.AddRange(tutorProfiles);
        context.StudentProfiles.AddRange(studentProfiles);
        context.SaveChanges();

        var materials = new List<Material>();
        foreach (var tp in tutorProfiles)
        {
            if (materials.Count >= 50) break;
            int fileCount = _random.Next(3, 6);
            var subjectExpertise = tp.Expertise?.Split(',').FirstOrDefault() ?? "General";

            for (int k = 0; k < fileCount; k++)
            {
                materials.Add(new Material
                {
                    Title = $"Bài giảng {subjectExpertise} - Chương {k + 1}",
                    FileUrl = "https://example.com/file.pdf",
                    UploadedBy = tp.UserId,
                    CreatedAt = DateTime.UtcNow.AddDays(-_random.Next(10, 200))
                });
            }
        }
        context.Materials.AddRange(materials.Take(50));
        context.SaveChanges();

        var meetings = new List<Meeting>();
        var statuses = Enum.GetValues(typeof(MeetingStatus)).Cast<MeetingStatus>().ToArray();

        for (int i = 0; i < 50; i++)
        {
            var tutor = tutorProfiles[_random.Next(tutorProfiles.Count)];
            var subject = (tutor.Expertise?.Split(',') ?? Array.Empty<string>())[_random.Next(Math.Max(1, tutor.Expertise?.Split(',').Length ?? 1))];
            var status = _random.NextDouble() > 0.4 ? MeetingStatus.Completed : statuses[_random.Next(statuses.Length)];

            DateTime start = status == MeetingStatus.Completed
                ? DateTime.UtcNow.AddDays(-_random.Next(1, 60))
                : DateTime.UtcNow.AddDays(_random.Next(1, 14));

            meetings.Add(new Meeting
            {
                Id = Guid.NewGuid(),
                TutorId = tutor.UserId,
                Title = $"Phụ đạo môn {subject}",
                Description = $"Ôn tập kiến thức và giải bài tập môn {subject}.",
                StartTime = start,
                EndTime = start.AddHours(2),
                Mode = _random.NextDouble() > 0.5 ? MeetingMode.Online : MeetingMode.InPerson,
                Location = _random.NextDouble() > 0.5 ? "Zoom Meeting" : "Phòng H6-XXX",
                MinCapacity = 6,
                MaxCapacity = 10,
                CurrentCount = 0,
                Status = status
            });
        }
        context.Meetings.AddRange(meetings);
        context.SaveChanges();

        var participants = new List<Participant>();
        var progresses = new List<ProgressRecord>();
        var feedbacks = new List<Feedback>();
        var shuffledStudents = studentProfiles.OrderBy(_ => Guid.NewGuid()).ToList();
        int studentCursor = 0;

        foreach (var m in meetings)
        {
            int pCount = _random.Next(3, 11);
            if (m.Status == MeetingStatus.Completed) pCount = _random.Next(6, 11);

            for (int k = 0; k < pCount; k++)
            {
                var studentProfile = shuffledStudents[studentCursor % shuffledStudents.Count];
                studentCursor++;

                var pStatus = ParticipantStatus.Registered;
                if (m.Status == MeetingStatus.Completed)
                {
                    pStatus = _random.NextDouble() > 0.1 ? ParticipantStatus.Present : ParticipantStatus.Absent;
                }

                participants.Add(new Participant
                {
                    MeetingId = m.Id,
                    StudentId = studentProfile.UserId,
                    RegisteredAt = m.StartTime.AddDays(-2),
                    Status = pStatus
                });

                if (m.Status == MeetingStatus.Completed && pStatus == ParticipantStatus.Present)
                {
                    progresses.Add(new ProgressRecord
                    {
                        MeetingId = m.Id,
                        StudentId = studentProfile.UserId,
                        TutorId = m.TutorId,
                        Understanding = _random.Next(5, 11),
                        ProblemSolving = _random.Next(4, 11),
                        CodeQuality = _random.Next(4, 11),
                        Participation = _random.Next(6, 11),
                        TutorComments = "Có hiểu bài, cần cố gắng phát huy.",
                        PrivateNote = "Hơi rụt rè khi đặt câu hỏi."
                    });

                    if (_random.NextDouble() > 0.3)
                    {
                        int rating = _random.Next(3, 6);
                        string cmt;
                        SentimentType sentiment;

                        if (rating >= 5)
                        {
                            cmt = _positiveComments[_random.Next(_positiveComments.Length)];
                            sentiment = SentimentType.Positive;
                        }
                        else if (rating >= 3)
                        {
                            cmt = _neutralComments[_random.Next(_neutralComments.Length)];
                            sentiment = SentimentType.Neutral;
                        }
                        else
                        {
                            cmt = _negativeComments[_random.Next(_negativeComments.Length)];
                            sentiment = SentimentType.Negative;
                        }

                        feedbacks.Add(new Feedback
                        {
                            MeetingId = m.Id,
                            StudentId = studentProfile.UserId,
                            TutorId = m.TutorId,
                            Rating = rating,
                            Comment = cmt,
                            Sentiment = sentiment,
                            CreatedAt = m.EndTime.AddHours(_random.Next(1, 48))
                        });
                    }
                }
            }

            m.CurrentCount = pCount;
        }

        context.Participants.AddRange(participants);
        context.ProgressRecords.AddRange(progresses);
        context.Feedbacks.AddRange(feedbacks);
        context.SaveChanges();

        foreach (var t in tutorProfiles)
        {
            var myFeedbacks = feedbacks.Where(f => f.TutorId == t.UserId).ToList();
            if (myFeedbacks.Any())
            {
                t.TotalReviews = myFeedbacks.Count;
                t.AverageRating = Math.Round(myFeedbacks.Average(f => f.Rating), 1);
            }

            var myCompletedMeetings = meetings.Where(m => m.TutorId == t.UserId && m.Status == MeetingStatus.Completed).ToList();
            t.TotalTeachingHours = myCompletedMeetings.Sum(m => (m.EndTime - m.StartTime).TotalHours);
        }
        context.SaveChanges();

        Console.WriteLine("--> Seed Data Hoàn tất!");
    }

    private static string GenerateVietnameseName()
    {
        string first = _firstNames[_random.Next(_firstNames.Length)];
        string middle = _middleNames[_random.Next(_middleNames.Length)];
        string last = _lastNames[_random.Next(_lastNames.Length)];
        return $"{first} {middle} {last}";
    }
}
