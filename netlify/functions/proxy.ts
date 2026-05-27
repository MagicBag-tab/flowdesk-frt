import type { Handler } from '@netlify/functions';

const API_BASE = 'http://3.235.13.20';

export const handler: Handler = async (event) => {
  console.log('Event path:', event.path);
  console.log('Event httpMethod:', event.httpMethod);
  const path = event.path.replace('/.netlify/functions/proxy', '');
  const url = `${API_BASE}${path}`;

  console.log('Proxying to:', url);

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...(event.headers.authorization
          ? { Authorization: event.headers.authorization }
          : {}),
      },
      body: ['GET', 'HEAD'].includes(event.httpMethod) ? undefined : (event.body ?? undefined),
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: data,
    };
  } catch (error) {
    console.log('Proxy error:', error);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detail: String(error) }),
    };
  }
};