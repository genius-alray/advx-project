<script setup lang="ts">
const route = useRoute();
const name = computed(() => ({ "/": "记忆回廊" }[route.path]));
</script>

<template>
  <UContainer
    class="max-w-md bg-primary-50/50 p-0 pt-8 h-screen w-screen flex flex-col max-h-screen">
    <header class="flex px-4 sticky">
      <span class="text-3xl font-bold">{{ name }}</span>
      <span class="flex-1" />
      <UDrawer v-if="route.name == 'index'">
        <Icon
          name="material-symbols:add-circle-outline"
          class="text-4xl text-primary" />
        <template #content> <RoleEdit /> </template>
      </UDrawer>
    </header>
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
    <footer
      class="h-20 bg-white rounded-tl-2xl rounded-tr-2xl flex justify-between shadow-xl shadow-slate-400">
      <FooterButton icon="streamline-plump-color:polaroid" target="/" />

      <FooterButton
        icon="streamline-plump-color:fill-and-sign"
        target="/memory" />
      <FooterButton
        icon="streamline-plump-color:chat-bubble-oval-smiley-1"
        target="/b" />
      <FooterButton
        icon="streamline-plump-color:user-single-neutral-male"
        target="/c" />
    </footer>
    <div
      class="h-96 w-full blur-xl bg-primary/20 fixed left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 -z-10 rounded-full" />
  </UContainer>
</template>
