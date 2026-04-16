export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface WebhookProfile {
  id: string;
  name: string;
  webhookUrl: string;
  authType: 'none' | 'header' | 'bearer';
  authHeaderName?: string;
  authHeaderValue?: string;
  authToken?: string;
  useProxy?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  profileId: string;
  createdAt: number;
  updatedAt: number;
}

export interface N8NConfig {
  profiles: WebhookProfile[];
  activeProfileId: string | null;
}
