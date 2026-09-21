import { createHash } from 'node:crypto';
import type { H3Event } from 'h3';
import { fetchLatestTidalPlaylists } from '../../utils/tidal-api';

function accountKey(event: H3Event) {
  const { tidal } = useRuntimeConfig(event);
  return createHash('sha256').update(`${tidal.clientId}:${tidal.refreshToken}`).digest('hex');
}

const getPlaylists = defineCachedFunction(async (event: H3Event) => {
  const { tidal } = useRuntimeConfig(event);
  const storage = useStorage('tidal');
  const tokenKey = `auth:${accountKey(event)}`;
  const refreshToken = await storage.getItem<string>(tokenKey) || tidal.refreshToken;
  const tokenResponse = await fetch('https://auth.tidal.com/v1/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: tidal.clientId,
      refresh_token: refreshToken,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!tokenResponse.ok) throw new Error(`TIDAL authorization failed (${tokenResponse.status}).`);
  const token = await tokenResponse.json() as { access_token: string; refresh_token?: string };
  if (!token.access_token) throw new Error('TIDAL did not return an access token.');

  // Retain rotated refresh tokens across process restarts and weekly refreshes.
  if (token.refresh_token) await storage.setItem(tokenKey, token.refresh_token);

  const playlists = await fetchLatestTidalPlaylists(token.access_token, tidal.countryCode);
  return { playlists, updatedAt: new Date().toISOString() };
}, {
  name: 'latest-playlists',
  base: 'tidal',
  maxAge: 60 * 60 * 24 * 7,
  swr: true,
  getKey: event => `${accountKey(event)}:${useRuntimeConfig(event).tidal.countryCode}`,
});

export default defineEventHandler(async (event) => {
  const { tidal } = useRuntimeConfig(event);
  if (!tidal.clientId || !tidal.refreshToken) {
    throw createError({ statusCode: 503, statusMessage: 'TIDAL playlists are not connected yet.' });
  }
  try {
    return await getPlaylists(event);
  } catch {
    // Keep upstream responses and owner credentials out of the public response.
    throw createError({ statusCode: 502, statusMessage: 'TIDAL playlists are temporarily unavailable.' });
  }
});
