import { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { ArrowLeft, Brain } from 'lucide-react';
import { progressService } from '@/application/services/progressService';
import { useToast } from '@/components/ui/use-toast';

interface StudentAnalyticsPageProps {
  onBack?: () => void;
}

export function StudentAnalyticsPage({ onBack }: StudentAnalyticsPageProps) {
  const { userId, role } = useRole();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || role !== 'Student') {
      setIsLoading(false);
      return;
    }

    const generateAnalytics = async () => {
      try {
        // Get student progress
        const progressData = await progressService.getByStudent(userId);
        
        if (!progressData.records || progressData.records.length === 0) {
          setAnalyticsData(null);
          setIsLoading(false);
          return;
        }

        // Analyze progress data
        const records = progressData.records;
        
        // Calculate subject performance
        const subjectScores: Record<string, { total: number; count: number }> = {};
        records.forEach(record => {
          const subject = record.topic.split(' - ')[0];
          if (!subjectScores[subject]) {
            subjectScores[subject] = { total: 0, count: 0 };
          }
          const avgScore = (
            record.understanding +
            record.problemSolving +
            record.codeQuality +
            record.participation
          ) / 4;
          subjectScores[subject].total += avgScore;
          subjectScores[subject].count += 1;
        });

        const subjectPerformance = Object.entries(subjectScores).map(([subject, data]) => ({
          subject,
          average: Math.round(data.total / data.count),
        }));

        // Calculate trend over time
        const monthlyTrend = records
          .map(record => ({
            month: new Date(record.sessionDate).toLocaleDateString('en-US', { month: 'short' }),
            date: record.sessionDate,
            score: (
              record.understanding +
              record.problemSolving +
              record.codeQuality +
              record.participation
            ) / 4,
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate skill breakdown
        const skillBreakdown = [
          {
            skill: 'Understanding',
            average: Math.round(records.reduce((sum, r) => sum + r.understanding, 0) / records.length),
          },
          {
            skill: 'Problem Solving',
            average: Math.round(records.reduce((sum, r) => sum + r.problemSolving, 0) / records.length),
          },
          {
            skill: 'Code Quality',
            average: Math.round(records.reduce((sum, r) => sum + r.codeQuality, 0) / records.length),
          },
          {
            skill: 'Participation',
            average: Math.round(records.reduce((sum, r) => sum + r.participation, 0) / records.length),
          },
        ];

        // Calculate overall performance
        const overallAvg = records.reduce((sum, r) => {
          return sum + (r.understanding + r.problemSolving + r.codeQuality + r.participation) / 4;
        }, 0) / records.length;

        // Identify weak areas
        const weakAreas = subjectPerformance
          .filter(s => s.average < 60)
          .map(s => s.subject);

        // Generate AI recommendations
        const recommendations = [];
        if (weakAreas.length > 0) {
          recommendations.push({
            id: '1',
            title: `Focus on ${weakAreas[0]}`,
            description: `Your performance in ${weakAreas[0]} is below average. Consider scheduling more sessions with tutors specializing in this area.`,
            priority: 'High' as const,
          });
        }
        const problemSolvingSkill = skillBreakdown.find(s => s.skill === 'Problem Solving');
        if (problemSolvingSkill && problemSolvingSkill.average < 70) {
          recommendations.push({
            id: '2',
            title: 'Improve Problem Solving Skills',
            description: 'Practice more problem-solving exercises and work on breaking down complex problems into smaller parts.',
            priority: 'Medium' as const,
          });
        }
        if (overallAvg < 70) {
          recommendations.push({
            id: '3',
            title: 'Increase Session Frequency',
            description: 'Consider scheduling more regular sessions to maintain consistent progress.',
            priority: 'Medium' as const,
          });
        }

        setAnalyticsData({
          overallAvg: Math.round(overallAvg),
          subjectPerformance,
          monthlyTrend,
          skillBreakdown,
          weakAreas,
          recommendations,
          totalSessions: records.length,
        });
      } catch (error) {
        console.error('Error generating analytics:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate analytics. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateAnalytics();
  }, [userId, role, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-pulse">
          <Brain className="h-12 w-12 text-primary" />
        </div>
        <p className="text-muted-foreground">AI is analyzing your progress...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No progress data available for analysis.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI Analytics Report</h1>
            <p className="text-muted-foreground">
              Comprehensive analysis of your learning progress and performance.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-6xl font-bold text-primary">{analyticsData.overallAvg}%</div>
            <div>
              <p className="text-muted-foreground">Average Score</p>
              <p className="text-sm text-muted-foreground">{analyticsData.totalSessions} sessions analyzed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill="#0A84D6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={analyticsData.skillBreakdown}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="average"
                  stroke="#0A84D6"
                  fill="#0A84D6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#0A84D6"
                strokeWidth={2}
                name="Average Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recommendations.map((rec: any) => (
              <div
                key={rec.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{rec.title}</h3>
                    <Badge
                      variant={
                        rec.priority === 'High'
                          ? 'destructive'
                          : rec.priority === 'Medium'
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            ))}
            {analyticsData.recommendations.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Great job! No specific recommendations at this time. Keep up the excellent work!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

