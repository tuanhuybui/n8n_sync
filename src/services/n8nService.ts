import { Message, WebhookProfile } from '../types';

const extractMessageFromData = (data: any): string => {
  if (data === null || data === undefined) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'number' || typeof data === 'boolean') return String(data);
  
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    // If all elements are strings, join them. Otherwise, take the first one.
    if (data.every(item => typeof item === 'string')) return data.join('\n');
    return extractMessageFromData(data[0]);
  }
  
  if (typeof data === 'object') {
    // 1. Check common n8n/AI response keys
    const commonKeys = ['output', 'response', 'text', 'message', 'answer', 'content', 'result', 'data'];
    for (const key of commonKeys) {
      if (data[key] !== undefined && data[key] !== null) {
        return extractMessageFromData(data[key]);
      }
    }
    
    // 2. If no known keys, but it has only one key, recurse into that key
    const keys = Object.keys(data);
    if (keys.length === 1) {
      return extractMessageFromData(data[keys[0]]);
    }
    
    // 3. Last resort: Return prettified JSON
    return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
  }
  
  return String(data);
};

export const sendToN8N = async (
  message: string,
  history: Message[],
  profile: WebhookProfile
): Promise<string> => {
  if (!profile.webhookUrl) {
    throw new Error('Webhook URL is not configured');
  }

  try {
    let response: Response;

    if (profile.useProxy === false) {
      // Direct connection (Maximum Privacy)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (profile.authType === 'header' && profile.authHeaderName && profile.authHeaderValue) {
        headers[profile.authHeaderName] = profile.authHeaderValue;
      } else if (profile.authType === 'bearer' && profile.authToken) {
        headers['Authorization'] = `Bearer ${profile.authToken}`;
      }

      response = await fetch(profile.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          history: history.map(m => ({ role: m.role, content: m.content })),
          timestamp: new Date().toISOString(),
        }),
      });
    } else {
      // Proxy connection (Default)
      response = await fetch('/api/proxy-n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          message,
          history,
        }),
      });
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('n8n Webhook not found (404). Please check if your URL is correct and the workflow is ACTIVE.');
      }
      if (response.status === 0 || !response.status) {
        throw new Error('Network error or CORS issue. If using Direct Connection, ensure your n8n instance allows CORS from this domain.');
      }
      const errorText = await response.text().catch(() => '');
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `n8n error (${response.status})`);
      } catch {
        throw new Error(errorText || `n8n error (${response.status})`);
      }
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
      return extractMessageFromData(data);
    } catch {
      // If not JSON, return the raw text
      return text;
    }
  } catch (error) {
    console.error('Error sending to n8n:', error);
    throw error;
  }
};
