<script lang="ts" setup>
const prismic = usePrismic()

const { data: settings } = await useAsyncData( () => prismic.client.getSingle('settings'))

useSeoMeta({
    title: settings.value?.data.site_title,
    ogTitle: settings.value?.data.site_title,
    description: settings.value?.data.meta_description,
    ogDescription: settings.value?.data.meta_description,
    ogImage: computed(() => prismic.asImageSrc(settings.value?.data.meta_image)),
})
</script>

<template>
    <div>
        <Cursor />
        <AppHeader :settings="settings" />
        <slot />
        <AppFooter :settings="settings" />
        <Overlay />
    </div>
</template>
