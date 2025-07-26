<template>
  <UContainer
    class="max-w-md bg-primary-50/50 p-0 pt-8 h-screen w-screen flex flex-col max-h-screen">
    <slot />
    <footer
      class="h-20 bg-white rounded-tl-2xl rounded-tr-2xl flex justify-between shadow-xl shadow-slate-400">
      <FooterButton icon="streamline-plump-color:polaroid" target="/" />

      <FooterButton
        icon="streamline-plump-color:fill-and-sign"
        target="/voice" />
      <FooterButton
        icon="streamline-plump-color:chat-bubble-oval-smiley-1"
        target="/threads" />
      <FooterButton
        icon="streamline-plump-color:user-single-neutral-male"
        target="/setting" />
    </footer>
    <div
      class="h-96 w-full blur-xl bg-primary/20 fixed left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 -z-10 rounded-full" />
  </UContainer>
</template>
