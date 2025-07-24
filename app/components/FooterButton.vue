<script setup lang="ts">
const route = useRoute();
const { icon, target } = defineProps<{ icon: string; target: string }>();
</script>

<template>
  <NuxtLink
    :href="target"
    class="h-20 flex flex-1 flex-col justify-center items-center">
    <Icon
      :name="route.path == target ? icon : icon.replace('-color', '')"
      class="text-2xl text-primary" />
  </NuxtLink>
</template>
