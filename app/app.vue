<script setup lang="ts"></script>
<template>
  <UApp>
    <ClientOnly>
      <VConsole />
    </ClientOnly>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
