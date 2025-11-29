import { useEffect, useMemo, useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Search, Grid, List, Download, Share2, MoreVertical, Lock, Globe, Shield } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import type { Document, AccessLevel, DocumentType, FileFormat } from '@/domain/entities/document';
import { MaterialVisibility } from '@/domain/enums';
import type { MaterialFilterDto, MaterialMetadataDto } from '@/domain/dtos';
import { materialService } from '@/application/services/materialService';
import { useToast } from '@/components/ui/use-toast';

export function DocumentLibraryScreen() {
  const { role, userId } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accessLevelFilter, setAccessLevelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showManageAccessModal, setShowManageAccessModal] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const currentUserId = userId ?? 'demo-user';

  // Load all documents once on mount
  useEffect(() => {
    let mounted = true;
    const loadDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const filter: MaterialFilterDto = {};
        const data = await materialService.searchMaterials('', filter);
        if (mounted) {
          setDocuments(data);
        }
      } catch (err) {
        if (mounted) {
          setError('Không thể tải thư viện tài liệu.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadDocuments();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter documents based on role and access level
  const filteredDocuments = useMemo(() => {
    let docs = [...documents];

    // Role-based access filtering
    if (role === 'Student') {
      // Students can see public documents and their own documents
      docs = docs.filter(doc => doc.accessLevel === 'public' || doc.uploadedBy === currentUserId);
    } else if (role === 'Tutor') {
      // Tutors can see public, restricted, and their own documents
      docs = docs.filter(doc => 
        doc.accessLevel === 'public' || 
        doc.accessLevel === 'restricted' || 
        doc.uploadedBy === currentUserId
      );
    }
    // Manager can see all (public, restricted, private)

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(
        doc =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.uploadedByName.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      docs = docs.filter(doc => doc.category === categoryFilter);
    }

    // Access level filter (Manager only)
    if (role === 'Manager' && accessLevelFilter !== 'all') {
      docs = docs.filter(doc => doc.accessLevel === accessLevelFilter);
    }

    // Sort
    if (sortBy === 'recent') {
      docs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    } else if (sortBy === 'downloads') {
      docs.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === 'title') {
      docs.sort((a, b) => a.title.localeCompare(b.title));
    }

    return docs;
  }, [searchQuery, categoryFilter, accessLevelFilter, sortBy, role, documents]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, accessLevelFilter, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    documents.forEach((doc) => {
      if (doc.category) {
        cats.add(doc.category);
      }
    });
    return Array.from(cats);
  }, [documents]);

  const totalDownloads = useMemo(() => {
    return filteredDocuments.reduce((sum, doc) => sum + doc.downloads, 0);
  }, [filteredDocuments]);

  const refreshMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: MaterialFilterDto = {};
      const data = await materialService.searchMaterials('', filter);
      setDocuments(data);
    } catch (err) {
      setError('Không thể tải thư viện tài liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      const success = await materialService.deleteMaterial(document.id, currentUserId);
      if (success) {
        toast({
          title: 'Document Deleted',
          description: `"${document.title}" has been deleted.`,
        });
        await refreshMaterials();
      } else {
        toast({
          variant: 'destructive',
          title: 'Delete Failed',
          description: 'You do not have permission to delete this document.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete document. Please try again.',
      });
    }
  };

  const handleShare = async (document: Document) => {
    const success = await materialService.shareMaterial(document.id, currentUserId, 't1');
    toast({
      title: success ? 'Material Shared' : 'Share Failed',
      description: success ? 'Tài liệu đã được chia sẻ.' : 'Không thể chia sẻ tài liệu.',
    });
  };

  const handleDownload = (document: Document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    }
    toast({
      title: 'Download Started',
      description: `Downloading "${document.title}"...`,
    });
  };

  const canDelete = (document: Document): boolean => {
    if (role === 'Manager') return true;
    if (role === 'Tutor' && document.uploadedBy === currentUserId) return true;
    if (role === 'Student' && document.uploadedBy === currentUserId) return true;
    return false;
  };

  const canEdit = (document: Document): boolean => {
    if (role === 'Manager') return true;
    if (role === 'Tutor' && document.uploadedBy === currentUserId) return true;
    if (role === 'Student' && document.uploadedBy === currentUserId) return true;
    return false;
  };

  const handleEditAccess = async (document: Document, newAccessLevel: 'public' | 'restricted' | 'private') => {
    try {
      const success = await materialService.updateAccessLevel(document.id, newAccessLevel, currentUserId);
      if (success) {
        toast({
          title: 'Access Updated',
          description: `Access level for "${document.title}" has been updated.`,
        });
        await refreshMaterials();
      } else {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'You do not have permission to update this document.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update document. Please try again.',
      });
    }
  };

  const canManageAccess = role === 'Manager';

  const getAccessBadge = (accessLevel: AccessLevel) => {
    switch (accessLevel) {
      case 'public':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Globe className="mr-1 h-3 w-3" />
            Public
          </Badge>
        );
      case 'restricted':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Lock className="mr-1 h-3 w-3" />
            Restricted
          </Badge>
        );
      case 'private':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Shield className="mr-1 h-3 w-3" />
            Private
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Đang tải tài liệu...</p>
        <p className="text-xs mt-2">Loading {documents.length} documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>{error}</p>
        <p className="text-xs mt-2">Total documents in system: {documents.length}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Library</h1>
          <p className="text-muted-foreground">
            Access and manage course materials, assignments, and study resources.
          </p>
        </div>
        {/* Upload Button - Available for Students and Tutors */}
        {(role === 'Student' || role === 'Tutor') && (
          <Button onClick={() => setShowUploadModal(true)} className="bg-primary hover:bg-primary-dark">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by title, author, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Access Level Filter - Manager Only */}
            {role === 'Manager' && (
              <Select value={accessLevelFilter} onValueChange={setAccessLevelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Access Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Access Levels</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="downloads">Most Downloads</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{filteredDocuments.length} documents found</span>
        <span>{totalDownloads} total downloads</span>
        {documents.length > 0 && (
          <span className="text-xs">({documents.length} total in library)</span>
        )}
      </div>

      {/* Document List/Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No documents found.</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={handleDelete}
              onShare={handleShare}
              onDownload={handleDownload}
              onManageAccess={() => {
                setSelectedDocument(doc);
                setShowManageAccessModal(true);
              }}
              canDelete={canDelete(doc)}
              canEdit={canEdit(doc)}
              canManageAccess={canManageAccess}
              getAccessBadge={getAccessBadge}
              onEditAccess={handleEditAccess}
            />
          ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={handleDelete}
              onShare={handleShare}
              onDownload={handleDownload}
              onManageAccess={() => {
                setSelectedDocument(doc);
                setShowManageAccessModal(true);
              }}
              canDelete={canDelete(doc)}
              canEdit={canEdit(doc)}
              canManageAccess={canManageAccess}
              getAccessBadge={getAccessBadge}
              onEditAccess={handleEditAccess}
              listView
            />
          ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      <UploadDocumentModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        currentUserId={currentUserId}
        onUploaded={refreshMaterials}
      />

      {/* Manage Access Modal */}
      {selectedDocument && (
        <ManageAccessModal
          document={selectedDocument}
          open={showManageAccessModal}
          onOpenChange={setShowManageAccessModal}
        />
      )}
    </div>
  );
}

interface DocumentCardProps {
  document: Document;
  onDelete: (doc: Document) => void;
  onShare: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onManageAccess: () => void;
  onEditAccess?: (doc: Document, level: 'public' | 'restricted' | 'private') => void;
  canDelete: boolean;
  canEdit: boolean;
  canManageAccess: boolean;
  getAccessBadge: (level: AccessLevel) => React.ReactNode;
  listView?: boolean;
}

function DocumentCard({
  document,
  onDelete,
  onShare,
  onDownload,
  onManageAccess,
  onEditAccess,
  canDelete,
  canEdit,
  canManageAccess,
  getAccessBadge,
  listView = false,
}: DocumentCardProps) {
  // Chỉ Manager mới thấy badge Public/Private và menu "..."
  const showAccessControls = canManageAccess;

  if (listView) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{document.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{document.description}</p>
                </div>
                {showAccessControls && getAccessBadge(document.accessLevel)}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{document.type}</span>
                <span>•</span>
                <span>{document.format}</span>
                <span>•</span>
                <span>{document.size}</span>
                <span>•</span>
                <span>{document.downloads} downloads</span>
                <span>•</span>
                <span>by {document.uploadedByName}</span>
                <span>•</span>
                <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onDownload(document)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => onShare(document)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              {showAccessControls && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <>
                        <DropdownMenuItem onClick={() => onEditAccess?.(document, 'public')}>
                          Set Public
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditAccess?.(document, 'restricted')}>
                          Set Restricted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditAccess?.(document, 'private')}>
                          Set Private
                        </DropdownMenuItem>
                      </>
                    )}
                    {canDelete && (
                      <DropdownMenuItem onClick={() => onDelete(document)}>
                        Delete
                      </DropdownMenuItem>
                    )}
                    {canManageAccess && (
                      <DropdownMenuItem onClick={onManageAccess}>
                        Manage Access
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{document.title}</CardTitle>
          {showAccessControls && getAccessBadge(document.accessLevel)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{document.description}</p>
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center justify-between">
            <span>{document.type}</span>
            <span>{document.format}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{document.size}</span>
            <span>{document.downloads} downloads</span>
          </div>
          <div className="text-xs">
            by {document.uploadedByName} • {new Date(document.uploadDate).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onDownload(document)}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onShare(document)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          {showAccessControls && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canDelete && (
                  <DropdownMenuItem onClick={() => onDelete(document)}>
                    Delete
                  </DropdownMenuItem>
                )}
                {canManageAccess && (
                  <DropdownMenuItem onClick={onManageAccess}>
                    Manage Access
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  onUploaded?: () => void;
}

function UploadDocumentModal({
  open,
  onOpenChange,
  currentUserId,
  onUploaded,
}: UploadDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DocumentType>('Lecture Notes');
  const [visibility, setVisibility] = useState<MaterialVisibility>(MaterialVisibility.PUBLIC);
  const [format, setFormat] = useState<FileFormat>('PDF');
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!title.trim() || !file) {
      toast({
        variant: 'error',
        title: 'Missing Information',
        description: 'Please provide title and file.',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'error',
        title: 'File Too Large',
        description: 'File must be <= 10MB.',
      });
      return;
    }

    const metadata: MaterialMetadataDto = {
      title,
      description,
      type,
      visibility,
      format,
    };

    await materialService.uploadMaterial(file, metadata, currentUserId);

    toast({
      title: 'Document Uploaded',
      description: `"${title}" has been uploaded successfully.`,
    });

    setTitle('');
    setDescription('');
    setType('Lecture Notes');
    setVisibility(MaterialVisibility.PUBLIC);
    setFormat('PDF');
    setFile(null);
    onOpenChange(false);
    onUploaded?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document to the library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as DocumentType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lecture Notes">Lecture Notes</SelectItem>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                  <SelectItem value="Study Material">Study Material</SelectItem>
                  <SelectItem value="Research Paper">Research Paper</SelectItem>
                  <SelectItem value="Lab Manual">Lab Manual</SelectItem>
                  <SelectItem value="Project Report">Project Report</SelectItem>
                  <SelectItem value="Syllabus">Syllabus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as MaterialVisibility)}>
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MaterialVisibility.PUBLIC}>Public</SelectItem>
                  <SelectItem value={MaterialVisibility.TUTOR_ONLY}>Tutor Only</SelectItem>
                  <SelectItem value={MaterialVisibility.SESSION_ONLY}>Session Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as FileFormat)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="DOCX">DOCX</SelectItem>
                <SelectItem value="ZIP">ZIP</SelectItem>
                <SelectItem value="PPTX">PPTX</SelectItem>
                <SelectItem value="XLSX">XLSX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ManageAccessModalProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ManageAccessModal({ document, open, onOpenChange }: ManageAccessModalProps) {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(document.accessLevel);
  const { toast } = useToast();

  const handleSave = () => {
    // In real app, this would update on server
    console.log('Update access level:', document.id, accessLevel);
    toast({
      title: 'Access Updated',
      description: `Access level for "${document.title}" has been updated.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Access</DialogTitle>
          <DialogDescription>
            Change the access level for "{document.title}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="access-level">Access Level</Label>
            <Select
              value={accessLevel}
              onValueChange={(value) => setAccessLevel(value as AccessLevel)}
            >
              <SelectTrigger id="access-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

