<script setup lang="ts">
import type { Content } from "@prismicio/client";

defineProps(getSliceComponentProps<Content.PlaylistsSlice>());

const { data, status, error, refresh } = await useFetch("/api/tidal/playlists");
const playlists = computed(() => data.value?.playlists ?? []);
const selectedId = ref<string | null>(null);
const selectedPlaylist = computed(() => playlists.value.find(playlist => playlist.id === selectedId.value));
const player = ref<HTMLIFrameElement | null>(null);
const playerPanel = ref<HTMLElement | null>(null);
const playerLoading = ref(false);
const playerId = `tidal-player-${useId()}`;
const embedOrigin = "https://embed.tidal.com";
const embedUrl = computed(() => selectedId.value
  ? `${embedOrigin}/playlists/${encodeURIComponent(selectedId.value)}`
  : undefined);

async function selectPlaylist(id: string) {
  if (selectedId.value === id) {
    selectedId.value = null;
    return;
  }
  playerLoading.value = true;
  selectedId.value = id;
  await nextTick();
  playerPanel.value?.scrollIntoView({
    block: "nearest",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

function startPreview() {
  playerLoading.value = false;
  // TIDAL's official embed accepts this play command after its scripts load.
  player.value?.contentWindow?.postMessage({ commandName: "play" }, embedOrigin);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}
</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="playlists"
  >
    <div class="playlists__inner">
      <PrismicText
        :field="slice.primary.section_title"
        wrapper="h2"
        class="title-md is-bold text-split"
      />
      <p class="playlists__intro">My latest selections on TIDAL. Listen to 30-second previews right here.</p>

      <p v-if="status === 'pending'" class="playlists__message" role="status">Loading playlists…</p>
      <div v-else-if="error" class="playlists__message" role="alert">
        <p>Playlists are temporarily unavailable.</p>
        <button type="button" class="playlists__button" @click="refresh()">Try again</button>
      </div>
      <p v-else-if="!playlists.length" class="playlists__message">No public playlists yet.</p>

      <div v-else class="playlists__grid">
        <article v-for="playlist in playlists" :key="playlist.id" class="playlist-card">
          <div class="playlist-card__cover">
            <img
              v-if="playlist.coverUrl"
              :src="playlist.coverUrl"
              alt=""
              width="640"
              height="640"
              loading="lazy"
            >
            <span v-else class="playlist-card__placeholder" aria-hidden="true">♫</span>
          </div>
          <div class="playlist-card__body">
            <h3 class="is-bold">{{ playlist.name }}</h3>
            <p v-if="playlist.description" class="playlist-card__description">{{ playlist.description }}</p>
            <p class="playlist-card__meta">
              <span v-if="playlist.trackCount !== null">{{ playlist.trackCount }} tracks · </span>
              Updated <time :datetime="playlist.updatedAt">{{ formatDate(playlist.updatedAt) }}</time>
            </p>
            <button
              type="button"
              class="playlists__button"
              :aria-label="`${selectedId === playlist.id ? 'Stop' : 'Play'} previews of ${playlist.name}`"
              :aria-expanded="selectedId === playlist.id"
              :aria-controls="selectedId === playlist.id ? playerId : undefined"
              @click="selectPlaylist(playlist.id)"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path v-if="selectedId === playlist.id" d="M6 6h12v12H6z" />
                <path v-else d="m8 5 11 7-11 7z" />
              </svg>
              {{ selectedId === playlist.id ? 'Stop previews' : 'Play previews' }}
            </button>
          </div>
        </article>
      </div>

      <div v-if="selectedPlaylist" :id="playerId" ref="playerPanel" class="playlists__player">
        <div class="playlists__player-heading">
          <h3 class="is-bold">{{ selectedPlaylist.name }}</h3>
          <button type="button" class="playlists__button" @click="selectedId = null">Close player</button>
        </div>
        <p v-if="playerLoading" role="status">Loading TIDAL player…</p>
        <iframe
          :key="selectedPlaylist.id"
          ref="player"
          :src="embedUrl"
          :title="`TIDAL preview player: ${selectedPlaylist.name}`"
          allow="autoplay; encrypted-media; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          width="100%"
          height="420"
          @load="startPreview"
        />
        <p class="playlists__player-note">If playback doesn't start automatically, press Play in the TIDAL player.</p>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.playlists {
  padding: 10vh 2rem;
  color: $black;
  background: $white;

  &__inner {
    max-width: 144rem;
    margin: 0 auto;
  }

  &__intro {
    margin-top: 2rem;
    font-size: 1.8rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 3rem;
    margin-top: 5rem;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  &__message {
    padding: 5rem 0;

    button { margin-top: 2rem; }
  }

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    min-height: 4.4rem;
    padding: 1rem 1.6rem;
    border: 1px solid $black;
    background: $white;
    color: $black;
    font-weight: bold;
    cursor: pointer;

    &:hover, &[aria-expanded="true"] { background: $green; }
    &:focus-visible { outline: 3px solid $black; outline-offset: 4px; }
  }

  &__player {
    margin-top: 4rem;
    scroll-margin-block: 2rem;

    iframe {
      display: block;
      margin-top: 2rem;
      border: 0;
      background: $dark;
    }
  }

  &__player-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1.6rem;

    h3 { font-size: 2.4rem; }
  }

  &__player-note { margin-top: 1rem; font-size: 1.4rem; }
}

.playlist-card {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba($black, 0.2);

  &__cover {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    background: $dark-blue;
    color: $green;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  &__placeholder { font-size: 8rem; }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.6rem;
    padding: 2rem;
    overflow-wrap: anywhere;

    h3 { font-size: 2.4rem; }
    button { margin-top: auto; }
  }

  &__description {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
  }

  &__meta { font-size: 1.4rem; line-height: 1.5; }
}
</style>
