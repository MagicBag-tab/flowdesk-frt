import type { Handler } from '@netlify/functions';

const API_BASE = 'http://3.235.13.20';

export const handler: Handler = async (event) => {
  const path = event.path.replace('/.netlify/functions/proxy', '');
  const url = `${API_BASE}${path}`;

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...(event.headers.authorization
          ? { Authorization: event.headers.authorization }
          : {}),
      },
      body: event.body ?? undefined,
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({ detail: 'Proxy error' }),
    };
  }
};