import { Message, WebhookProfile } from '../types';

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `n8n error (${response.status})`);
    }

    const data = await response.json();
    
    // Handle common n8n response patterns
    if (typeof data === 'string') return data;
    if (data.output) return data.output;
    if (data.response) return data.response;
    if (data.text) return data.text;
    if (data.message) return data.message;
    
    // If it's an object but we don't recognize the key, return it as stringified JSON
    return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
  } catch (error) {
    console.error('Error sending to n8n:', error);
    throw error;
  }
};
