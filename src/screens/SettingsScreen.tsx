import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettingsTab } from './ProfileSettingsTab';

export function SettingsScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettingsTab />
        </TabsContent>

        <TabsContent value="notifications">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Notification settings coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Privacy settings coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

