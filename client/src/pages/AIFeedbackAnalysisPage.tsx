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
import { ArrowLeft, Brain, Download, RefreshCw } from 'lucide-react';
import { mockFeedbackAnalysis } from '@/data/mockFeedbackAnalysis';

interface AIFeedbackAnalysisPageProps {
  onBack: () => void;
}

export function AIFeedbackAnalysisPage({ onBack }: AIFeedbackAnalysisPageProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate AI analysis (2 seconds)
    const timer = setTimeout(() => {
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
              <Brain className="h-16 w-16 text-purple-600" />
            </div>
            <p className="text-lg font-medium">Analyzing Feedback...</p>
            <p className="text-sm text-muted-foreground">AI is processing and analyzing student feedback patterns</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">AI Feedback Analysis</h1>
            <p className="text-sm text-muted-foreground">Comprehensive AI powered insights from student feedback</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Re-analyze
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overall Sentiment</p>
                <p className="text-3xl font-bold text-green-600">{mockFeedbackAnalysis.overallSentiment}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                😊
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Rating Trend</p>
                <p className="text-3xl font-bold text-blue-600">{mockFeedbackAnalysis.avgRatingTrend}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                ⚡
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Analyzed</p>
                <p className="text-3xl font-bold text-purple-600">{mockFeedbackAnalysis.totalAnalyzed}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Action Items</p>
                <p className="text-3xl font-bold text-yellow-600">{mockFeedbackAnalysis.actionItems}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                💡
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>✨</span>
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockFeedbackAnalysis.keyInsights.map((insight) => (
                  <li key={insight.id} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{insight.icon}</span>
                    <span className="text-sm text-gray-700">{insight.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={mockFeedbackAnalysis.performanceMetrics}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Rating Trend Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Trend Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockFeedbackAnalysis.ratingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      name="Average Rating"
                      dot={{ fill: '#06b6d4', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="feedbackCount"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Feedback Count"
                      yAxisId="right"
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
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockFeedbackAnalysis.sentiment}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockFeedbackAnalysis.sentiment.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-4">
                  {mockFeedbackAnalysis.sentiment.map((item: any, index: number) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
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
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={mockFeedbackAnalysis.topics}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" />
                  <YAxis dataKey="topic" type="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="mentions" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements">
          <div className="space-y-3">
            {mockFeedbackAnalysis.improvements.map((improvement) => (
              <Card key={improvement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base">{improvement.title}</h3>
                    <Badge variant="outline" className={getPriorityColor(improvement.priority)}>
                      {improvement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {improvement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

