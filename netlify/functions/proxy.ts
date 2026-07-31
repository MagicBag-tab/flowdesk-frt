import type { Handler } from '@netlify/functions';

const API_BASE = (process.env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? 'http://98.92.232.157').replace(/\/+$/, '');

export const handler: Handler = async (event) => {
  const path = event.path.replace('/.netlify/functions/proxy', '');
  const url = `${API_BASE}${path}`;

  const authHeader = event.headers.authorization || event.headers.Authorization;

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
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
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detail: String(error) }),
    };
  }
};