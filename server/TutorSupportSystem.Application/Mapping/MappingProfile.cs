using AutoMapper;
using TutorSupportSystem.Application.DTOs;
using TutorSupportSystem.Domain.Entities;

namespace TutorSupportSystem.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Meeting, MeetingDto>();
        CreateMap<TutorProfile, TutorProfileDto>();
        CreateMap<StudentProfile, StudentProfileDto>();
    }
}
