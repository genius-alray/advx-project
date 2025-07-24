<script setup lang="ts">
definePageMeta({ layout: false });
</script>
<template>
  <UContainer
    class="max-w-md bg-primary-50 p-0 h-screen w-screen flex justify-center overflow-hidden">
    <div class="flex flex-col justify-center w-3xs space-y-4">
      <NuxtImg src="/loginHero.svg" class="mb-8" />
      <span class="font-bold text-center">18854188666</span>
      <UButton block size="xl" class="p-4 text-xl">快速登录</UButton>
    </div>
  </UContainer>
</template>
