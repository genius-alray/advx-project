<script setup lang="ts">
const emits = defineEmits(["close", "created"]);

// Props interface for future extensibility
// interface Props {
//   editingRole?: unknown;
// }

const { createRole, pending, error } = useRoles();
const { fetchUserVoiceList } = useVoices();
const { uploadAvatar } = useAvatars();
const { isAuthenticated } = useAuth();

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

// 加载用户语音列表
const loadUserVoices = async () => {
  isLoadingVoices.value = true;
  try {
    userVoices.value = await fetchUserVoiceList();
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
    // 上传头像
    const result = await uploadAvatar(selectedFile);
    if (result) {
      form.avatar = result.url;
      avatarFile.value = selectedFile;
    }
  } catch (err) {
    console.error("Failed to upload avatar:", err);
    formError.value = "头像上传失败，请重试";
  } finally {
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

// 监听认证状态变化，登录后加载语音列表
watch(
  isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      loadUserVoices();
    }
  },
  { immediate: true }
);

// 组件挂载时加载语音列表和设置页面可见性监听
onMounted(() => {
  if (isAuthenticated.value) {
    loadUserVoices();
  }

  // 监听页面可见性变化，当页面重新可见时刷新语音列表
  const handleVisibilityChange = () => {
    if (!document.hidden && isAuthenticated.value) {
      loadUserVoices();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // 清理事件监听器
  onUnmounted(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });
});

const handleSubmit = async () => {
  formError.value = null;

  if (!form.name.trim()) {
    formError.value = "请输入角色名称";
    return;
  }

  const result = await createRole({
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    avatar: form.avatar.trim() || undefined,
    background: form.background.trim() || undefined,
    voiceId: form.voiceId || undefined,
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
};
</script>

<template>
  <div class="flex flex-col justify-center items-center p-8 space-y-2">
    <!-- 头像上传按钮 -->
    <div class="mb-8">
      <UFileUpload
        v-model="avatarFile"
        variant="button"
        accept="image/*"
        icon="material-symbols:account-circle"
        size="xl"
        class="text-primary"
        @update:model-value="handleAvatarUpload"
      />
    </div>

    <form class="w-full space-y-4" @submit.prevent="handleSubmit">
      <UInput
        v-model="form.name"
        placeholder="名称"
        class="w-full"
        size="xl"
        required
        :disabled="pending"
      />

      <UInput
        v-model="form.description"
        placeholder="身份/描述"
        class="w-full"
        size="xl"
        :disabled="pending"
      />

      <UTextarea
        v-model="form.background"
        placeholder="背景故事"
        auto-resize
        :rows="3"
        class="w-full"
        size="xl"
        :disabled="pending"
      />

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
          :disabled="pending || isLoadingVoices"
          :loading="isLoadingVoices"
        />
      </div>

      <UAlert
        v-if="error || formError"
        color="error"
        variant="soft"
        :title="(error || formError) ?? ''"
        class="mb-4"
      />

      <div class="w-full flex mt-8">
        <UButton
          type="submit"
          icon="material-symbols:check-circle"
          size="xl"
          :loading="pending"
          :disabled="!form.name.trim()"
          class="w-full"
        >
          确认
        </UButton>
      </div>
    </form>
  </div>
</template>
