<script setup lang="ts">
const { id: roleId } = defineProps<{ id: string }>();
const emits = defineEmits(["finish"]);

const toast = useToast();

const memoryName = ref("");
const memoryContent = ref("");

const submitMemory = async () => {
  try {
    await $fetch(`/api/role/${roleId}/knowledge`, {
      method: "POST",
      body: {
        name: memoryName.value,
        content: memoryContent.value,
        type: "text",
      },
    });

    emits("finish");
  } catch (error) {
    toast.add({
      title: "添加记忆失败，请重试",
      color: "error",
    });
  }
};
function uploadFile() {
  toast.add({ title: "未知错误", color: "error" });
}
function startRecording() {
  toast.add({ title: "未知错误", color: "error" });
}
</script>

<template>
  <div class="flex flex-col items-center p-6 space-y-8">
    <!-- 标题区域 -->
    <div class="flex space-x-2 self-start">
      <h2 class="text-xl font-medium text-primary">新增记忆</h2>
      <NuxtImg
        src="/photo.svg"
        class="w-6 h-6 rounded-full scale-150 translate-y-2" />
    </div>

    <!-- 输入区域 -->
    <div class="w-full space-y-4 flex-col items-center flex">
      <UInput
        v-model="memoryName"
        placeholder="设置记忆名称"
        size="xl"
        class="w-full" />
      <UTextarea
        v-model="memoryContent"
        placeholder="写下记忆"
        type="textarea"
        size="xl"
        autoresize
        class="w-full" />
    </div>

    <!-- 功能按钮 -->
    <div class="flex justify-between w-full">
      <UButton
        variant="soft"
        size="xl"
        class="size-16 rounded-full text-4xl flex justify-center items-center"
        icon="streamline-plump-color:file-folder"
        @click="uploadFile" />
      <UButton
        variant="soft"
        size="xl"
        class="size-16 rounded-full text-4xl flex justify-center items-center"
        icon="streamline-plump-color:voice-mail"
        @click="startRecording" />
    </div>

    <!-- 完成按钮 -->
    <UButton
      size="xl"
      :disabled="!memoryName.trim() || !memoryContent.trim()"
      @click="submitMemory">
      完成
    </UButton>
  </div>
</template>

<script setup lang="ts"></script>
