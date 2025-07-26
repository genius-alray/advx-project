<script setup lang="ts">
const emits = defineEmits(["close", "created"]);

// 简单的响应式状态
const form = reactive({
  name: "",
  description: "",
  avatar: "",
  background: "",
  voiceId: null as string | null,
});

const formError = ref<string | null>(null);
const avatarFile = ref<File | null>(null);
const userVoices = ref<{ id: string; name: string }[]>([]);
const isLoadingVoices = ref(false);
const isUploadingAvatar = ref(false);
const isCreating = ref(false);

// 直接加载用户语音列表
const loadUserVoices = async () => {
  isLoadingVoices.value = true;
  try {
    userVoices.value = await $fetch<{ id: string; name: string }[]>(
      "/api/voice/all"
    );
  } catch (err) {
    console.error("Failed to load user voices:", err);
  } finally {
    isLoadingVoices.value = false;
  }
};

// 处理头像文件上传
const handleAvatarUpload = async (file: unknown) => {
  const selectedFile = file as File | null;
  if (!selectedFile) {
    avatarFile.value = null;
    form.avatar = "";
    return;
  }

  // 检查文件类型
  if (!selectedFile.type.startsWith("image/")) {
    formError.value = "请选择图片文件";
    return;
  }

  // 检查文件大小 (5MB)
  if (selectedFile.size > 5 * 1024 * 1024) {
    formError.value = "图片文件大小不能超过5MB";
    return;
  }

  isUploadingAvatar.value = true;
  formError.value = null;

  try {
    // 直接在客户端转换为 base64 URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      form.avatar = dataUrl;
      avatarFile.value = selectedFile;
      isUploadingAvatar.value = false;
    };
    reader.onerror = () => {
      formError.value = "头像处理失败，请重试";
      isUploadingAvatar.value = false;
    };
    reader.readAsDataURL(selectedFile);
  } catch (err) {
    console.error("Failed to process avatar:", err);
    formError.value = "头像处理失败，请重试";
    isUploadingAvatar.value = false;
  }
};

// 计算语音选项
const voiceOptions = computed(() => {
  return [
    { value: null, label: "不使用语音" },
    ...userVoices.value.map((voice) => ({
      value: voice.id,
      label: voice.name,
    })),
  ];
});

// 组件初始化 - 加载语音列表
onMounted(async () => {
  await loadUserVoices();
});

// 直接提交创建角色
const handleSubmit = async () => {
  if (isCreating.value) return;

  formError.value = null;

  if (!form.name.trim()) {
    formError.value = "请输入角色名称";
    return;
  }

  isCreating.value = true;
  try {
    const result = await $fetch<{ id: string }>("/api/role/create", {
      method: "POST",
      body: {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        avatar: form.avatar.trim() || undefined,
        background: form.background.trim() || undefined,
        voiceId: form.voiceId || undefined,
      },
    });

    if (result) {
      // Reset form first
      Object.assign(form, {
        name: "",
        description: "",
        avatar: "",
        background: "",
        voiceId: null,
      });
      avatarFile.value = null;

      // Emit events to parent
      emits("created", result);
      emits("close");
    }
  } catch (err) {
    console.error("Failed to create role:", err);
    formError.value = "创建角色失败，请重试";
  } finally {
    isCreating.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col justify-center items-center py-8 px-4 space-y-2">
    <!-- 头像上传按钮 -->
    <div
      class="mb-8 text-primary/50 space-y-2 font-bold flex items-center flex-col">
      <UFileUpload
        v-model="avatarFile"
        variant="button"
        accept="image/*"
        icon="material-symbols:account-circle"
        size="xl"
        class="text-primary size-10"
        @update:model-value="handleAvatarUpload" />
      <span>设置头像</span>
    </div>

    <form class="w-full space-y-4" @submit.prevent="handleSubmit">
      <UInput
        v-model="form.name"
        placeholder="名称"
        class="w-full"
        size="xl"
        required
        :disabled="isCreating" />

      <UInput
        v-model="form.description"
        placeholder="身份/描述"
        class="w-full"
        size="xl"
        :disabled="isCreating" />

      <UTextarea
        v-model="form.background"
        placeholder="背景故事"
        auto-resize
        :rows="3"
        class="w-full"
        size="xl"
        :disabled="isCreating" />

      <!-- 语音选择 -->
      <div class="space-y-2">
        <USelect
          :key="userVoices.length"
          v-model="form.voiceId"
          :items="voiceOptions"
          placeholder="选择语音 (可选)"
          class="w-full text-primary"
          size="xl"
          color="primary"
          :disabled="isCreating || isLoadingVoices"
          :loading="isLoadingVoices" />
      </div>

      <UAlert
        v-if="formError"
        color="error"
        variant="soft"
        :title="formError"
        class="mb-4" />

      <div class="w-full flex mt-4 justify-center">
        <UButton
          type="submit"
          size="xl"
          :loading="isCreating"
          :disabled="!form.name.trim() || isCreating">
          完成
        </UButton>
      </div>
    </form>
  </div>
</template>
