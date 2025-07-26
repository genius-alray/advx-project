<script setup lang="ts">
const emits = defineEmits(["close", "created"]);

const props = defineProps<{
  roleId: string;
}>();

const newMemory = ref("");
const isAdding = ref(false);
const isUploading = ref(false);
const uploadError = ref<string | null>(null);
const error = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const handleAddMemory = async () => {
  if (!newMemory.value.trim() || isAdding.value) return;

  const memoryText = newMemory.value.trim();
  newMemory.value = "";
  isAdding.value = true;

  try {
    await $fetch(`/api/role/${props.roleId}/knowledge`, {
      method: "POST",
      body: {
        content: memoryText,
        type: "text",
      },
    });

    emits("created");
    emits("close");
  } catch (err) {
    console.error("Failed to add memory:", err);
    alert(
      `添加记忆时发生错误: ${err instanceof Error ? err.message : "未知错误"}`
    );
    newMemory.value = memoryText;
  } finally {
    isAdding.value = false;
  }
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.name.match(/\.(txt|md|json)$/i)) {
    uploadError.value = "只支持 .txt, .md, .json 格式的文件";
    return;
  }

  isUploading.value = true;
  uploadError.value = null;

  try {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      throw new Error("文件内容为空");
    }

    await $fetch(`/api/role/${props.roleId}/knowledge/batch`, {
      method: "POST",
      body: {
        contents: lines,
        type: "file",
      },
    });

    uploadError.value = null;
    emits("created");
    emits("close");
  } catch (err) {
    console.error("Failed to upload file:", err);
    uploadError.value =
      err instanceof Error ? err.message : "文件上传失败，请重试";
  } finally {
    isUploading.value = false;
    if (target) {
      target.value = "";
    }
  }
};

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};
</script>

<template>
  <div class="p-4 bg-white">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">新建记忆</h3>
      <UButton
        icon="material-symbols:close"
        variant="ghost"
        size="sm"
        @click="emits('close')" />
    </div>

    <form class="space-y-4" @submit.prevent="handleAddMemory">
      <UTextarea
        v-model="newMemory"
        placeholder="输入一段关于这个角色的记忆、故事或对话..."
        :rows="4"
        class="w-full resize-none"
        :disabled="isAdding" />

      <div class="flex flex-wrap gap-2">
        <UButton
          type="submit"
          icon="material-symbols:add"
          :loading="isAdding"
          :disabled="!newMemory.trim()"
          class="flex-shrink-0">
          添加记忆
        </UButton>

        <UButton
          type="button"
          icon="material-symbols:upload-file"
          variant="outline"
          :loading="isUploading"
          :disabled="isAdding || isUploading"
          class="flex-shrink-0"
          @click="triggerFileUpload">
          {{ isUploading ? "上传中..." : "上传文件" }}
        </UButton>

        <input
          ref="fileInputRef"
          type="file"
          accept=".txt,.md,.json"
          class="hidden"
          @change="handleFileUpload" />
      </div>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :title="error"
        class="mb-4" />

      <UAlert
        v-if="uploadError"
        color="error"
        variant="soft"
        :title="uploadError"
        class="mb-4"
        @close="uploadError = null" />
    </form>
  </div>
</template>
