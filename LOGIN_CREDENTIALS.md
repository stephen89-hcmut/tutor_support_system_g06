# Login Credentials

This document lists the mock user accounts available for testing the HCMUT Tutor Support System.

## Authentication System

The system uses mock data that simulates HCMUT_SSO authentication. Users cannot create their own accounts - all accounts are pre-defined in the system.

## Test Accounts

### Students (20 accounts)
All students use password: `student123`

| Username | Student ID | Email |
|----------|------------|-------|
| nguyenvana | 2011234 | nguyenvana@hcmut.edu.vn |
| tranthib | 2011235 | tranthib@hcmut.edu.vn |
| levanc | 2011236 | levanc@hcmut.edu.vn |
| phamthid | 2011237 | phamthid@hcmut.edu.vn |
| hoangvane | 2011238 | hoangvane@hcmut.edu.vn |
| vuongthif | 2011239 | vuongthif@hcmut.edu.vn |
| dangvang | 2011240 | dangvang@hcmut.edu.vn |
| buthih | 2011241 | buthih@hcmut.edu.vn |
| ngothii | 2011242 | ngothii@hcmut.edu.vn |
| lyvanj | 2011243 | lyvanj@hcmut.edu.vn |
| trinhthik | 2010244 | trinhthik@hcmut.edu.vn |
| duongvanl | 2010245 | duongvanl@hcmut.edu.vn |
| vuthim | 2010246 | vuthim@hcmut.edu.vn |
| dothin | 2010247 | dothin@hcmut.edu.vn |
| phanthio | 2010248 | phanthio@hcmut.edu.vn |
| truongvanp | 2019250 | truongvanp@hcmut.edu.vn |
| hoangthiq | 2019251 | hoangthiq@hcmut.edu.vn |
| nguyenvanr | 2019252 | nguyenvanr@hcmut.edu.vn |
| lethis | 2019253 | lethis@hcmut.edu.vn |
| tranvant | 2019254 | tranvant@hcmut.edu.vn |

### Tutors (10 accounts)
All tutors use password: `tutor123`

**Instructors (5 accounts):**
| Username | Tutor ID | Type | Email |
|----------|----------|------|-------|
| drnguyenvana | T001 | Instructor | drnguyenvana@hcmut.edu.vn |
| drtranthib | T002 | Instructor | drtranthib@hcmut.edu.vn |
| drlevanc | T003 | Instructor | drlevanc@hcmut.edu.vn |
| drphamthid | T004 | Instructor | drphamthid@hcmut.edu.vn |
| drhoangvane | T005 | Instructor | drhoangvane@hcmut.edu.vn |

**Senior Students (5 accounts):**
| Username | Tutor ID | Type | Email |
|----------|----------|------|-------|
| seniorstudent1 | T006 | Senior Student | seniorstudent1@hcmut.edu.vn |
| seniorstudent2 | T007 | Senior Student | seniorstudent2@hcmut.edu.vn |
| seniorstudent3 | T008 | Senior Student | seniorstudent3@hcmut.edu.vn |
| seniorstudent4 | T009 | Senior Student | seniorstudent4@hcmut.edu.vn |
| seniorstudent5 | T010 | Senior Student | seniorstudent5@hcmut.edu.vn |

### Manager (1 account)
| Username | Manager ID | Password | Email |
|----------|------------|---------|-------|
| manageradmin | M001 | manager123 | manager@hcmut.edu.vn |

## Quick Test Accounts

For quick testing, use these accounts:

- **Student**: `nguyenvana` / `student123`
- **Tutor (Instructor)**: `drnguyenvana` / `tutor123`
- **Tutor (Senior Student)**: `seniorstudent1` / `tutor123`
- **Manager**: `manageradmin` / `manager123`

## Error Messages

- **"Sai tên đăng nhập hoặc mật khẩu."** - Displayed when username or password is incorrect
- **"Vui lòng nhập tên đăng nhập."** - Displayed when username field is empty
- **"Vui lòng nhập mật khẩu."** - Displayed when password field is empty

## Notes

- All passwords are case-sensitive
- Usernames are case-sensitive
- The system automatically detects the user's role (Student, Tutor, or Manager) based on the account type
- "Remember me" option saves login credentials for 30 days
- Without "Remember me", session expires when browser is closed

