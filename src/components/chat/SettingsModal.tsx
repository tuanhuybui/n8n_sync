import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '@/components/ui/ui-button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { N8NConfig, WebhookProfile } from '../../types';
import { Plus, Trash2, Edit2, Check, Shield, Info } from 'lucide-react';
import { Separator } from '../ui/separator';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: N8NConfig;
  onSave: (config: N8NConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
}) => {
  const [profiles, setProfiles] = useState<WebhookProfile[]>(config.profiles);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Partial<WebhookProfile>>({});

  useEffect(() => {
    setProfiles(config.profiles);
  }, [config.profiles]);

  const handleAddProfile = () => {
    const newProfile: WebhookProfile = {
      id: crypto.randomUUID(),
      name: 'New Agent',
      webhookUrl: '',
      authType: 'none',
    };
    setProfiles([...profiles, newProfile]);
    setEditingProfileId(newProfile.id);
    setCurrentProfile(newProfile);
  };

  const handleEditProfile = (profile: WebhookProfile) => {
    setEditingProfileId(profile.id);
    setCurrentProfile(profile);
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(profiles.filter(p => p.id !== id));
    if (editingProfileId === id) {
      setEditingProfileId(null);
      setCurrentProfile({});
    }
  };

  const handleSaveProfile = () => {
    if (!editingProfileId) return;
    
    const updatedProfiles = profiles.map(p => 
      p.id === editingProfileId ? { ...p, ...currentProfile } as WebhookProfile : p
    );
    setProfiles(updatedProfiles);
    setEditingProfileId(null);
    setCurrentProfile({});
  };

  const handleFinalSave = () => {
    onSave({
      profiles,
      activeProfileId: config.activeProfileId || (profiles.length > 0 ? profiles[0].id : null),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-surface text-text border-border">
        <DialogHeader>
          <DialogTitle>Agent Configurations</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Profiles List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Your Agents</Label>
              <Button variant="outline" size="sm" onClick={handleAddProfile} className="h-8 gap-1 border-border hover:bg-surface-hover text-text">
                <Plus size={14} /> Add Agent
              </Button>
            </div>
            
            <div className="grid gap-2">
              {profiles.length === 0 && (
                <p className="text-sm text-text-muted italic text-center py-4">No agents configured yet.</p>
              )}
              {profiles.map((profile) => (
                <div 
                  key={profile.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-hover/50"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{profile.name}</span>
                    <span className="text-xs text-text-muted truncate max-w-[200px]">{profile.webhookUrl || 'No URL'}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text" onClick={() => handleEditProfile(profile)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteProfile(profile.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {editingProfileId && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-semibold">Editing: {currentProfile.name}</h3>
                
                <div className="grid gap-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    className="bg-surface border-border focus-visible:ring-brand text-text"
                    value={currentProfile.name || ''}
                    onChange={(e) => setCurrentProfile({ ...currentProfile, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    className="bg-surface border-border focus-visible:ring-brand text-text"
                    placeholder="https://your-n8n.com/webhook/..."
                    value={currentProfile.webhookUrl || ''}
                    onChange={(e) => setCurrentProfile({ ...currentProfile, webhookUrl: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="connectionType">Connection Type (Privacy)</Label>
                  <Select
                    value={currentProfile.useProxy === false ? 'direct' : 'proxy'}
                    onValueChange={(value: 'direct' | 'proxy') => setCurrentProfile({ ...currentProfile, useProxy: value === 'direct' ? false : true })}
                  >
                    <SelectTrigger id="connectionType" className="bg-surface border-border focus:ring-brand text-text">
                      <SelectValue placeholder="Select connection type" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border text-text">
                      <SelectItem value="proxy">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-medium">Proxy (Default)</span>
                          <span className="text-[10px] opacity-70">Easier setup, passes through server</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="direct">
                        <div className="flex flex-col items-start gap-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Direct</span>
                            <Shield size={10} className="text-green-500" />
                          </div>
                          <span className="text-[10px] opacity-70">Maximum Privacy, browser to n8n only</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {currentProfile.useProxy === false && (
                    <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg mt-1">
                      <Info size={14} className="text-green-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-green-600 leading-relaxed">
                        <b>Direct Connection:</b> Your credentials never leave your browser. 
                        Ensure your n8n instance allows CORS requests from this domain.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="authType">Authentication Type</Label>
                  <Select
                    value={currentProfile.authType}
                    onValueChange={(value: any) => setCurrentProfile({ ...currentProfile, authType: value })}
                  >
                    <SelectTrigger id="authType" className="bg-surface border-border focus:ring-brand text-text">
                      <SelectValue placeholder="Select auth type" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border text-text">
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="header">Custom Header</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentProfile.authType === 'header' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="headerName">Header Name</Label>
                      <Input
                        id="headerName"
                        className="bg-surface border-border focus-visible:ring-brand text-text"
                        placeholder="X-API-KEY"
                        value={currentProfile.authHeaderName || ''}
                        onChange={(e) => setCurrentProfile({ ...currentProfile, authHeaderName: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="headerValue">Header Value</Label>
                      <Input
                        id="headerValue"
                        type="password"
                        className="bg-surface border-border focus-visible:ring-brand text-text"
                        value={currentProfile.authHeaderValue || ''}
                        onChange={(e) => setCurrentProfile({ ...currentProfile, authHeaderValue: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {currentProfile.authType === 'bearer' && (
                  <div className="grid gap-2">
                    <Label htmlFor="token">Bearer Token</Label>
                    <Input
                      id="token"
                      type="password"
                      className="bg-surface border-border focus-visible:ring-brand text-text"
                      placeholder="ey..."
                      value={currentProfile.authToken || ''}
                      onChange={(e) => setCurrentProfile({ ...currentProfile, authToken: e.target.value })}
                    />
                  </div>
                )}

                <Button className="w-full gap-2 bg-brand text-white hover:bg-brand/90" onClick={handleSaveProfile}>
                  <Check size={16} /> Update Agent Details
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" className="border-border hover:bg-surface-hover text-text" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-brand text-white hover:bg-brand/90" onClick={handleFinalSave}>Save All Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
