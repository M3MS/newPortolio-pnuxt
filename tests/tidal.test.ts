import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { fetchLatestTidalPlaylists } from '../server/utils/tidal-api.ts';

afterEach(() => mock.restoreAll());

function playlist(id: string, day: number, accessType = 'PUBLIC') {
  return {
    id,
    type: 'playlists',
    attributes: {
      name: `Playlist ${id}`,
      accessType,
      numberOfTrackItems: 12,
      lastModifiedAt: `2026-09-${String(day).padStart(2, '0')}T12:00:00Z`,
    },
    relationships: { coverArt: { data: [{ id: 'cover', type: 'artworks' }] } },
  };
}

test('requests newest-first owner playlists and returns only the latest six public cards', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async (input: URL, options: RequestInit) => {
    assert.equal(input.origin, 'https://openapi.tidal.com');
    assert.equal(input.searchParams.get('filter[owners.id]'), 'me');
    assert.equal(input.searchParams.get('sort'), '-lastModifiedAt');
    assert.equal(input.searchParams.get('include'), 'coverArt');
    assert.equal(input.searchParams.get('countryCode'), 'FR');
    assert.equal(new Headers(options.headers).get('Authorization'), 'Bearer test-token');
    return Response.json({
      data: [playlist('private', 30, 'PRIVATE'), playlist('unlisted', 29, 'UNLISTED'),
        ...Array.from({ length: 8 }, (_, i) => playlist(`public-${i}`, i + 1))],
      included: [{
        id: 'cover', type: 'artworks', attributes: {
          mediaType: 'IMAGE',
          files: [
            { href: 'wide.jpg', meta: { width: 640, height: 360 } },
            { href: 'large.jpg', meta: { width: 1280, height: 1280 } },
            { href: 'square.jpg', meta: { width: 640, height: 640 } },
          ],
        },
      }],
      links: { next: '?page[cursor]=unused' },
    });
  });

  const result = await fetchLatestTidalPlaylists('test-token', 'FR');
  assert.deepEqual(result.map(item => item.id), ['public-7', 'public-6', 'public-5', 'public-4', 'public-3', 'public-2']);
  assert.equal(result[0]?.coverUrl, 'square.jpg');
  assert.equal(result[0]?.trackCount, 12);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('paginates past private entries, deduplicates IDs, and stops at six public playlists', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async (input: URL) => {
    if (!input.searchParams.has('page[cursor]')) {
      return Response.json({
        data: [playlist('private', 30, 'PRIVATE'), playlist('a', 20), playlist('b', 19)],
        links: { next: { href: '/playlists?page%5Bcursor%5D=next-page' } },
      });
    }
    assert.equal(input.searchParams.get('page[cursor]'), 'next-page');
    return Response.json({
      data: [playlist('b', 19), playlist('c', 18), playlist('d', 17), playlist('e', 16), playlist('f', 15)],
      links: { next: '?page[cursor]=not-needed' },
    });
  });

  const result = await fetchLatestTidalPlaylists('test-token', 'US');
  assert.deepEqual(result.map(item => item.id), ['a', 'b', 'c', 'd', 'e', 'f']);
  assert.equal(result[0]?.coverUrl, null);
  assert.equal(fetchMock.mock.callCount(), 2);
});

test('never sends owner credentials to a pagination link on another host', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async (input: URL) => {
    assert.equal(input.origin, 'https://openapi.tidal.com');
    if (!input.searchParams.has('page[cursor]')) {
      return Response.json({ data: [], links: { next: 'https://other.example/?page[cursor]=page-2' } });
    }
    return Response.json({ data: [playlist('a', 20)] });
  });
  assert.equal((await fetchLatestTidalPlaylists('test-token', 'US')).length, 1);
  assert.equal(fetchMock.mock.callCount(), 2);
});

test('supports a genuinely empty public collection', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ data: [] }));
  assert.deepEqual(await fetchLatestTidalPlaylists('test-token', 'US'), []);
});

test('fails on repeated cursors instead of making unbounded API requests', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({
    data: [], links: { next: '?page[cursor]=repeat' },
  }));
  await assert.rejects(fetchLatestTidalPlaylists('test-token', 'US'), /repeated pagination cursor/);
  assert.equal(fetchMock.mock.callCount(), 2);
});

test('does not turn an upstream authorization failure into a cacheable empty collection', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ errors: [] }, { status: 401 }));
  await assert.rejects(fetchLatestTidalPlaylists('test-token', 'US'), /request failed \(401\)/);
});
