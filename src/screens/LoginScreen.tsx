import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Users, Settings, BookOpen, ArrowRight, Shield } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/components/ui/use-toast';

interface LoginScreenProps {
  onLogin: (role: 'Student' | 'Tutor' | 'Manager') => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<'Student' | 'Tutor' | 'Manager'>('Student');
  const [rememberMe, setRememberMe] = useState(false);
  const { setRole } = useRole();
  const { toast } = useToast();

  // Check for auto-login token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('hcmut_auth_token');
    const savedRole = localStorage.getItem('hcmut_user_role') as 'Student' | 'Tutor' | 'Manager' | null;
    
    if (savedToken && savedRole) {
      // Simulate token validation
      validateToken(savedToken).then((isValid) => {
        if (isValid) {
          setRole(savedRole);
          onLogin(savedRole);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('hcmut_auth_token');
          localStorage.removeItem('hcmut_user_role');
        }
      });
    }
  }, [setRole, onLogin]);

  const validateToken = async (token: string): Promise<boolean> => {
    // Simulate token validation with HCMUT SSO
    return new Promise((resolve) => {
      setTimeout(() => {
        // In real app, this would call HCMUT SSO API
        // For now, just check if token exists and is not expired
        const tokenData = localStorage.getItem('hcmut_token_data');
        if (tokenData) {
          try {
            const data = JSON.parse(tokenData);
            const now = new Date().getTime();
            // Check if token is not expired (24 hours)
            if (data.expiresAt && now < data.expiresAt) {
              resolve(true);
              return;
            }
          } catch (e) {
            // Invalid token data
          }
        }
        resolve(false);
      }, 500);
    });
  };

  const handleSignIn = async () => {
    try {
      // Simulate SSO authentication
      toast({
        title: 'Connecting to HCMUT SSO...',
        description: 'Please wait while we authenticate your credentials.',
      });

      // Simulate API call to HCMUT SSO
      // In real app, this would be: await fetch('https://sso.hcmut.edu.vn/api/auth', {...})
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 90% success rate
          if (Math.random() > 0.1) {
            resolve(true);
          } else {
            // Simulate SSO server error
            reject(new Error('SSO_SERVER_ERROR'));
          }
        }, 1500);
      });

      // Simulate successful authentication
      const token = `hcmut_token_${Date.now()}`;
      const tokenData = {
        token,
        role: selectedRole,
        expiresAt: rememberMe ? new Date().getTime() + 30 * 24 * 60 * 60 * 1000 : new Date().getTime() + 24 * 60 * 60 * 1000, // 30 days if remember me, 1 day otherwise
      };

      // Save token if remember me is checked
      if (rememberMe) {
        localStorage.setItem('hcmut_auth_token', token);
        localStorage.setItem('hcmut_user_role', selectedRole);
        localStorage.setItem('hcmut_token_data', JSON.stringify(tokenData));
      } else {
        // Store in sessionStorage for current session only
        sessionStorage.setItem('hcmut_auth_token', token);
        sessionStorage.setItem('hcmut_user_role', selectedRole);
      }

      setRole(selectedRole);
      onLogin(selectedRole);

      toast({
        title: 'Login Successful',
        description: `Welcome back! You are logged in as ${selectedRole}.`,
      });
    } catch (error: any) {
      // Handle different error types
      if (error?.message === 'SSO_SERVER_ERROR') {
        toast({
          variant: 'error',
          title: 'Connection Error',
          description: 'Cannot connect to SSO server. Please try again later.',
        });
      } else {
        toast({
          variant: 'error',
          title: 'Authentication Error',
          description: 'Incorrect username or password. Please try again.',
        });
      }
    }
  };

  const handleCancel = () => {
    // Return to homepage (in this case, just stay on login page)
    toast({
      title: 'Login Cancelled',
      description: 'You can try again when ready.',
    });
  };

  const roles = [
    {
      id: 'Student' as const,
      icon: GraduationCap,
      title: 'Student',
      description: 'Book meetings, view progress, access learning materials',
      color: 'bg-blue-500',
      selectedColor: 'border-blue-500 bg-blue-50',
    },
    {
      id: 'Tutor' as const,
      icon: Users,
      title: 'Tutor',
      description: 'Manage students, record progress, respond to feedback',
      color: 'bg-green-500',
      selectedColor: 'border-green-500 bg-green-50',
    },
    {
      id: 'Manager' as const,
      icon: Settings,
      title: 'Manager',
      description: 'Access control, analytics, manage permissions',
      color: 'bg-orange-500',
      selectedColor: 'border-orange-500 bg-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-8">
          {/* Main Login Card */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* System Title */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-primary">Tutor Support System</h1>
                </div>
                <p className="text-muted-foreground">
                  HCMUT - Ho Chi Minh City University of Technology
                </p>
              </div>

              {/* Role Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Select Your Role</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? `${role.selectedColor} border-2`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isSelected && (
                            <div className={`w-2 h-2 rounded-full ${role.color} mt-1.5`} />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon
                                className={`h-5 w-5 ${
                                  isSelected
                                    ? role.id === 'Student'
                                      ? 'text-blue-600'
                                      : role.id === 'Tutor'
                                      ? 'text-green-600'
                                      : 'text-orange-600'
                                    : 'text-gray-400'
                                }`}
                              />
                              <h3 className="font-semibold">{role.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SSO Sign In Section */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Secure Sign In with HCMUT SSO</h3>
                    <p className="text-sm text-muted-foreground">
                      Use your HCMUT credentials to access the system securely. Your data is protected.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                onClick={handleSignIn}
                className="w-full bg-primary hover:bg-primary-dark text-white mb-4"
                size="lg"
              >
                Sign In with HCMUT SSO as {selectedRole}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Remember Me */}
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me on this device
                </label>
              </div>

              {/* Cancel Button */}
              <div className="text-center">
                <Button variant="ghost" onClick={handleCancel} size="sm">
                  Cancel
                </Button>
              </div>

              {/* Copyright and Support */}
              <div className="mt-6 pt-6 border-t text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  © 2025 Ho Chi Minh City University of Technology
                </p>
                <a href="#" className="text-xs text-primary hover:underline">
                  Need help? Contact support
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Role Permissions Overview */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Role Permissions Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <h3 className="font-semibold">Student</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Book & manage meetings</li>
                    <li>• View progress reports</li>
                    <li>• Access learning materials</li>
                    <li>• AI tutor suggestions</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <h3 className="font-semibold">Tutor</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Manage students</li>
                    <li>• Record progress</li>
                    <li>• Respond to feedback</li>
                    <li>• Share materials</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <h3 className="font-semibold">Manager</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Access control</li>
                    <li>• Generate reports</li>
                    <li>• Manage permissions</li>
                    <li>• Monitor activities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

