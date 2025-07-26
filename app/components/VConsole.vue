<script setup lang="ts">
const enabled = ref(false);
onMounted(() => {
  if (location.search.includes("debug")) {
    enabled.value = true;
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
  <div />
</template>
