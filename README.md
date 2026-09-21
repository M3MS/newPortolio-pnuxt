# Prismic + Nuxt Portfolio

## 🚀 Quick Start

When you're ready to start your project, run the following command:

```sh
npm run dev
```

## How to use your project

To edit the content of this project, go to [prismic.io/dashboard](https://prismic.io/dashboard), click on the repository for this website, and start editing.

### Create a page

To create a page, click on the green pencil icon, then select **Page**.

Pages are made of Slices. You can add and rearrange Slices to your pages.

Your new page will be accessible by its URL, but it won't appear on the website automatically. To let users discover it, add it to the navigation.

### Preview documents

If you launched this starter when you created a new repository in the Prismic Dashboard, then your repository is preconfigured with previews in development on localhost:3000.

To add a production preview, option your repository and go to _Settings > Previews_. Under _Create a New Preview_, fill in the three fields:

- a name (like **Production**)
- the domain where your app is running (like <https://www.yoursite.com>)
- `/api/preview` for the Preview Route

Now, go to a draft document and click the eye icon in the top-right corner.

To learn more about how to configure previews, read [Preview Drafts in Nuxt](https://prismic.io/docs/technologies/nuxt-preview-drafts) in the Prismic documentation.

### Customize this website

This website is preconfigured with Prismic. Functionality is provided by the `@nuxtjs/prismic` package, which makes Prismic utilities available throughout the app. Take a look at the code to see how it's used.

### Edit the code

There are two steps to rendering content from Prismic in your Nuxt project:

1. Fetch content from the Prismic API
2. Template the content

Here are some of the files in your project that you can edit:

- `nuxt.config.js` - The `prismic` property includes configurations for `@nuxtjs/prismic`.
- `pages/index.vue` - This is the app homepage. It queries and renders a page document with the UID (unique identifier) "home" from the Prismic API.
- `pages/[uid].vue` - This is the page component, which queries and renders a page document from your Prismic repository based on the UID.
- `slices/RichText/index.vue` - Each Slice has an `index.vue` file that renders the Slice component. Edit this file to customize your Slices.

These are important files that you should leave as-is:

- `pages/slice-simulator.vue` - Do not edit or delete this file. This file simulates your Slice components in development.
- `slices/` - This directory contains Slice components, which are generated programmatically by Slice Machine. To customize a Slice template, you can edit the Slice's `index.vue` file. To add Slices, delete Slices, or edit Slice models, use Slice Machine (more info below).

Learn more about how to edit your components with [Fetch Data in Nuxt](https://prismic.io/docs/technologies/nuxt-fetch-data) and [Template Content in Nuxt](https://prismic.io/docs/technologies/nuxt-template-content).

### Deploy to the web

To put your project online, see [Deploy your Nuxt App](https://prismic.io/docs/technologies/nuxt-deploy).

### Edit content models with Slice Machine

This project includes an application called Slice Machine, which generates models for your Custom Types and Slices. Slice Machine stores the models locally in your codebase, so you can save and version them. It also syncs your models to Prismic. To learn how to use Slice Machine, read [Model Content in Nuxt](https://prismic.io/docs/technologies/nuxt-model-content).

If you change or add to your Custom Types, you'll need to update your route handling to match. To learn how to do that, read [Define Paths in Nuxt](https://prismic.io/docs/technologies/nuxt-define-routes).

## TIDAL playlist cards

The Playlists slice displays your six most recently updated **public** playlists, ordered by TIDAL's `lastModifiedAt`. Each card opens TIDAL's official in-page preview player. Only the selected player is loaded, and switching or closing it stops the previous player.

### One-time account connection

Listing your own playlists requires an owner-authorized token. Visitors do not need to log in.

1. Create `.env` from `.env.example` and set your TIDAL app's `NUXT_TIDAL_CLIENT_ID`. If `.env` already exists, keep its existing values.
2. In the [TIDAL developer dashboard](https://developer.tidal.com/dashboard), register `http://localhost:8787/callback` as an allowed redirect URI and enable the `playlists.read` scope.
3. Run `npm run tidal:connect`, open the URL printed in the terminal, and authorize your playlist-owner account. The command uses PKCE and saves `NUXT_TIDAL_REFRESH_TOKEN` to your ignored `.env` file without printing it.
4. Restart Nuxt. Optionally set `NUXT_TIDAL_COUNTRY_CODE` to your two-letter catalog country (default `US`).

Your artist ID (`58711951`) is different from a user ID. The endpoint uses `filter[owners.id]=me` with your owner token so it retrieves the correct account's playlists. Private and unlisted playlists are excluded before selecting six. TIDAL controls API page size; only the newest-first pages needed to obtain six public playlists are requested.

### Cache and deployment

- `/api/tidal/playlists` caches the six cards for **604,800 seconds (seven days)**. Refresh happens on the first request after expiry, with the previous result served while it refreshes. Failed refreshes preserve the last successful result.
- The `tidal` Nitro storage mount persists metadata and rotated refresh tokens under `.cache/tidal`. Keep this directory on persistent disk across restarts and deployments. Do not serve or commit it.
- On serverless or multi-instance hosting, replace this mount in `nuxt.config.ts` with a persistent shared Nitro storage driver (such as Redis) so all instances share the weekly cache and current refresh token.
- Set `NUXT_TIDAL_CLIENT_ID`, `NUXT_TIDAL_REFRESH_TOKEN`, and optionally `NUXT_TIDAL_COUNTRY_CODE` in your hosting environment. Production Nuxt does not automatically read `.env`.
- Deploy with a Nuxt server (`npm run build`); a purely static `npm run generate` deployment cannot refresh this API weekly.
- The weekly cache applies to playlist metadata. TIDAL's player still requests playback data when a visitor presses Play. Catalog tracks have 30-second previews; your Upload tracks may support full playback through TIDAL.

Run `npm run test:tidal` (Node 22.6+) to check ordering, pagination, public-only filtering, and upstream error handling.

## Documentation

For the official Prismic documentation, see [Prismic's guide for Nuxt](prismic-docs) or the [technical references for the installed Prismic packages](https://prismic.io/docs/technologies/technical-references).

## License

```
Copyright 2013-2023 Prismic <contact@prismic.io> (https://prismic.io)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

[prismic]: https://prismic.io
[prismic-docs]: https://prismic.io/docs/nuxt-3-setup
[prismic-sign-up]: https://prismic.io/dashboard/signup
[nuxt]: https://nuxt.com
[live-demo]: https://nuxt-starter-prismic-minimal.vercel.app
