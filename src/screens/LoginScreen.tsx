import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, Eye, EyeOff, BookOpen, Mail, Phone, GraduationCap, Users, Settings } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/components/ui/use-toast';
import { authenticateUser, UserEntity } from '@/data/mockUsers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface LoginScreenProps {
  onLogin: (user: UserEntity) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { setRole, setUserId, setUserName } = useRole();
  const { toast } = useToast();

  // Check for auto-login on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('hcmut_auth_token');
    const savedUserData = localStorage.getItem('hcmut_user_data');
    
    if (savedToken && savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        // Simulate token validation
        setTimeout(() => {
          setRole(userData.role === 'Management' ? 'Manager' : (userData.role === 'Student' ? 'Student' : 'Tutor'));
          setUserId(userData.userId);
          setUserName(userData.username);
          onLogin(userData as UserEntity);
          toast({
            title: 'Auto-login successful',
            description: `Welcome back, ${userData.username}!`,
          });
        }, 500);
      } catch (e) {
        // Invalid saved data, clear it
        localStorage.removeItem('hcmut_auth_token');
        localStorage.removeItem('hcmut_user_data');
      }
    }
  }, [setRole, setUserId, setUserName, onLogin, toast]);

  const handleSignIn = async () => {
    // Clear previous errors
    setLoginError(null);

    // Validation
    if (!username.trim()) {
      setLoginError('Vui lòng nhập tên đăng nhập.');
      return;
    }

    if (!password.trim()) {
      setLoginError('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsAuthenticating(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Authenticate user from mock data
      const user = authenticateUser(username.trim(), password);

      if (!user) {
        setLoginError('Sai tên đăng nhập hoặc mật khẩu.');
        setIsAuthenticating(false);
        return;
      }

      // Authentication successful
      const token = `hcmut_token_${Date.now()}_${user.userId}`;
      const userData = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        ...(user.role === 'Student' && {
          studentId: (user as any).studentId,
          enrollmentYear: (user as any).enrollmentYear,
          majors: (user as any).majors,
        }),
        ...(user.role === 'Tutor' && {
          tutorId: (user as any).tutorId,
          expertise: (user as any).expertise,
          ratingAvg: (user as any).ratingAvg,
          isInstructor: (user as any).isInstructor,
        }),
        ...(user.role === 'Management' && {
          managerId: (user as any).managerId,
          department: (user as any).department,
        }),
      };

      // Save token and user data
      if (rememberMe) {
        localStorage.setItem('hcmut_auth_token', token);
        localStorage.setItem('hcmut_user_data', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('hcmut_auth_token', token);
        sessionStorage.setItem('hcmut_user_data', JSON.stringify(userData));
      }

      // Set role context
      const roleMapping = {
        'Student': 'Student' as const,
        'Tutor': 'Tutor' as const,
        'Management': 'Manager' as const,
      };
      setRole(roleMapping[user.role]);
      setUserId(user.userId);
      setUserName(user.username);

      // Call onLogin with user data
      onLogin(user);

      toast({
        title: 'Đăng nhập thành công',
        description: `Chào mừng, ${user.username}!`,
      });
    } catch (error: any) {
      setLoginError('Không thể kết nối đến máy chủ SSO. Vui lòng thử lại sau.');
      setIsAuthenticating(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setLoginError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="w-full max-w-5xl">
          {/* System Title Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Tutor Support System</h1>
            <p className="text-lg text-gray-600">HCMUT - Ho Chi Minh City University of Technology</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-0 max-w-2xl mx-auto">
            <CardContent className="p-8">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Nhập thông tin tài khoản của bạn
                </h2>
                <p className="text-sm text-muted-foreground">
                  Đăng nhập bằng tài khoản HCMUT của bạn
                </p>
              </div>

              {/* Error Alert */}
              {loginError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <div className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Tên tài khoản
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setLoginError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSignIn();
                      }
                    }}
                    disabled={isAuthenticating}
                    className="h-12 text-base"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSignIn();
                        }
                      }}
                      disabled={isAuthenticating}
                      className="h-12 pr-12 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Warning Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="warning"
                    defaultChecked
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label
                    htmlFor="warning"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Cảnh báo trước khi tôi đăng nhập vào các trang web khác.
                  </Label>
                </div>

                {/* SSO Sign In Section */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">Secure Sign In with HCMUT SSO</h3>
                      <p className="text-xs text-muted-foreground">
                        Use your HCMUT credentials to access the system securely. Your data is protected.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSignIn}
                    disabled={isAuthenticating || !username.trim() || !password.trim()}
                    className="flex-1 bg-primary hover:bg-primary-dark h-12 text-base font-semibold"
                    size="lg"
                  >
                    {isAuthenticating ? (
                      <>
                        <Shield className="mr-2 h-5 w-5 animate-pulse" />
                        Đang xác thực...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Đăng nhập
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isAuthenticating}
                    className="h-12 px-6 text-base"
                    size="lg"
                  >
                    Xóa
                  </Button>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Remember me on this device
                  </Label>
                </div>

                {/* Change Password Link */}
                <div className="text-center pt-2">
                  <a
                    href="#"
                    className="text-sm text-primary hover:underline font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: 'Thay đổi mật khẩu',
                        description: 'Vui lòng liên hệ bộ phận IT để thay đổi mật khẩu.',
                      });
                    }}
                  >
                    Thay đổi mật khẩu?
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto">
            {/* Language Selector */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-sm">Ngôn ngữ</h3>
                <div className="flex gap-4">
                  <button className="text-primary font-medium border-b-2 border-primary pb-1 text-sm">
                    Tiếng Việt
                  </button>
                  <button className="text-muted-foreground hover:text-foreground text-sm">
                    Tiếng Anh
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Notice Section */}
            <Card className="shadow-lg border-0 md:col-span-2">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-sm">Lưu ý</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    Trang đăng nhập này cho phép bạn đăng nhập một lần (Single Sign-On) để truy cập
                    nhiều hệ thống web của Trường Đại học Bách khoa - ĐHQG TP.HCM.
                  </p>
                  <p>
                    <strong className="text-foreground">Lưu ý bảo mật:</strong> Sau khi sử dụng
                    xong các dịch vụ yêu cầu xác thực, vui lòng đăng xuất khỏi trình duyệt web để
                    bảo vệ thông tin tài khoản của bạn.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Support */}
          <Card className="shadow-lg border-0 mt-6 max-w-5xl mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-sm">Hỗ trợ kỹ thuật</h3>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href="mailto:support@hcmut.edu.vn"
                    className="text-primary hover:underline"
                  >
                    support@hcmut.edu.vn
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    ĐT: (84-8) 38647256 - 7204
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
