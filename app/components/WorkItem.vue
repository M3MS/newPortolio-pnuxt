<template>
    <div>
        <div class="work-items__item">
            <a href="{{ link }}" target="_blank">
                {{ name }}
            </a>
            <span class="line"></span>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            id: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true,
            },
            link: {
                type: String,
                required: true,
            },
        },
    }
</script>