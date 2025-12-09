import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PaginationEnhanced } from '@/components/ui/pagination-enhanced';
import { ArrowLeft, MoreVertical, Users, CheckCircle, AlertTriangle, Star, Plus, Trash2, Edit } from 'lucide-react';
import type { StudentProfile } from '@/domain/entities/student';
import { studentService } from '@/application/services/studentService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/components/ui/use-toast';

interface StudentManagementListPageProps {
  onBack: () => void;
}

export function StudentManagementListPage({ onBack }: StudentManagementListPageProps) {
  const { data, loading, error } = useAsyncData<StudentProfile[]>(() => studentService.list(), []);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const { toast } = useToast();

  useMemo(() => {
    if (data) {
      setStudents(data);
    }
  }, [data]);

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const stats = useMemo(() => {
    if (!students.length) {
      return { total: 0, active: 0, atRisk: 0, avgRating: '0.0' };
    }
    const total = students.length;
    const active = students.filter((s) => s.status === 'Active').length;
    const atRisk = students.filter((s) => s.status === 'At Risk').length;
    const avgRating = (
      students.reduce((sum, s) => sum + (s.rating || 0), 0) / students.length
    ).toFixed(1);
    return { total, active, atRisk, avgRating };
  }, [students]);

  const handleDeleteStudent = (student: StudentProfile) => {
    setSelectedStudent(student);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedStudent) return;
    setStudents(prev => prev.filter(s => s.id !== selectedStudent.id));
    setShowDeleteDialog(false);
    toast({
      title: 'Success',
      description: `Student ${selectedStudent.name} has been removed.`,
    });
    setSelectedStudent(null);
  };

  const handleEditStudent = (student: StudentProfile) => {
    toast({
      title: 'Edit Student',
      description: `Edit student: ${student.name}`,
    });
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading students...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-muted-foreground">Error loading students</div>;
  }

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Student Management</h1>
          </div>
          <p className="text-muted-foreground">View and manage all students in the system</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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
              <Badge variant="destructive" className="mt-2">
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

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search students by name or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.email || 'N/A'}</TableCell>
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
                          ? 'destructive'
                          : student.status === 'Active'
                          ? 'success'
                          : 'secondary'
                      }
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{student.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteStudent(student)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-6 pt-4">
              <PaginationEnhanced
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="py-4">
              <p className="font-medium">{selectedStudent.name}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedStudent.studentId}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
