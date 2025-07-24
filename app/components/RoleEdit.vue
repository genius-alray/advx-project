<template>
  <div class="flex flex-col justify-center items-center p-8 space-y-2">
    <Icon
      name="material-symbols:account-circle"
      class="text-8xl text-primary mb-8" />
    <!-- <UButton variant="soft" class="shadow-none">设置头像</UButton> -->
    <UInput placeholder="名称" class="w-full" size="xl" />
    <UInput placeholder="身份" class="w-full" size="xl" />
    <UTextarea
      placeholder="简介"
      autoresize
      :rows="3"
      class="w-full"
      size="xl" />
    <div class="w-full flex mt-8">
      <UButton icon="material-symbols:cancel" size="xl" variant="outline"
        >取消</UButton
      >
      <span class="flex-1" />
      <UButton icon="material-symbols:check-circle" size="xl">确认</UButton>
    </div>
  </div>
</template>
