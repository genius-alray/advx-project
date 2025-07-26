<script setup lang="ts">
const v = ref("");
const toast = useToast();
async function submit() {
  toast.add({
    title: v.value,
  });
}
</script>

<template>
  <form @submit.prevent="submit">
    <UInput v-model="v" />
  </form>
</template>
