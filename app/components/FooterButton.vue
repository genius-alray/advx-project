<script setup lang="ts">
const route = useRoute();
const { icon, target } = defineProps<{ icon: string; target: string }>();
const { navigateToTab } = useTabNavigation();

const handleClick = async (event: Event) => {
  event.preventDefault();
  await navigateToTab(target);
};
</script>

<template>
  <a
    :href="target"
    class="h-20 flex flex-1 flex-col justify-center items-center cursor-pointer"
    @click="handleClick"
  >
    <Icon
      :name="route.path == target ? icon : icon.replace('-color', '')"
      class="text-2xl text-primary"
    />
  </a>
</template>
