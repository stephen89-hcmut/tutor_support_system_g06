import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare } from 'lucide-react';

interface FeedbackScreenProps {
  onAIAnalysis: () => void;
}

export function FeedbackScreen({ onAIAnalysis }: FeedbackScreenProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback</h1>
          <p className="text-muted-foreground">View and manage student feedback</p>
        </div>
        <Button
          onClick={onAIAnalysis}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Brain className="mr-2 h-4 w-4" />
          AI Analysis
        </Button>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">Student Feedback</h3>
                    <p className="text-sm text-muted-foreground">Nov 20, 2024</p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <p className="text-sm">
                  The session was very helpful. Can we cover more advanced topics?
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">Student Feedback</h3>
                    <p className="text-sm text-muted-foreground">Nov 18, 2024</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Responded
                  </Badge>
                </div>
                <p className="text-sm mb-2">
                  I need more practice problems on binary trees.
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Your Response:</p>
                  <p className="text-sm">
                    Thank you for the feedback! I will prepare more practice problems for our next session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

