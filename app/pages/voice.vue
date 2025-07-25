<script setup lang="ts">
const { uploadVoice, fetchUserVoices, pending, error } = useVoices();
const { isAuthenticated } = useAuth();

const voices = ref<Blob[]>([]);
const isLoading = ref(true);
const isUploading = ref(false);
const uploadProgress = ref(0);

// Redirect to login if not authenticated
watch(
  isAuthenticated,
  (authenticated) => {
    if (!authenticated) {
      navigateTo("/login");
    }
  },
  { immediate: true }
);

const loadVoices = async () => {
  if (!isAuthenticated.value) return;

  isLoading.value = true;
  try {
    voices.value = await fetchUserVoices();
  } catch (err) {
    console.error("Failed to load voices:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Check if it's an audio file
  if (!file.type.startsWith("audio/")) {
    alert("请上传音频文件");
    return;
  }

  // Check file size (limit to 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert("文件大小不能超过10MB");
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10;
      }
    }, 200);

    const result = await uploadVoice(file);

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    if (result) {
      await loadVoices(); // Refresh the list
      alert("语音上传成功！");
    }
  } catch (err) {
    console.error("Failed to upload voice:", err);
    alert("语音上传失败");
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
    // Reset file input
    target.value = "";
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 使用页面刷新 composable 确保切换页面时重新加载数据
usePageRefresh(loadVoices);

// 监听选项卡刷新事件
const { onTabRefresh } = useTabNavigation();
onTabRefresh(loadVoices);
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 bg-white shadow-sm">
      <h1 class="text-2xl font-bold text-primary">语音管理</h1>
      <p class="text-sm text-gray-600 mt-1">上传家人的语音样本，用于声音克隆</p>
    </div>

    <!-- Upload section -->
    <div class="p-4 bg-white border-b">
      <div class="space-y-4">
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
        >
          <Icon
            name="material-symbols:mic"
            class="text-4xl text-gray-400 mb-2"
          />
          <p class="text-gray-600 mb-4">选择音频文件上传</p>
          <p class="text-xs text-gray-500 mb-4">
            支持 MP3, WAV, M4A 格式，文件大小不超过 10MB
          </p>

          <label class="cursor-pointer">
            <UButton icon="material-symbols:upload" :disabled="isUploading">
              选择文件
            </UButton>
            <input
              type="file"
              accept="audio/*"
              class="hidden"
              @change="handleFileUpload"
            />
          </label>
        </div>

        <!-- Upload progress -->
        <div v-if="isUploading" class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>上传中...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
          class="mb-4"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center space-y-4 text-primary">
        <Icon name="material-symbols:refresh" class="text-8xl animate-spin" />
        <span>加载中...</span>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error && voices.length === 0"
      class="flex-1 flex items-center justify-center"
    >
      <div class="flex flex-col items-center space-y-4 text-primary">
        <Icon name="material-symbols:error" class="text-8xl" />
        <span>{{ error }}</span>
        <UButton @click="loadVoices" variant="outline">重试</UButton>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="voices.length === 0"
      class="flex-1 flex items-center justify-center"
    >
      <div class="flex flex-col items-center space-y-4 text-primary">
        <Icon name="material-symbols:voice-over-off" class="text-8xl" />
        <span>还没有上传任何语音</span>
        <span class="text-sm text-black/50">上传语音样本来创建独特的声音</span>
      </div>
    </div>

    <!-- Voices list -->
    <div v-else class="flex-1 overflow-auto">
      <div class="p-4 space-y-4">
        <div class="text-sm text-gray-600 mb-4">
          已上传 {{ voices.length }} 个语音文件
        </div>

        <div
          v-for="(voice, index) in voices"
          :key="index"
          class="bg-white rounded-lg p-4 shadow-sm border"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <Icon
                name="material-symbols:audio-file"
                class="text-2xl text-primary"
              />
              <div>
                <div class="font-medium">语音文件 #{{ index + 1 }}</div>
                <div class="text-sm text-gray-500">
                  {{ formatFileSize(voice.size || 0) }}
                </div>
              </div>
            </div>

            <div class="flex space-x-2">
              <UButton
                icon="material-symbols:play-arrow"
                variant="outline"
                size="sm"
              >
                播放
              </UButton>
              <UButton
                icon="material-symbols:download"
                variant="outline"
                size="sm"
              >
                下载
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
