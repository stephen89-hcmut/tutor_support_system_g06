import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, Brain, TrendingUp } from 'lucide-react';

interface AIFeedbackAnalysisScreenProps {
  onBack: () => void;
}

interface Improvement {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export function AIFeedbackAnalysisScreen({ onBack }: AIFeedbackAnalysisScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    // Simulate AI analysis (2 seconds)
    const timer = setTimeout(() => {
      setAnalysisData({
        performance: [
          { metric: 'Communication', value: 85 },
          { metric: 'Knowledge', value: 92 },
          { metric: 'Punctuality', value: 78 },
          { metric: 'Engagement', value: 88 },
          { metric: 'Clarity', value: 90 },
          { metric: 'Support', value: 82 },
        ],
        ratingTrend: [
          { month: 'Jan', rating: 4.2 },
          { month: 'Feb', rating: 4.3 },
          { month: 'Mar', rating: 4.4 },
          { month: 'Apr', rating: 4.5 },
          { month: 'May', rating: 4.6 },
          { month: 'Jun', rating: 4.7 },
        ],
        sentiment: [
          { name: 'Positive', value: 65, color: '#10b981' },
          { name: 'Neutral', value: 25, color: '#f59e0b' },
          { name: 'Negative', value: 10, color: '#ef4444' },
        ],
        topics: [
          { topic: 'Teaching Quality', mentions: 45 },
          { topic: 'Response Time', mentions: 38 },
          { topic: 'Material Quality', mentions: 32 },
          { topic: 'Session Structure', mentions: 28 },
          { topic: 'Communication', mentions: 25 },
          { topic: 'Availability', mentions: 20 },
        ],
        improvements: [
          {
            id: '1',
            title: 'Improve Response Time',
            description: 'Students frequently mention slow response times. Consider setting up automated responses or reducing response window.',
            priority: 'High' as const,
          },
          {
            id: '2',
            title: 'Enhance Session Structure',
            description: 'Some students find sessions unstructured. Create a standard session template with clear objectives.',
            priority: 'High' as const,
          },
          {
            id: '3',
            title: 'Increase Material Variety',
            description: 'Add more diverse learning materials including videos, interactive exercises, and real-world examples.',
            priority: 'Medium' as const,
          },
          {
            id: '4',
            title: 'Improve Communication Clarity',
            description: 'Use simpler language and provide more examples when explaining complex concepts.',
            priority: 'Medium' as const,
          },
          {
            id: '5',
            title: 'Expand Availability Hours',
            description: 'Consider adding more evening or weekend slots to accommodate different student schedules.',
            priority: 'Low' as const,
          },
        ],
      });
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">AI Feedback Analysis</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="animate-pulse">
              <Brain className="h-16 w-16 text-primary" />
            </div>
            <p className="text-lg font-medium">Simulating AI Analysis...</p>
            <p className="text-sm text-muted-foreground">Analyzing feedback patterns and generating insights</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-white';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">AI Feedback Analysis</h1>
          <p className="text-muted-foreground">Comprehensive analysis of student feedback</p>
        </div>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={analysisData.performance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#0A84D6"
                      fill="#0A84D6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysisData.ratingTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#0A84D6"
                      strokeWidth={2}
                      name="Rating"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={analysisData.sentiment}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analysisData.sentiment.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {analysisData.sentiment.map((item: any, index: number) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Most Discussed Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysisData.topics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="topic" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="mentions" fill="#0A84D6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Improvement Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.improvements.map((improvement: Improvement) => (
                  <Card key={improvement.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{improvement.title}</h3>
                        <Badge className={getPriorityColor(improvement.priority)}>
                          {improvement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{improvement.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

