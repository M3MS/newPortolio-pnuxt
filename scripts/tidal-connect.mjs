import { createHash, randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const clientId = process.env.NUXT_TIDAL_CLIENT_ID;
if (!clientId) throw new Error('Set NUXT_TIDAL_CLIENT_ID in .env first.');

const redirectUri = 'http://localhost:8787/callback';
const verifier = randomBytes(32).toString('base64url');
const state = randomBytes(32).toString('base64url');
const authorizeUrl = new URL('https://login.tidal.com/authorize');
authorizeUrl.search = new URLSearchParams({
  client_id: clientId,
  response_type: 'code',
  redirect_uri: redirectUri,
  scope: 'playlists.read',
  code_challenge: createHash('sha256').update(verifier).digest('base64url'),
  code_challenge_method: 'S256',
  state,
}).toString();

let exchanging = false;
const server = createServer(async (request, response) => {
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  const url = new URL(request.url, redirectUri);
  if (url.pathname !== '/callback') {
    response.writeHead(404).end('Not found');
    return;
  }
  if (url.searchParams.get('state') !== state) {
    response.writeHead(400).end('Invalid authorization state.');
    return;
  }
  if (exchanging) {
    response.writeHead(409).end('Authorization is already being completed.');
    return;
  }
  exchanging = true;

  try {
    const code = url.searchParams.get('code');
    if (!code || url.searchParams.has('error')) {
      throw new Error('Authorization was declined. Run npm run tidal:connect to try again.');
    }
    const tokenResponse = await fetch('https://auth.tidal.com/v1/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!tokenResponse.ok) {
      throw new Error(`TIDAL token exchange failed (${tokenResponse.status}). Check the app redirect URI and playlists.read scope.`);
    }
    const tokens = await tokenResponse.json();
    if (!tokens.refresh_token) throw new Error('TIDAL did not return a refresh token.');

    const env = await readFile('.env', 'utf8');
    const setting = `NUXT_TIDAL_REFRESH_TOKEN=${tokens.refresh_token}`;
    const updated = /^NUXT_TIDAL_REFRESH_TOKEN=.*$/m.test(env)
      ? env.replace(/^NUXT_TIDAL_REFRESH_TOKEN=.*$/m, setting)
      : `${env.trimEnd()}\n${setting}\n`;
    await writeFile('.env', updated, { mode: 0o600 });
    response.end('TIDAL connected. You can close this window and restart your Nuxt server.');
    console.log('Saved the owner refresh token to .env. Restart Nuxt to load your playlists.');
  } catch (error) {
    // Avoid logging token responses or credentials.
    const message = error instanceof Error ? error.message : 'TIDAL authorization failed.';
    console.error(message);
    response.writeHead(500).end(message);
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
    server.close();
  }
});

const timeout = setTimeout(() => {
  console.error('Authorization timed out. Run npm run tidal:connect to try again.');
  server.close();
  process.exitCode = 1;
}, 10 * 60 * 1000);
server.on('error', error => {
  clearTimeout(timeout);
  console.error(`Cannot start the local callback server: ${error.message}`);
  process.exitCode = 1;
});
server.listen(8787, 'localhost', () => {
  console.log(`Register ${redirectUri} as a redirect URI in your TIDAL developer app.`);
  console.log('Open this URL and sign in as the owner of your playlists:');
  console.log(authorizeUrl.href);
});
