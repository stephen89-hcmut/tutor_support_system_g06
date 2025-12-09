import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import type { TutorProfile } from '@/domain/entities/tutor';
import { tutorService } from '@/application/services/tutorService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/components/ui/use-toast';

interface TutorManagementListPageProps {
  onBack: () => void;
}

export function TutorManagementListPage({ onBack }: TutorManagementListPageProps) {
  const { data, loading, error } = useAsyncData<TutorProfile[]>(() => tutorService.list(), []);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const { toast } = useToast();

  useMemo(() => {
    if (data) {
      setTutors(data);
    }
  }, [data]);

  const filteredTutors = useMemo(() => {
    return tutors.filter(tutor =>
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tutors, searchTerm]);

  const stats = useMemo(() => {
    if (!tutors.length) {
      return { total: 0, available: 0, inactive: 0, avgRating: '0.0' };
    }
    const total = tutors.length;
    const available = tutors.filter((t) => t.department === 'Mathematics' || t.department === 'Physics').length;
    const inactive = 0;
    const avgRating = (
      tutors.reduce((sum, t) => sum + (t.rating || 0), 0) / tutors.length
    ).toFixed(1);
    return { total, available, inactive, avgRating };
  }, [tutors]);

  const handleDeleteTutor = (tutor: TutorProfile) => {
    setSelectedTutor(tutor);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedTutor) return;
    setTutors(prev => prev.filter(t => t.id !== selectedTutor.id));
    setShowDeleteDialog(false);
    toast({
      title: 'Success',
      description: `Tutor ${selectedTutor.name} has been removed.`,
    });
    setSelectedTutor(null);
  };

  const handleEditTutor = (tutor: TutorProfile) => {
    toast({
      title: 'Edit Tutor',
      description: `Edit tutor: ${tutor.name}`,
    });
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading tutors...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-muted-foreground">Error loading tutors</div>;
  }

  const totalPages = Math.ceil(filteredTutors.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedTutors = filteredTutors.slice(startIdx, startIdx + itemsPerPage);

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
            <h1 className="text-3xl font-bold">Tutor Management</h1>
          </div>
          <p className="text-muted-foreground">View and manage all tutors in the system</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Tutor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
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
            placeholder="Search tutors by name or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Tutors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tutors List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTutors.map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell className="font-medium">{tutor.name}</TableCell>
                  <TableCell>{tutor.id}</TableCell>
                  <TableCell>{tutor.department}</TableCell>
                  <TableCell>{tutor.specialization || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tutor.sessionCount || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{tutor.rating?.toFixed(1) || 'N/A'}</span>
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
                        <DropdownMenuItem onClick={() => handleEditTutor(tutor)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTutor(tutor)}
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
            <DialogTitle>Delete Tutor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tutor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTutor && (
            <div className="py-4">
              <p className="font-medium">{selectedTutor.name}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedTutor.id}</p>
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
