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
import { Plus, Trash2, Edit2, Check, Shield, ArrowLeft, Settings2, Globe } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

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
      useProxy: false,
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
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-surface text-text border-border shadow-none">
        <DialogHeader className="px-6 py-8 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-medium tracking-tight">Agent Configuration</DialogTitle>
              <p className="text-sm text-gray-400 mt-1">Manage your AI agents and webhooks</p>
            </div>
            {!editingProfileId && (
              <button 
                onClick={handleAddProfile} 
                className="text-sm font-medium text-brand hover:opacity-60 transition-opacity flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add Agent</span>
              </button>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-6">
            {!editingProfileId ? (
              <div className="space-y-8">
                <div className="grid gap-4">
                  {profiles.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-sm text-gray-400">No agents configured.</p>
                    </div>
                  )}
                  {profiles.map((profile) => (
                    <div 
                      key={profile.id}
                      className="group flex items-center justify-between py-4 border-b border-border last:border-0"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm text-text">{profile.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-text-muted uppercase tracking-widest">{profile.authType}</span>
                          <span className="text-[11px] text-text-muted truncate max-w-[250px] font-mono">{profile.webhookUrl || 'No URL'}</span>
                        </div>
                      </div>
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="text-xs font-medium text-text-muted hover:text-text transition-colors" 
                          onClick={() => handleEditProfile(profile)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-xs font-medium text-text-muted hover:text-red-500 transition-colors" 
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4">
                  <button 
                    className="text-xs text-text-muted hover:text-text transition-colors" 
                    onClick={() => { setEditingProfileId(null); setCurrentProfile({}); }}
                  >
                    Back
                  </button>
                  <h3 className="text-sm font-medium text-text">Edit Agent</h3>
                </div>
                
                <div className="space-y-8">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-[10px] uppercase font-medium text-text-muted tracking-widest">Name</Label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Agent Name"
                      className="w-full py-2 border-b border-border focus:border-brand outline-none transition-colors text-sm bg-transparent text-text"
                      value={currentProfile.name || ''}
                      onChange={(e) => setCurrentProfile({ ...currentProfile, name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="webhookUrl" className="text-[10px] uppercase font-medium text-text-muted tracking-widest">Webhook URL</Label>
                      <span className="text-[9px] text-text-muted uppercase tracking-tighter">Local only</span>
                    </div>
                    <input
                      id="webhookUrl"
                      type="text"
                      className="w-full py-2 border-b border-border focus:border-brand outline-none transition-colors text-sm font-mono bg-transparent text-text"
                      placeholder="https://..."
                      value={currentProfile.webhookUrl || ''}
                      onChange={(e) => setCurrentProfile({ ...currentProfile, webhookUrl: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4">
                    <Label className="text-[10px] uppercase font-medium text-text-muted tracking-widest">Connection</Label>
                    <div className="flex gap-6">
                      <button 
                        className={cn(
                          "text-sm transition-colors",
                          currentProfile.useProxy !== true ? "text-brand font-medium underline underline-offset-4" : "text-text-muted"
                        )}
                        onClick={() => setCurrentProfile({ ...currentProfile, useProxy: false })}
                      >
                        Direct
                      </button>
                      <button 
                        className={cn(
                          "text-sm transition-colors",
                          currentProfile.useProxy === true ? "text-brand font-medium underline underline-offset-4" : "text-text-muted"
                        )}
                        onClick={() => setCurrentProfile({ ...currentProfile, useProxy: true })}
                      >
                        Proxy
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    <Label htmlFor="authType" className="text-[10px] uppercase font-medium text-text-muted tracking-widest">Authentication</Label>
                    <Select
                      value={currentProfile.authType}
                      onValueChange={(value: any) => setCurrentProfile({ ...currentProfile, authType: value })}
                    >
                      <SelectTrigger id="authType" className="h-auto p-0 border-none shadow-none focus:ring-0 text-sm bg-transparent text-text">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border border-border shadow-xl rounded-none">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="header">Custom Header</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {currentProfile.authType === 'header' && (
                    <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-1">
                      <div className="grid gap-2">
                        <Label htmlFor="headerName" className="text-[10px] text-text-muted uppercase tracking-widest">Key</Label>
                        <input
                          id="headerName"
                          className="w-full py-2 border-b border-border focus:border-brand outline-none text-sm bg-transparent text-text"
                          placeholder="X-API-KEY"
                          value={currentProfile.authHeaderName || ''}
                          onChange={(e) => setCurrentProfile({ ...currentProfile, authHeaderName: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="headerValue" className="text-[10px] text-text-muted uppercase tracking-widest">Value</Label>
                          <span className="text-[9px] text-text-muted uppercase tracking-tighter">Private</span>
                        </div>
                        <input
                          id="headerValue"
                          type="password"
                          className="w-full py-2 border-b border-border focus:border-brand outline-none text-sm bg-transparent text-text"
                          value={currentProfile.authHeaderValue || ''}
                          onChange={(e) => setCurrentProfile({ ...currentProfile, authHeaderValue: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {currentProfile.authType === 'bearer' && (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="token" className="text-[10px] text-text-muted uppercase tracking-widest">Token</Label>
                        <span className="text-[9px] text-text-muted uppercase tracking-tighter">Private</span>
                      </div>
                      <input
                        id="token"
                        type="password"
                        className="w-full py-2 border-b border-border focus:border-brand outline-none text-sm bg-transparent text-text"
                        placeholder="Bearer token..."
                        value={currentProfile.authToken || ''}
                        onChange={(e) => setCurrentProfile({ ...currentProfile, authToken: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-8 pt-4">
                  <button className="text-sm font-medium text-brand hover:opacity-60 transition-opacity" onClick={handleSaveProfile}>
                    Save Agent
                  </button>
                  <button className="text-sm font-medium text-text-muted hover:text-text transition-colors" onClick={() => setEditingProfileId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {!editingProfileId && (
          <DialogFooter className="px-6 py-8 border-t border-border bg-surface-hover/20">
            <div className="flex gap-6 w-full justify-end">
              <button 
                className="text-sm font-medium text-text-muted hover:text-text transition-colors" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </button>
              <button 
                className="text-sm font-medium text-brand hover:opacity-60 transition-opacity" 
                onClick={handleFinalSave}
              >
                Apply
              </button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
