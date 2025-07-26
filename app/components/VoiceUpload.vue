<script setup lang="ts">
const emits = defineEmits(["close", "created"]);

const { uploadVoice } = useVoices();

const voiceFile = ref<File | null>(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadError = ref<string | null>(null);

const handleFileUpload = async (file: unknown) => {
  const selectedFile = file as File | null;

  if (!selectedFile) {
    voiceFile.value = null;
    return;
  }

  if (!selectedFile.type.startsWith("audio/")) {
    uploadError.value = "请上传音频文件";
    return;
  }

  if (selectedFile.size > 10 * 1024 * 1024) {
    uploadError.value = "文件大小不能超过10MB";
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;
  uploadError.value = null;

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
      emits("created");
      emits("close");
      voiceFile.value = null;
    } else {
      uploadError.value = "上传失败，请重试";
    }
  } catch (err) {
    console.error("Failed to upload voice:", err);
    uploadError.value = "语音上传失败，请重试";
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-800">上传语音文件</h2>
    </div>

    <!-- Upload area -->
    <div class="space-y-4">
      <UFileUpload
        v-model="voiceFile"
        variant="area"
        accept="audio/*"
        icon="material-symbols:mic"
        label="拖拽语音文件到此处或点击上传"
        description="支持 MP3, WAV, M4A 格式，文件大小不超过 10MB"
        size="lg"
        :disabled="isUploading"
        :highlight="!!uploadError"
        color="primary"
        class="min-h-48"
        @update:model-value="handleFileUpload" />

      <!-- Upload progress -->
      <div v-if="isUploading" class="space-y-2">
        <div class="flex justify-between text-sm">
          <span>上传中...</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }" />
        </div>
      </div>

      <!-- Error message -->
      <UAlert
        v-if="uploadError"
        color="error"
        variant="soft"
        :title="uploadError"
        class="mb-4" />

      <!-- Instructions -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-medium text-gray-800 mb-2">上传说明</h4>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• 支持的格式：MP3, WAV, M4A</li>
          <li>• 文件大小限制：10MB</li>
          <li>• 建议录制清晰的语音样本以获得更好的效果</li>
          <li>• 上传的语音将用于创建个性化的声音模型</li>
        </ul>
      </div>
    </div>
  </div>
</template>
