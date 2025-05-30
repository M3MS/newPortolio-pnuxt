import { repositoryName, apiEndpoint } from './slicemachine.config.json';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  devtools: { 
    enabled: true,
    componentInspector: false
  },

  css: ['~/assets/scss/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/variables.scss" as *;',
        }
      }
    }
  },

  gsap: {
    composables: true,
    clubPlugins: {
      splitText: true,
      scrollTrigger: true
    }
  },

  app: {
    head: {
      title: 'Portfolio - Mehdy',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    }
  },

  modules: ['@nuxt/eslint', '@nuxtjs/prismic', 'lenis/nuxt'],

  prismic: {
    endpoint: apiEndpoint || repositoryName,
    preview: '/api/preview',
    clientConfig: {
      routes: [
        {
          type: 'page',
          path: '/:uid',
        },
        {
          type: 'page',
          uid: 'home',
          path: '/',
        },
        {
          type: 'project',
          path: '/projects/:uid',
        },
      ]
    }
  },

  compatibilityDate: '2025-01-06',
})