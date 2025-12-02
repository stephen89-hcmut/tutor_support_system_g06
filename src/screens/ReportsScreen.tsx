import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Download, FileText, Eye, Loader2 } from 'lucide-react';
import { availableReports, mockGeneratedReports } from '@/data/mockReports';
import type { GeneratedReport, ReportType } from '@/domain/entities/report';
import { useToast } from '@/components/ui/use-toast';

interface ReportsScreenProps {
  onBack: () => void;
}

export function ReportsScreen({ onBack }: ReportsScreenProps) {
  const [selectedReportType, setSelectedReportType] = useState<ReportType | ''>('');
  const [dateRange, setDateRange] = useState<string>('last-30-days');
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(mockGeneratedReports);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewReport, setPreviewReport] = useState<GeneratedReport | null>(null);
  const { toast } = useToast();

  const dateRangeOptions = [
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'last-90-days', label: 'Last 90 Days' },
    { value: 'last-year', label: 'Last Year' },
  ];

  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      toast({
        title: 'Error',
        description: 'Please select a report type',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const selectedReport = availableReports.find(r => r.type === selectedReportType);
    const newReport: GeneratedReport = {
      id: `gen-${Date.now()}`,
      title: selectedReport?.title || 'Unknown Report',
      type: selectedReportType,
      generatedAt: new Date().toISOString(),
      dateRange: dateRangeOptions.find(d => d.value === dateRange)?.label || 'Custom Range',
      recordCount: Math.floor(Math.random() * 5000) + 100,
      summary: {
        totalUsers: Math.floor(Math.random() * 1000) + 100,
        activeSessions: Math.floor(Math.random() * 500) + 50,
        avgEngagement: Math.round(Math.random() * 30 + 60),
        completionRate: Math.round(Math.random() * 20 + 75),
      },
    };

    setGeneratedReports(prev => [newReport, ...prev]);
    setGenerating(false);
    setSelectedReportType('');
    setDateRange('last-30-days');

    toast({
      title: 'Success',
      description: `${newReport.title} generated successfully with ${newReport.recordCount} records.`,
    });
  };

  const handlePreview = (report: GeneratedReport) => {
    setPreviewReport(report);
    setShowPreview(true);
  };

  const handleExport = (format: 'pdf' | 'excel', report?: GeneratedReport) => {
    const targetReport = report || previewReport;
    if (!targetReport) return;

    toast({
      title: 'Exporting',
      description: `Exporting ${targetReport.title} as ${format.toUpperCase()}...`,
    });

    // Simulate export
    setTimeout(() => {
      toast({
        title: 'Success',
        description: `Report exported as ${format.toUpperCase()} successfully.`,
      });
    }, 1500);
  };

  const stats = useMemo(() => {
    return {
      totalReports: generatedReports.length,
      totalRecords: generatedReports.reduce((sum, r) => sum + r.recordCount, 0),
      avgEngagement: Math.round(
        generatedReports.reduce((sum, r) => sum + (r.summary.avgEngagement || 0), 0) /
          generatedReports.length
      ) || 0,
    };
  }, [generatedReports]);

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
            <h1 className="text-3xl font-bold">Generate Report & Analyse</h1>
          </div>
          <p className="text-muted-foreground">Access statistics and system activity reports</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <span className="text-lg">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <span className="text-lg">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgEngagement}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={selectedReportType} onValueChange={(value) => setSelectedReportType(value as ReportType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {availableReports.map(report => (
                    <SelectItem key={report.id} value={report.type}>
                      {report.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                disabled={generating || !selectedReportType}
                className="w-full gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Report'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Available Report Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableReports.map(report => (
              <div
                key={report.id}
                className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                onClick={() => setSelectedReportType(report.type)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{report.icon}</span>
                  <Badge variant="outline">{report.type}</Badge>
                </div>
                <h3 className="font-semibold mb-1">{report.title}</h3>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generatedReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No Report Generated</p>
                <p className="text-sm">Select a report type and date range, then click 'Generate Report'</p>
              </div>
            ) : (
              generatedReports.map(report => (
                <div
                  key={report.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(report.generatedAt).toLocaleString()} • {report.dateRange}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(report)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport('pdf', report)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-2 md:grid-cols-4 text-sm">
                    {report.summary.totalUsers && (
                      <div>
                        <p className="text-muted-foreground">Total Users</p>
                        <p className="font-semibold">{report.summary.totalUsers}</p>
                      </div>
                    )}
                    {report.summary.activeSessions && (
                      <div>
                        <p className="text-muted-foreground">Active Sessions</p>
                        <p className="font-semibold">{report.summary.activeSessions}</p>
                      </div>
                    )}
                    {report.summary.avgEngagement && (
                      <div>
                        <p className="text-muted-foreground">Avg Engagement</p>
                        <p className="font-semibold">{report.summary.avgEngagement}%</p>
                      </div>
                    )}
                    {report.summary.completionRate && (
                      <div>
                        <p className="text-muted-foreground">Completion Rate</p>
                        <p className="font-semibold">{report.summary.completionRate}%</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Records: {report.recordCount}</span>
                    </div>
                    <Progress value={(report.recordCount / 10000) * 100} className="h-1" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Preview Dialog */}
      {previewReport && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{previewReport.title}</DialogTitle>
              <DialogDescription>
                Generated on {new Date(previewReport.generatedAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Date Range</p>
                  <p className="font-semibold">{previewReport.dateRange}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="font-semibold">{previewReport.recordCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-sm">Report Summary</h4>
                <div className="grid gap-3 md:grid-cols-2 text-sm">
                  {previewReport.summary.totalUsers && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Users:</span>
                      <span className="font-medium">{previewReport.summary.totalUsers}</span>
                    </div>
                  )}
                  {previewReport.summary.activeSessions && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Sessions:</span>
                      <span className="font-medium">{previewReport.summary.activeSessions}</span>
                    </div>
                  )}
                  {previewReport.summary.avgEngagement && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Engagement:</span>
                      <span className="font-medium">{previewReport.summary.avgEngagement}%</span>
                    </div>
                  )}
                  {previewReport.summary.completionRate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completion Rate:</span>
                      <span className="font-medium">{previewReport.summary.completionRate}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
              <Button onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
              <Button onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Export as Excel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
