<script setup lang="ts">
onMounted(() => {
  if (location.search.includes("debug")) {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/vconsole@latest/dist/vconsole.min.js";
    document.head.appendChild(script);
    script.addEventListener("load", () => {
      const script2 = document.createElement("script");
      script2.innerHTML = "new VConsole({ theme: 'dark' });";
      document.head.appendChild(script2);
    });
  }
});
</script>
<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
