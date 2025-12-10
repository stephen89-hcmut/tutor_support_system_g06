using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TutorSupportSystem.Domain.Entities
{
   public class Faculty : BaseEntity
    {
      
        public string Code { get; set; } = string.Empty; // VD: "CSE", "EEE"

      
        public string Name { get; set; } = string.Empty; // VD: "Khoa học & Kỹ thuật Máy tính"

        // Navigation
        public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
        public virtual ICollection<StudentProfile> Students { get; set; } = new List<StudentProfile>();
    }
}