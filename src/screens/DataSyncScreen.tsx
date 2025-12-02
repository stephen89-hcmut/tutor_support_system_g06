import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { mockSyncHistory, mockSyncServices } from '@/data/mockDataSync';
import type { SyncStatus } from '@/domain/entities/dataSync';
import { useToast } from '@/components/ui/use-toast';

interface DataSyncScreenProps {
  onBack: () => void;
}

export function DataSyncScreen({ onBack }: DataSyncScreenProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncHistory, setSyncHistory] = useState(mockSyncHistory);
  const { toast } = useToast();

  const stats = useMemo(() => {
    const successful = syncHistory.filter(s => s.status === 'Success').length;
    const failed = syncHistory.filter(s => s.status === 'Failed').length;
    const totalRecords = syncHistory.reduce((sum, s) => sum + s.recordsSync, 0);
    const avgIntegrity = Math.round(
      syncHistory.reduce((sum, s) => sum + s.dataIntegrity, 0) / syncHistory.length
    );
    return { successful, failed, totalRecords, avgIntegrity };
  }, [syncHistory]);

  const handleSyncNow = async () => {
    setSyncing(true);
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newSync = {
      id: `sync-${Date.now()}`,
      module: 'All Modules' as const,
      status: 'Success' as SyncStatus,
      recordsSync: Math.floor(Math.random() * 500) + 200,
      lastSync: 'Just now',
      duration: '2.5s',
      message: 'Manual synchronization completed successfully',
      timestamp: new Date().toISOString(),
      dataIntegrity: 100,
    };

    setSyncHistory(prev => [newSync, ...prev]);
    setSyncing(false);
    toast({
      title: 'Sync Complete',
      description: `Successfully synced ${newSync.recordsSync} records across all modules.`,
    });
  };

  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'In Progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: SyncStatus) => {
    switch (status) {
      case 'Success':
        return 'bg-green-50';
      case 'Failed':
        return 'bg-red-50';
      case 'Pending':
        return 'bg-yellow-50';
      case 'In Progress':
        return 'bg-blue-50';
    }
  };

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
            <h1 className="text-3xl font-bold">Data Synchronization</h1>
          </div>
          <p className="text-muted-foreground">Manage data sync between main system and HCMUT services</p>
        </div>
        <Button
          onClick={handleSyncNow}
          disabled={syncing}
          className="gap-2"
        >
          {syncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Sync Now
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Syncs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successful}</div>
            <p className="text-xs text-muted-foreground">out of {syncHistory.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Syncs</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records Synced</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">across all modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Integrity</CardTitle>
            <div className="text-lg font-bold">{stats.avgIntegrity}%</div>
          </CardHeader>
          <CardContent>
            <Progress value={stats.avgIntegrity} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">average integrity score</p>
          </CardContent>
        </Card>
      </div>

      {/* API Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {mockSyncServices.map(service => (
              <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.endpoint}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-muted-foreground">Last check: {service.lastCheck}</p>
                  <Badge variant={service.status === 'Connected' ? 'success' : 'destructive'}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Integrity</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncHistory.map(sync => (
                <TableRow key={sync.id} className={getStatusColor(sync.status)}>
                  <TableCell className="text-sm">{sync.lastSync}</TableCell>
                  <TableCell className="font-medium">{sync.module}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sync.status)}
                      <Badge
                        variant={
                          sync.status === 'Success'
                            ? 'success'
                            : sync.status === 'Failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {sync.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{sync.recordsSync}</TableCell>
                  <TableCell className="text-sm">{sync.duration}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={sync.dataIntegrity} className="w-12 h-2" />
                      <span className="text-xs font-medium">{sync.dataIntegrity}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{sync.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
