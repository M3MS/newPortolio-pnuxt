export interface TidalPlaylist {
  id: string;
  name: string;
  description: string;
  trackCount: number | null;
  updatedAt: string;
  coverUrl: string | null;
}

interface PlaylistResource {
  id: string;
  attributes: {
    name: string;
    description?: string;
    accessType: string;
    numberOfTrackItems?: number;
    lastModifiedAt: string;
  };
  relationships?: {
    coverArt?: { data?: { id: string; type: string }[] };
  };
}

interface ArtworkResource {
  id: string;
  type: string;
  attributes: {
    mediaType: string;
    files: { href: string; meta: { width: number; height: number } }[];
  };
}

interface PlaylistPage {
  data: PlaylistResource[];
  included?: ArtworkResource[];
  links?: { next?: string | { href: string } | null };
}

// Fetch only as many newest-first pages as needed to find six public playlists.
export async function fetchLatestTidalPlaylists(accessToken: string, countryCode: string): Promise<TidalPlaylist[]> {
  const playlists = new Map<string, TidalPlaylist>();
  const cursors = new Set<string>();
  let cursor: string | null = null;

  do {
    const url = new URL('https://openapi.tidal.com/v2/playlists');
    url.search = new URLSearchParams({
      'filter[owners.id]': 'me',
      sort: '-lastModifiedAt',
      include: 'coverArt',
      countryCode,
    }).toString();
    if (cursor) url.searchParams.set('page[cursor]', cursor);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.api+json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`TIDAL playlist request failed (${response.status}).`);
    const page = await response.json() as PlaylistPage;

    for (const playlist of page.data) {
      // The owner token can see private/unlisted playlists; never publish those.
      if (playlist.attributes.accessType !== 'PUBLIC') continue;
      const coverIds = playlist.relationships?.coverArt?.data ?? [];
      const artwork = page.included?.find(resource =>
        resource.type === 'artworks'
        && resource.attributes.mediaType === 'IMAGE'
        && coverIds.some(cover => cover.id === resource.id),
      );
      const files = artwork?.attributes.files.filter(file => file.meta.width === file.meta.height) ?? [];
      files.sort((a, b) => Math.abs(a.meta.width - 640) - Math.abs(b.meta.width - 640));
      playlists.set(playlist.id, {
        id: playlist.id,
        name: playlist.attributes.name,
        description: playlist.attributes.description ?? '',
        trackCount: playlist.attributes.numberOfTrackItems ?? null,
        updatedAt: playlist.attributes.lastModifiedAt,
        coverUrl: files[0]?.href ?? null,
      });
    }

    if (playlists.size >= 6) break;
    const next = typeof page.links?.next === 'string' ? page.links.next : page.links?.next?.href;
    // Extract the cursor, rather than forwarding the bearer token to a supplied URL.
    cursor = next ? new URL(next, url).searchParams.get('page[cursor]') : null;
    if (cursor && cursors.has(cursor)) throw new Error('TIDAL returned a repeated pagination cursor.');
    if (cursor) cursors.add(cursor);
  } while (cursor);

  return [...playlists.values()]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 6);
}
