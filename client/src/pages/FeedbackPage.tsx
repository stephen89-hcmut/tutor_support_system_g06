import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Brain, Search, Star } from 'lucide-react';
import { mockFeedback } from '@/data/mockFeedback';

interface FeedbackPageProps {
  onAIAnalysis: () => void;
}

export function FeedbackPage({ onAIAnalysis }: FeedbackPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All Status' | 'Responded' | 'Pending' | 'New'>('All Status');

  const filteredFeedback = useMemo(() => {
    let result = mockFeedback;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(f =>
        f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'All Status') {
      result = result.filter(f => f.status === statusFilter);
    }

    return result;
  }, [searchTerm, statusFilter]);

  // Calculate stats
  const totalFeedback = mockFeedback.length;
  const pendingResponse = mockFeedback.filter(f => f.status === 'Pending' || f.status === 'New').length;
  const responded = mockFeedback.filter(f => f.status === 'Responded').length;
  const avgRating = mockFeedback.length > 0
    ? (mockFeedback.reduce((sum, f) => sum + f.rating, 0) / mockFeedback.length).toFixed(1)
    : 0;

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Helper to render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Responded':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'New':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Feedback</h1>
          <p className="text-sm text-muted-foreground">View and respond to feedback from your students</p>
        </div>
        <Button
          onClick={onAIAnalysis}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Brain className="mr-2 h-4 w-4" />
          AI Feedback Analysis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Feedback</p>
                <p className="text-3xl font-bold">{totalFeedback}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Response</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingResponse}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏱️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                <p className="text-3xl font-bold text-green-600">{avgRating}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Responded</p>
                <p className="text-3xl font-bold text-blue-600">{responded}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, session, or feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Responded">Responded</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="New">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No feedback found.
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map(feedback => (
            <Card key={feedback.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {getInitials(feedback.studentName)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{feedback.studentName}</h3>
                          <Badge variant="outline" className={getStatusColor(feedback.status)}>
                            {feedback.status}
                          </Badge>
                          {feedback.status === 'New' && (
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {feedback.topic}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground mb-1">{feedback.date}</p>
                        <div className="flex justify-end">
                          {renderStars(feedback.rating)}
                        </div>
                        <p className="text-xs font-semibold text-yellow-600">{feedback.rating}/5</p>
                      </div>
                    </div>

                    {/* Feedback Message */}
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {feedback.message}
                    </p>

                    {/* Response (if exists) */}
                    {feedback.response && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Your Response:</p>
                        <p className="text-sm text-blue-800">
                          {feedback.response}
                        </p>
                        {feedback.responseDate && (
                          <p className="text-xs text-blue-600 mt-1">{feedback.responseDate}</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {feedback.status !== 'Responded' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700">
                          Respond
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Expand Arrow */}
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

