<template>
  <UContainer
    class="max-w-md bg-primary-50 p-0 pt-8 h-screen w-screen flex flex-col">
    <header class="flex px-4">
      <span class="text-3xl font-bold">记忆回廊</span>
      <span class="flex-1" />
      <Icon
        name="material-symbols:add-circle-outline"
        class="text-4xl text-primary" />
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <footer
      class="h-20 bg-white rounded-tl-2xl rounded-tr-2xl flex justify-between shadow-xl shadow-slate-400">
      <FooterButton icon="streamline-plump-color:polaroid" target="/" />

      <FooterButton icon="streamline-plump-color:fill-and-sign" target="/a" />
      <FooterButton
        icon="streamline-plump-color:chat-bubble-oval-smiley-1"
        target="/b" />
      <FooterButton
        icon="streamline-plump-color:user-single-neutral-male"
        target="/c" />
    </footer>
  </UContainer>
</template>
