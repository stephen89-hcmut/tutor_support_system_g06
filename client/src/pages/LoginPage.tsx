import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, BookOpen, Mail, Phone } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/application/services/authService';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import type { AuthSession } from '@/types/auth';
import { clearSession } from '@/lib/authStorage';

interface LoginPageProps {
  onLogin: (session: AuthSession) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [ticket, setTicket] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { setRole, setUserId, setUserName, setAccessToken } = useRole();
  const { toast } = useToast();

  // Check for auto-login on mount
  useEffect(() => {
    const session = authService.getSession();
    if (!session) return;

    const isExpired = !session.accessTokenExpiresAt || new Date(session.accessTokenExpiresAt) <= new Date();
    if (isExpired) {
      clearSession();
      return;
    }

    setRole(session.role);
    setUserId(session.userId);
    setUserName(session.fullName);
    setAccessToken(session.accessToken);
    onLogin(session);
    toast({
      title: 'Đăng nhập tự động',
      description: `Chào mừng, ${session.fullName}!`,
    });
  }, [setRole, setUserId, setUserName, setAccessToken, onLogin, toast]);

  const handleSignIn = async () => {
    // Clear previous errors
    setLoginError(null);

    // Validation
    if (!ticket.trim()) {
      setLoginError('Vui lòng nhập SSO ID / Ticket.');
      return;
    }

    setIsAuthenticating(true);

    try {
      const session = await authService.loginWithTicket(ticket.trim(), rememberMe);

      setRole(session.role);
      setUserId(session.userId);
      setUserName(session.fullName);
      setAccessToken(session.accessToken);

      onLogin(session);

      toast({
        title: 'Đăng nhập thành công',
        description: `Chào mừng, ${session.fullName}!`,
      });
    } catch (error: any) {
      clearSession();
      setLoginError(error?.message || 'Không thể đăng nhập. Vui lòng kiểm tra SSO ID / Ticket.');
    } finally {
      setIsAuthenticating(false);
    }
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
                  Đăng nhập bằng SSO ID / Ticket
                </h2>
                <p className="text-sm text-muted-foreground">
                  Hệ thống sẽ xác thực SSO ID có tồn tại trong database để cấp quyền theo role.
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
                {/* SSO ID / Ticket Field */}
                <div className="space-y-2">
                  <Label htmlFor="ticket" className="text-sm font-medium">
                    SSO ID / Ticket
                  </Label>
                  <Input
                    id="ticket"
                    type="text"
                    placeholder="Ví dụ: SSO_STUDENT_1 hoặc SSO_ADMIN"
                    value={ticket}
                    onChange={(e) => {
                      setTicket(e.target.value);
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
                <div className="flex justify-center">
                  <Button
                    onClick={handleSignIn}
                    disabled={isAuthenticating || !ticket.trim()}
                    className="w-full max-w-md bg-primary hover:bg-primary-dark h-12 text-base font-semibold"
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

          {/* Notice Section - Aligned with login card */}
          <Card className="shadow-lg border-0 max-w-2xl mx-auto mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-sm">Lưu ý</h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <p>
                  Trang đăng nhập này cho phép bạn đăng nhập một lần (Single Sign-On) để truy cập
                  nhiều hệ thống web của Trường Đại học Bách khoa - ĐHQG TP.HCM.
                </p>
                <p>
                  <strong className="text-foreground">Lưu ý bảo mật:</strong> Sau khi sử dụng
                  xong các dịch vụ yêu cầu xác thực, vui lòng đăng xuất khỏi trình duyệt web để
                  bảo vệ thông tin tài khoản của bạn.
                </p>
                
                {/* Technical Support - Inside Notice Section */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3 text-sm text-foreground">Hỗ trợ kỹ thuật</h4>
                  <div className="space-y-2">
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
