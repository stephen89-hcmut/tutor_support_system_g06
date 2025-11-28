import { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Save, X, RefreshCw, Upload, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentUserProfile, UserProfile } from '@/data/mockUserProfile';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockMeetings } from '@/data/mockMeetings';
import { mockProgressRecords } from '@/data/mockProgress';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export function ProfileSettingsTab() {
  const { role } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<UserProfile>(getCurrentUserProfile(role));
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const { toast } = useToast();

  useEffect(() => {
    setProfile(getCurrentUserProfile(role));
    setEditedProfile(getCurrentUserProfile(role));
  }, [role]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setShowSyncDialog(false);

    try {
      // Simulate API call to HCMUT_DATACORE
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) {
            resolve(true);
          } else {
            reject(new Error('API_ERROR'));
          }
        }, 2000);
      });

      const syncedProfile: UserProfile = {
        ...profile,
        lastSynced: new Date().toISOString(),
      };

      setProfile(syncedProfile);
      if (!isEditing) {
        setEditedProfile(syncedProfile);
      }

      toast({
        title: 'Sync Successful',
        description: 'Profile has been synchronized with HCMUT system.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: 'Cannot connect to HCMUT API. Please try again later.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!editedProfile.fullName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Full name is required.',
      });
      return;
    }

    if (!editedProfile.email.trim() || !editedProfile.email.includes('@')) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
      });
      return;
    }

    if (!editedProfile.phone.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Phone number is required.',
      });
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.05) {
            resolve(true);
          } else {
            reject(new Error('DB_ERROR'));
          }
        }, 1000);
      });

      setProfile(editedProfile);
      setIsEditing(false);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Failed to save profile. Please try again later.',
      });
    }
  };

  const handleAvatarUpload = () => {
    if (avatarFile) {
      // In real app, upload to server
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update avatar (in real app, this would be a URL from server)
        toast({
          title: 'Avatar Updated',
          description: 'Your avatar has been uploaded successfully.',
        });
        setShowAvatarUpload(false);
        setAvatarFile(null);
      };
      reader.readAsDataURL(avatarFile);
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'Student':
        return 'bg-blue-500 text-white';
      case 'Tutor':
        return 'bg-green-500 text-white';
      case 'Manager':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getDisplayId = () => {
    if (profile.studentId) return profile.studentId;
    if (profile.tutorId) return profile.tutorId;
    if (profile.managerId) return profile.managerId;
    return profile.userId;
  };

  // Student specific data
  const studentProgress = mockProgressRecords.filter(r => r.studentId === profile.userId);
  const skillData = studentProgress.length > 0 ? [
    { metric: 'Understanding', value: Math.round(studentProgress.reduce((sum, r) => sum + r.understanding, 0) / studentProgress.length) },
    { metric: 'Problem Solving', value: Math.round(studentProgress.reduce((sum, r) => sum + r.problemSolving, 0) / studentProgress.length) },
    { metric: 'Code Quality', value: Math.round(studentProgress.reduce((sum, r) => sum + r.codeQuality, 0) / studentProgress.length) },
    { metric: 'Participation', value: Math.round(studentProgress.reduce((sum, r) => sum + r.participation, 0) / studentProgress.length) },
  ] : [];

  const upcomingMeetings = mockMeetings
    .filter(m => m.studentId === profile.userId && m.status === 'Scheduled')
    .slice(0, 3);

  // Tutor specific data
  const tutorStudents = new Set(mockMeetings.filter(m => m.tutorId === profile.userId).map(m => m.studentId)).size;
  const totalHours = mockMeetings.filter(m => m.tutorId === profile.userId && m.status === 'Completed').length * 1.5; // Assume 1.5 hours per session

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setShowSyncDialog(true)}
          disabled={isSyncing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync with HCMUT
        </Button>
        {!isEditing ? (
          <Button onClick={handleEdit} className="bg-primary hover:bg-primary-dark">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary-dark">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-3xl">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    profile.initials
                  )}
                </div>
                {role === 'Student' && (
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => setShowAvatarUpload(true)}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                <Badge className={cn('mt-2', getRoleColor())}>
                  {role}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">ID: {getDisplayId()}</p>
              </div>

              {/* Read-only Info from DATACORE */}
              <div className="w-full space-y-3 pt-4 border-t">
                <div className="text-left">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{profile.email}</p>
                </div>
                {role === 'Student' && (
                  <>
                    <div className="text-left">
                      <p className="text-sm font-medium text-muted-foreground">Faculty</p>
                      <p className="text-sm">{profile.department || 'N/A'}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-muted-foreground">Enrollment Year</p>
                      <p className="text-sm">{profile.enrollmentYear || 'N/A'}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-muted-foreground">Major</p>
                      <p className="text-sm">{profile.major || 'N/A'}</p>
                    </div>
                  </>
                )}
                {role === 'Tutor' && (
                  <div className="text-left">
                    <p className="text-sm font-medium text-muted-foreground">Rating</p>
                    <p className="text-sm">{profile.ratingAvg ? `${profile.ratingAvg}/5.0` : 'N/A'}</p>
                  </div>
                )}
              </div>

              {profile.lastSynced && (
                <div className="w-full pt-4 border-t text-left">
                  <p className="text-xs text-muted-foreground">Last synced</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(profile.lastSynced), 'MMM d, yyyy, h:mm a')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editable Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editedProfile.phone}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="about">Bio / About Me</Label>
                    <Textarea
                      id="about"
                      value={editedProfile.about || ''}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, about: e.target.value })
                      }
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-sm">{profile.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bio / About Me</p>
                    <p className="text-sm">{profile.about || 'No description provided.'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Student Specific Sections */}
          {role === 'Student' && (
            <>
              {/* Learning Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="weakSubjects">Subjects I Need Help With</Label>
                        <Input
                          id="weakSubjects"
                          placeholder="e.g., Calculus, Data Structures"
                          value={(editedProfile as any).weakSubjects || ''}
                          onChange={(e) =>
                            setEditedProfile({ ...editedProfile, weakSubjects: e.target.value } as any)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferredMode">Preferred Learning Mode</Label>
                        <Select
                          value={(editedProfile as any).preferredMode || 'Both'}
                          onValueChange={(value) =>
                            setEditedProfile({ ...editedProfile, preferredMode: value } as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="In-Person">In-Person</SelectItem>
                            <SelectItem value="Both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferredTime">Preferred Time Slots</Label>
                        <Input
                          id="preferredTime"
                          placeholder="e.g., Morning (8-12), Afternoon (13-17)"
                          value={(editedProfile as any).preferredTime || ''}
                          onChange={(e) =>
                            setEditedProfile({ ...editedProfile, preferredTime: e.target.value } as any)
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Subjects I Need Help With</p>
                        <p className="text-sm">{(profile as any).weakSubjects || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Preferred Learning Mode</p>
                        <p className="text-sm">{(profile as any).preferredMode || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Preferred Time Slots</p>
                        <p className="text-sm">{(profile as any).preferredTime || 'Not specified'}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Skill Progress Chart */}
              {skillData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={skillData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Skills"
                          dataKey="value"
                          stroke="#0A84D6"
                          fill="#0A84D6"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Subjects Being Tutored */}
              <Card>
                <CardHeader>
                  <CardTitle>Subjects Being Tutored</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockMeetings
                      .filter(m => m.studentId === profile.userId)
                      .map((m, idx, arr) => arr.findIndex(me => me.topic === m.topic) === idx)
                      .filter(Boolean)
                      .map((m) => (
                        <Badge key={m.id} variant="outline" className="mr-2 mb-2">
                          {m.topic}
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingMeetings.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingMeetings.map((meeting) => (
                        <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{meeting.topic}</p>
                            <p className="text-sm text-muted-foreground">
                              {meeting.date} at {meeting.time} with {meeting.tutorName}
                            </p>
                          </div>
                          <Badge className="bg-blue-500 text-white">Scheduled</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No upcoming meetings</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Tutor Specific Sections */}
          {role === 'Tutor' && (
            <>
              {/* Expertise */}
              <Card>
                <CardHeader>
                  <CardTitle>Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter subjects separated by commas (e.g., Data Structures, Algorithms)"
                        value={editedProfile.expertise?.join(', ') || ''}
                        onChange={(e) => {
                          const expertise = e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter((s) => s.length > 0);
                          setEditedProfile({ ...editedProfile, expertise });
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise && profile.expertise.length > 0 ? (
                        profile.expertise.map((exp) => (
                          <Badge key={exp} variant="outline">
                            {exp}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No expertise listed</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Availability Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Availability Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Manage your available time slots for students to book meetings.
                    </p>
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Set Free Time Slots
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Students Being Tutored</p>
                      <p className="text-2xl font-bold">{tutorStudents}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Hours Taught</p>
                      <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Manager Specific Sections */}
          {role === 'Manager' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">150</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Meetings</p>
                      <p className="text-2xl font-bold">{mockMeetings.filter(m => m.status === 'Scheduled').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Skills (Common) */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter skills separated by commas"
                      value={editedProfile.skills?.join(', ') || ''}
                      onChange={(e) => {
                        const skills = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0);
                        setEditedProfile({ ...editedProfile, skills });
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} className="bg-primary text-primary-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync with HCMUT System</DialogTitle>
            <DialogDescription>
              This will synchronize your profile with the latest data from HCMUT system. Any local changes will be overwritten.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Avatar Upload Dialog (Student only) */}
      {role === 'Student' && (
        <Dialog open={showAvatarUpload} onOpenChange={setShowAvatarUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Avatar</DialogTitle>
              <DialogDescription>
                Upload a profile picture. Supported formats: JPG, PNG (Max 2MB)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="avatar">Select Image</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        toast({
                          variant: 'destructive',
                          title: 'File Too Large',
                          description: 'Please select an image smaller than 2MB.',
                        });
                        return;
                      }
                      setAvatarFile(file);
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAvatarUpload(false)}>
                Cancel
              </Button>
              <Button onClick={handleAvatarUpload} disabled={!avatarFile}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

