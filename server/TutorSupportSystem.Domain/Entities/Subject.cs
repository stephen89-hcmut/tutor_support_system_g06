using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TutorSupportSystem.Domain.Enums;

namespace TutorSupportSystem.Domain.Entities
{
  public class Subject : BaseEntity
    {
       
        public string Code { get; set; } = string.Empty; // VD: "CO1005"

      
        public string Name { get; set; } = string.Empty; // VD: "Nhập môn điện toán"

        public SubjectType Type { get; set; }

        public Guid? FacultyId { get; set; } // Null nếu là môn đại cương chung toàn trường

        // Navigation  
        public virtual Faculty? Faculty { get; set; }
    }
}