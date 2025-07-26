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
const uploadDrawerOpen = ref(false);

// Recording related state
const uploadMode = ref<"file" | "record">("file");
const isRecording = ref(false);
const isRecordingSupported = ref(false);
const recordingDuration = ref(0);
const recordedBlob = ref<Blob | null>(null);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordingTimer = ref<NodeJS.Timeout | null>(null);

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

watch(
  isAuthenticated,
  (authenticated) => {
    if (!authenticated) {
      navigateTo("/login");
    } else {
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

  if (!selectedFile.type.startsWith("audio/")) {
    alert("请上传音频文件");
    return;
  }

  if (selectedFile.size > 10 * 1024 * 1024) {
    alert("文件大小不能超过10MB");
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10;
      }
    }, 200);

    const result = await uploadVoice(selectedFile);

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    if (result) {
      await loadVoices();
      voiceFile.value = null;
      uploadDrawerOpen.value = false;
    }
  } catch (err) {
    console.error("Failed to upload voice:", err);
    alert("语音上传失败");
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

const playVoice = (voiceUrl: string) => {
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
  }

  const audio = new Audio(voiceUrl);
  currentAudio.value = audio;

  audio.play().catch((err) => {
    console.error("Failed to play audio:", err);
    alert("播放失败，请重试");
  });

  audio.addEventListener("ended", () => {
    currentAudio.value = null;
  });
};

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

// Recording related functions
const formatRecordingTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const checkRecordingSupport = () => {
  isRecordingSupported.value = !!(
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  );
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      recordedBlob.value = blob;

      // Stop all tracks to release microphone
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.value = recorder;
    recorder.start();
    isRecording.value = true;
    recordingDuration.value = 0;

    // Start timer
    recordingTimer.value = setInterval(() => {
      recordingDuration.value++;
    }, 1000);
  } catch (err) {
    console.error("Failed to start recording:", err);
    alert(
      "无法访问麦克风，请检查权限设置" +
        err +
        " | " +
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as unknown as any).message
    );
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;

    if (recordingTimer.value) {
      clearInterval(recordingTimer.value);
      recordingTimer.value = null;
    }
  }
};

const playRecording = () => {
  if (recordedBlob.value) {
    const audioUrl = URL.createObjectURL(recordedBlob.value);
    const audio = new Audio(audioUrl);

    if (currentAudio.value) {
      currentAudio.value.pause();
    }

    currentAudio.value = audio;
    audio.play().catch((err) => {
      console.error("Failed to play recording:", err);
      alert("播放失败，请重试");
    });

    audio.addEventListener("ended", () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio.value = null;
    });
  }
};

const resetRecording = () => {
  recordedBlob.value = null;
  recordingDuration.value = 0;

  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
  }
};

const uploadRecording = async () => {
  if (!recordedBlob.value) return;

  // Convert blob to File
  const file = new File([recordedBlob.value], `recording-${Date.now()}.webm`, {
    type: "audio/webm",
  });

  await handleFileUpload(file);
  resetRecording();
};

// Initialize recording support check
onMounted(() => {
  checkRecordingSupport();
});

// Cleanup on unmount
onUnmounted(() => {
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
  }
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
  }
  if (currentAudio.value) {
    currentAudio.value.pause();
  }
});

usePageRefresh(loadVoices);

const { onTabRefresh } = useTabNavigation();
onTabRefresh(loadVoices);
</script>

<template>
  <div class="contents">
    <header
      class="bg-transparent text-2xl font-bold flex justify-between px-9 items-center"
    >
      <span>语音样本</span>
      <UDrawer v-model:open="uploadDrawerOpen" :handle="false">
        <Icon
          name="material-symbols:add-circle-outline"
          class="text-primary text-4xl"
        />
        <template #body>
          <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-800">上传语音文件</h2>
            </div>

            <!-- Upload area -->
            <div class="space-y-4">
              <!-- Tab switcher -->
              <div class="flex bg-gray-100 rounded-lg p-1">
                <button
                  :class="[
                    'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                    uploadMode === 'file'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-800',
                  ]"
                  @click="uploadMode = 'file'"
                >
                  <Icon name="material-symbols:upload-file" class="mr-2" />
                  文件上传
                </button>
                <button
                  :class="[
                    'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                    uploadMode === 'record'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-800',
                  ]"
                  @click="uploadMode = 'record'"
                >
                  <Icon name="material-symbols:mic" class="mr-2" />
                  录音上传
                </button>
              </div>

              <!-- File upload mode -->
              <div v-if="uploadMode === 'file'" class="space-y-4">
                <UFileUpload
                  v-model="voiceFile"
                  variant="area"
                  accept="audio/*"
                  icon="material-symbols:upload-file"
                  label="拖拽语音文件到此处或点击上传"
                  description="支持 MP3, WAV, M4A 格式，文件大小不超过 10MB"
                  size="lg"
                  :disabled="isUploading"
                  color="primary"
                  class="min-h-48"
                  @update:model-value="handleFileUpload"
                />
              </div>

              <!-- Recording mode -->
              <div v-else class="space-y-4">
                <div
                  class="bg-gray-50 rounded-lg p-6 min-h-48 flex flex-col items-center justify-center"
                >
                  <!-- Recording status -->
                  <div class="text-center mb-6">
                    <h3 class="text-lg font-medium text-gray-800 mb-2">
                      {{ isRecording ? "正在录音..." : "点击开始录音" }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {{
                        isRecording
                          ? `录音时长: ${formatRecordingTime(
                              recordingDuration
                            )}`
                          : "建议录制 10-30 秒的清晰语音"
                      }}
                    </p>
                  </div>

                  <!-- Recording controls -->
                  <div class="flex flex-col items-center space-x-4 w-full">
                    <UButton
                      v-if="!isRecording && !recordedBlob"
                      size="lg"
                      :disabled="isUploading || !isRecordingSupported"
                      @click="startRecording"
                    >
                      <Icon
                        name="material-symbols:mic"
                        class="mr-2 self-center"
                      />
                      开始录音
                    </UButton>

                    <UButton
                      v-if="isRecording"
                      size="lg"
                      color="error"
                      @click="stopRecording"
                    >
                      <Icon name="material-symbols:stop" class="mr-2" />
                      停止录音
                    </UButton>

                    <template v-if="recordedBlob && !isRecording">
                      <div class="flex flex-col space-y-3 m-5">
                        <UButton
                          size="lg"
                          variant="outline"
                          @click="playRecording"
                        >
                          <Icon
                            name="material-symbols:play-arrow"
                            class="mr-2"
                          />
                          试听
                        </UButton>
                        <UButton
                          size="lg"
                          variant="outline"
                          @click="resetRecording"
                        >
                          <Icon name="material-symbols:refresh" class="mr-2" />
                          重录
                        </UButton>
                        <UButton
                          size="lg"
                          :disabled="isUploading"
                          @click="uploadRecording"
                        >
                          <Icon name="material-symbols:upload" class="mr-2" />
                          上传录音
                        </UButton>
                      </div>
                    </template>
                  </div>

                  <!-- Recording not supported message -->
                  <div v-if="!isRecordingSupported" class="mt-4 text-center">
                    <UAlert
                      color="warning"
                      variant="soft"
                      title="您的浏览器不支持录音功能"
                      description="请使用现代浏览器或切换到文件上传模式"
                    />
                  </div>
                </div>
              </div>

              <!-- Upload progress -->
              <div v-if="isUploading" class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>{{
                    uploadMode === "file" ? "上传中..." : "上传录音中..."
                  }}</span>
                  <span>{{ uploadProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-primary h-2 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }"
                  />
                </div>
              </div>

              <!-- Error message -->
              <UAlert
                v-if="error"
                color="error"
                variant="soft"
                :title="error"
                class="mb-4"
              />
            </div>
          </div>
        </template>
      </UDrawer>
    </header>
    <main class="flex-1 overflow-auto">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center space-y-4 text-primary">
          <Icon name="material-symbols:refresh" class="text-8xl animate-spin" />
          <span>加载中...</span>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error && voices.length === 0"
        class="flex items-center justify-center h-full"
      >
        <div class="flex flex-col items-center space-y-4 text-primary">
          <Icon name="material-symbols:error" class="text-8xl" />
          <span>{{ error }}</span>
          <UButton variant="outline" @click="loadVoices">重试</UButton>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="voices.length === 0"
        class="flex items-center justify-center h-full"
      >
        <div class="flex flex-col items-center space-y-4 text-primary">
          <Icon name="material-symbols:voice-over-off" class="text-8xl" />
          <span>还没有上传任何语音</span>
          <span class="text-sm text-black/50"
            >上传语音样本来创建独特的声音</span
          >
        </div>
      </div>

      <!-- Voices list -->
      <div v-else>
        <div class="p-4 space-y-4">
          <div class="text-sm text-gray-600 mb-4">
            已上传 {{ voices.length }} 个语音文件
          </div>

          <div
            v-for="(voice, index) in voices"
            :key="index"
            class="bg-white rounded-lg p-4 shadow-xl shadow-primary/20"
          >
            <div class="flex items-center justify-between">
              <Icon
                name="material-symbols:audio-file"
                class="text-2xl text-primary space-x-2"
              />
              <div class="flex flex-col space-x-3 flex-1 overflow-hidden">
                <div
                  class="font-medium max-w-full overflow-hidden overflow-ellipsis"
                >
                  {{ voice.name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatFileSize(voice.size || 0) }}
                </div>
              </div>

              <div class="flex space-x-2 min-w-[140px]">
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
    </main>
  </div>
</template>
