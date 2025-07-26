<script setup lang="ts">
const router = useRouter();
</script>

<template>
  <Icon
    name="material-symbols:arrow-back-ios-rounded"
    class="text-2xl text-primary"
    @click="router.back()" />
</template>
