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
  profile: WebhookProfile,
  sessionId: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  if (!profile.webhookUrl) {
    throw new Error('Webhook URL is not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minutes timeout

  try {
    let response: Response;
    const body: any = {
      sessionId,
      message,
      history: history.map(m => ({ role: m.role, content: m.content })),
      timestamp: new Date().toISOString(),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 mins

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
        body: JSON.stringify(body),
        signal: controller.signal,
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
          ...body,
        }),
        signal: controller.signal,
      });
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      // ... same error handling as before ...
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

    // Handle Streaming
    if (!response.body) {
      throw new Error('Response body is empty');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      // Split buffer by lines
      const lines = buffer.split('\n');
      // Keep the last partial line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          // Try to parse as n8n streaming JSON
          const parsed = JSON.parse(line);
          if (parsed.type === 'item' && typeof parsed.content === 'string') {
            fullText += parsed.content;
            if (onChunk) onChunk(fullText);
          } else if (parsed.type === 'end') {
            // End of stream signal
          }
        } catch {
          // If a line is not valid JSON, it might be raw text streaming
          // This handles cases where n8n just streams raw text
          if (!line.trim().startsWith('{')) {
            fullText += line + '\n';
            if (onChunk) onChunk(fullText);
          }
        }
      }
    }

    // Process any remaining data in the buffer
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer);
        if (parsed.type === 'item' && typeof parsed.content === 'string') {
          fullText += parsed.content;
        }
      } catch {
        if (!buffer.trim().startsWith('{')) {
          fullText += buffer;
        }
      }
    }

    // After stream completes, try parsing the whole thing as one JSON block (standard Webhook case)
    try {
      const data = JSON.parse(fullText);
      return extractMessageFromData(data);
    } catch {
      return fullText;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Yêu cầu đã quá thời gian chờ (5 phút). Vui lòng thử lại sau.');
    }
    console.error('Error sending to n8n:', error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
