import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, Mail, Phone, MapPin, Globe, Calendar, Clock, Trophy, BookOpen, ThumbsUp } from 'lucide-react';
import { mockTutors, Tutor } from '@/data/mockTutors';
import { cn } from '@/lib/utils';

interface TutorProfileScreenProps {
  tutorId: string;
  onBack: () => void;
}

export function TutorProfileScreen({ tutorId, onBack }: TutorProfileScreenProps) {
  const tutor = mockTutors.find(t => t.id === tutorId);
  const [activeTab, setActiveTab] = useState('education');

  if (!tutor) {
    return (
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
        <p>Tutor not found</p>
      </div>
    );
  }

  // Mock data for achievements and reviews
  const achievements = [
    { id: '1', title: 'Best Teaching Award 2023', type: 'award' },
    { id: '2', title: 'Research Excellence Award 2022', type: 'award' },
    { id: '3', title: 'Student Choice Award 2021', type: 'award' },
  ];

  const publications = [
    { id: '1', title: 'Advanced Data Structures for Modern Applications (2023)', type: 'publication' },
    { id: '2', title: 'Efficient Algorithms for Real-time Systems (2022)', type: 'publication' },
    { id: '3', title: 'Teaching Software Engineering in Practice (2021)', type: 'publication' },
  ];

  const reviews = [
    {
      id: '1',
      reviewer: 'Tran Thi B',
      initials: 'TTB',
      date: '2025-10-28',
      rating: 5,
      comment: 'Excellent tutor! Very clear explanations and patient with questions. Helped me understand complex algorithms easily.',
      helpful: 24,
    },
    {
      id: '2',
      reviewer: 'Le Van C',
      initials: 'LVC',
      date: '2025-10-25',
      rating: 5,
      comment: 'Dr. Nguyen is very knowledgeable and provides great real-world examples. His teaching style is engaging and effective.',
      helpful: 18,
    },
    {
      id: '3',
      reviewer: 'Pham Thi D',
      initials: 'PTD',
      date: '2025-10-20',
      rating: 4.5,
      comment: 'Good session overall. Would appreciate more practice problems, but the explanations were very clear.',
      helpful: 12,
    },
  ];

  const ratingBreakdown = {
    5: 78,
    4: 15,
    3: 5,
    2: 1,
    1: 1,
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Search
      </Button>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
                  {tutor.initials}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{tutor.name}</h1>
                  <p className="text-muted-foreground">Associate Professor</p>
                  <p className="text-sm text-muted-foreground">{tutor.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < Math.floor(tutor.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : i < tutor.rating
                        ? 'fill-yellow-400/50 text-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                ))}
                <span className="text-lg font-semibold ml-2">{tutor.rating}</span>
                <span className="text-sm text-muted-foreground">({tutor.reviewCount} reviews)</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Sessions</p>
                  <p className="font-semibold">{tutor.sessionCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-semibold">8 years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Response Time</p>
                  <p className="font-semibold">~2 hours</p>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary-dark">
                <Calendar className="mr-2 h-4 w-4" />
                Book a Meeting
              </Button>
            </div>

            {/* Right Column - About, Contact, Meeting Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-sm text-muted-foreground">
                  Experienced educator with a passion for teaching data structures, algorithms, and software engineering.
                  I believe in hands-on learning and real-world applications. My teaching style focuses on helping
                  students understand concepts deeply rather than just memorizing.
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{tutor.id}@hcmut.edu.vn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+84 123 456 789</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>HCMUT, District 10, Ho Chi Minh City</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{tutor.languages.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Meeting Details */}
              <div>
                <h3 className="font-semibold mb-3">Meeting Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Meeting Mode</p>
                    <div className="flex gap-2">
                      <Button
                        variant={tutor.meetingMode === 'Online' || tutor.meetingMode === 'Both' ? 'default' : 'outline'}
                        size="sm"
                      >
                        Online
                      </Button>
                      <Button
                        variant={tutor.meetingMode === 'In-Person' || tutor.meetingMode === 'Both' ? 'default' : 'outline'}
                        size="sm"
                      >
                        In-person
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rate</p>
                    <p className="text-sm font-medium">Free for HCMUT Students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="education">Education & Skills</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({tutor.reviewCount})</TabsTrigger>
        </TabsList>

        {/* Education & Skills Tab */}
        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Education</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Ph.D. in Computer Science, Stanford University</p>
                  <p className="text-sm text-muted-foreground">• 2015</p>
                </div>
                <div>
                  <p className="font-medium">M.S. in Computer Science, MIT</p>
                  <p className="text-sm text-muted-foreground">• 2012</p>
                </div>
                <div>
                  <p className="font-medium">B.S. in Computer Science, HCMUT</p>
                  <p className="text-sm text-muted-foreground">• 2010</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Teaching Skills</h3>
              <div className="flex flex-wrap gap-2">
                {tutor.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm border-green-500 text-green-700">
                  Competitive Programming
                </Badge>
                <Badge variant="outline" className="text-sm border-green-500 text-green-700">
                  Interview Preparation
                </Badge>
                <Badge variant="outline" className="text-sm border-green-500 text-green-700">
                  Code Review
                </Badge>
                <Badge variant="outline" className="text-sm border-green-500 text-green-700">
                  System Architecture
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Weekly Availability
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Monday: 9:00 AM - 12:00 PM, 2:00 PM - 5:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Wednesday: 9:00 AM - 12:00 PM, 2:00 PM - 5:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Friday: 9:00 AM - 12:00 PM, 2:00 PM - 5:00 PM</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Availability may vary. Please check real-time slots when booking.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Awards & Recognition
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3"
                  >
                    <Trophy className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <p className="font-medium">{achievement.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Publications & Research
              </h3>
              <div className="space-y-3">
                {publications.map((pub, idx) => (
                  <div
                    key={pub.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="font-medium">{pub.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Rating Breakdown</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingBreakdown[rating as keyof typeof ratingBreakdown];
                  const percentage = (count / tutor.reviewCount) * 100;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm w-12">{rating} stars</span>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {review.initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{review.reviewer}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-4 w-4',
                                i < Math.floor(review.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : i < review.rating
                                  ? 'fill-yellow-400/50 text-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        <span>Helpful ({review.helpful})</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

