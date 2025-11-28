import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Users, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { mockStudents, Student } from '@/data/mockStudents';

interface StudentManagementScreenProps {
  onViewStudent: (studentId: string) => void;
  onViewProgress: (studentId: string) => void;
  onViewFeedback: (studentId: string) => void;
  onRecordProgress: (studentId: string) => void;
}

export function StudentManagementScreen({
  onViewStudent,
  onViewProgress,
  onViewFeedback,
  onRecordProgress,
}: StudentManagementScreenProps) {

  const stats = useMemo(() => {
    const total = mockStudents.length;
    const active = mockStudents.filter(s => s.status === 'Active').length;
    const atRisk = mockStudents.filter(s => s.status === 'At Risk').length;
    const avgRating = mockStudents.reduce((sum, s) => sum + s.rating, 0) / total;

    return { total, active, atRisk, avgRating: avgRating.toFixed(1) };
  }, []);


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.atRisk}</div>
            {stats.atRisk > 0 && (
              <Badge variant="danger" className="mt-2">
                Needs Attention
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}</div>
            <p className="text-xs text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className="w-24" />
                      <span className="text-sm text-muted-foreground">
                        {student.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.status === 'At Risk'
                          ? 'danger'
                          : student.status === 'Active'
                          ? 'success'
                          : 'secondary'
                      }
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewStudent(student.id)}>
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRecordProgress(student.id)}
                        >
                          Record Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onViewProgress(student.id)}
                        >
                          View Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onViewFeedback(student.id)}
                        >
                          View Feedback
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}

