<script setup lang="ts">
const { uploadVoice, fetchUserVoiceDetails, error } = useVoices();
const { isAuthenticated } = useAuth();

const voices = ref<
  { id: string; name: string; size: number; type: string; url: string }[]
>([]);
const isLoading = ref(true);
const isUploading = ref(false);
const uploadProgress = ref(0);
const voiceFile = ref<File | null>(null);
const currentAudio = ref<HTMLAudioElement | null>(null);

const loadVoices = async () => {
  if (!isAuthenticated.value) return;

  isLoading.value = true;
  try {
    voices.value = await fetchUserVoiceDetails();
  } catch (err) {
    console.error("Failed to load voices:", err);
  } finally {
    isLoading.value = false;
  }
};

// Redirect to login if not authenticated and load data when authenticated
watch(
  isAuthenticated,
  (authenticated) => {
    if (!authenticated) {
      navigateTo("/login");
    } else {
      // 用户登录后立即加载数据
      loadVoices();
    }
  },
  { immediate: true }
);

const handleFileUpload = async (file: unknown) => {
  const selectedFile = file as File | null;

  if (!selectedFile) {
    voiceFile.value = null;
    return;
  }

  // Check if it's an audio file
  if (!selectedFile.type.startsWith("audio/")) {
    alert("请上传音频文件");
    return;
  }

  // Check file size (limit to 10MB)
  if (selectedFile.size > 10 * 1024 * 1024) {
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

    const result = await uploadVoice(selectedFile);

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    if (result) {
      await loadVoices(); // Refresh the list
      alert("语音上传成功！");
      voiceFile.value = null; // Reset file after successful upload
    }
  } catch (err) {
    console.error("Failed to upload voice:", err);
    alert("语音上传失败");
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

// 播放语音
const playVoice = (voiceUrl: string) => {
  // 停止当前播放的音频
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
  }

  // 创建新的音频对象并播放
  const audio = new Audio(voiceUrl);
  currentAudio.value = audio;

  audio.play().catch((err) => {
    console.error("Failed to play audio:", err);
    alert("播放失败，请重试");
  });

  // 播放结束后清理
  audio.addEventListener("ended", () => {
    currentAudio.value = null;
  });
};

// 下载语音
const downloadVoice = (voiceUrl: string, voiceName: string) => {
  const link = document.createElement("a");
  link.href = voiceUrl;
  link.download = `${voiceName}.mp3`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
    <!-- Upload section -->
    <div class="p-4 bg-white">
      <div class="space-y-4">
        <div class="text-center">
          <p class="text-gray-600 mb-2">上传语音文件</p>
          <p class="text-xs text-gray-500 mb-4">
            支持 MP3, WAV, M4A 格式，文件大小不超过 10MB
          </p>

          <UFileUpload
            v-model="voiceFile"
            variant="button"
            accept="audio/*"
            icon="material-symbols:mic"
            size="lg"
            class="text-primary"
            :disabled="isUploading"
            @update:model-value="handleFileUpload"
          />
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
                <div class="font-medium">{{ voice.name }}</div>
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
                @click="playVoice(voice.url)"
              >
                播放
              </UButton>
              <UButton
                icon="material-symbols:download"
                variant="outline"
                size="sm"
                @click="downloadVoice(voice.url, voice.name)"
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
