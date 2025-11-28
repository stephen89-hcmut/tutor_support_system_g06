import { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Edit, Save, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentUserProfile, UserProfile } from '@/data/mockUserProfile';
import { format } from 'date-fns';

interface ProfileScreenProps {
  onBack: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { role } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
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
          // Simulate 90% success rate
          if (Math.random() > 0.1) {
            resolve(true);
          } else {
            reject(new Error('API_ERROR'));
          }
        }, 2000);
      });

      // Simulate getting updated data from HCMUT
      const syncedProfile: UserProfile = {
        ...profile,
        fullName: profile.fullName, // In real app, this would come from API
        email: profile.email,
        phone: profile.phone,
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
        variant: 'error',
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
        variant: 'error',
        title: 'Validation Error',
        description: 'Full name is required.',
      });
      return;
    }

    if (!editedProfile.email.trim() || !editedProfile.email.includes('@')) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
      });
      return;
    }

    if (!editedProfile.phone.trim()) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Phone number is required.',
      });
      return;
    }

    try {
      // Simulate saving to database
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 95% success rate
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
        variant: 'error',
        title: 'Update Failed',
        description: 'Failed to save profile. Please try again later.',
      });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">View and manage your personal information</p>
          </div>
        </div>
        <div className="flex gap-2">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-3xl">
                {profile.initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                <Badge className={cn('mt-2', getRoleColor())}>
                  {role}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">ID: {getDisplayId()}</p>
              </div>

              <div className="w-full space-y-3 pt-4 border-t">
                <div className="text-left">
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="text-sm">{profile.email}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <p className="text-sm">{profile.phone}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-sm">{profile.department || 'N/A'}</p>
                </div>
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
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={editedProfile.fullName}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, email: e.target.value })
                      }
                    />
                  </div>
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
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={editedProfile.address || ''}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, address: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="text-sm">{profile.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                    <p className="text-sm">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-sm">{profile.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-sm">{profile.address || 'N/A'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {role === 'Student' && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                    <p className="text-sm">{profile.studentId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Year</p>
                    <p className="text-sm">Year {profile.year || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p className="text-sm">{profile.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Major</p>
                    <p className="text-sm">{profile.major || 'N/A'}</p>
                  </div>
                </>
              )}
              {role === 'Tutor' && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tutor ID</p>
                    <p className="text-sm">{profile.tutorId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p className="text-sm">{profile.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    <p className="text-sm">{profile.ratingAvg ? `${profile.ratingAvg}/5.0` : 'N/A'}</p>
                  </div>
                  {profile.expertise && profile.expertise.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.expertise.map((exp) => (
                          <Badge key={exp} variant="outline">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* About Me */}
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedProfile.about || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, about: e.target.value })
                  }
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-sm">{profile.about || 'No description provided.'}</p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter skills separated by commas (e.g., JavaScript, Python, React)"
                    value={editedProfile.skills?.join(', ') || ''}
                    onChange={(e) => {
                      const skills = e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0);
                      setEditedProfile({ ...editedProfile, skills });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple skills with commas
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill) => (
                      <Badge key={skill} className="bg-primary text-primary-foreground">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sync Confirmation Dialog */}
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
    </div>
  );
}
