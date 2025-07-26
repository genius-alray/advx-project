<script setup lang="ts">
import type { Message } from "~~/shared/types/message";
import type { Role } from "~~/shared/types/role";
import type { Thread } from "~~/shared/types/thread";

definePageMeta({ layout: false });

const route = useRoute();
const router = useRouter();
const threadId = route.params.threadId as string;

const role = ref<Role | null>(null);
const thread = ref<Thread | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref("");
const isLoading = ref(true);
const isSending = ref(false);
const chatContainer = ref<HTMLElement>();
const lastFailedMessage = ref<string | null>(null);
const error = ref<string | null>(null);
const playingMessageId = ref<string | null>(null);
const currentAudio = ref<HTMLAudioElement | null>(null);

const { synthesizeSpeech } = useVoices();

const loadThreadAndRole = async () => {
  try {
    const threadData = await $fetch<Thread>(`/api/thread/${threadId}/content`);
    if (!threadData) {
      throw new Error("Thread not found");
    }
    thread.value = threadData;
    messages.value = threadData.content || [];

    const roles = await $fetch<Role[]>("/api/role/all");
    role.value = roles.find((r: Role) => r.id === threadData.roleId) || null;
    if (!role.value) {
      throw new Error("Role not found");
    }
  } catch (err) {
    console.error("Failed to load thread or role:", err);
    await navigateTo("/");
  }
};

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !thread.value || isSending.value) return;

  const messageText = newMessage.value.trim();
  newMessage.value = "";
  isSending.value = true;

  try {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      senderId: "current-user",
      type: "text",
      content: messageText,
    };
    messages.value.push(userMessage);

    nextTick(() => {
      scrollToBottom();
    });

    await $fetch(`/api/thread/${thread.value.id}/text`, {
      method: "POST",
      body: { message: messageText },
    });

    const replyResult = await $fetch<{ success: boolean; message?: string }>(
      `/api/thread/${thread.value.id}/reply`
    );

    if (replyResult.success && replyResult.message) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        senderId: thread.value.roleId,
        type: "text",
        content: replyResult.message,
      };
      messages.value.push(aiMessage);

      nextTick(() => {
        scrollToBottom();
      });
    } else {
      const updatedThread = await $fetch<Thread>(
        `/api/thread/${thread.value.id}/content`
      );
      if (updatedThread) {
        messages.value = updatedThread.content || [];
        nextTick(() => {
          scrollToBottom();
        });
      }
    }
  } catch (err) {
    console.error("Failed to send message:", err);

    lastFailedMessage.value = messageText;

    const errorMessage: Message = {
      id: (Date.now() + 2).toString(),
      sender: "ai",
      senderId: thread.value?.roleId || "system",
      type: "text",
      content: "抱歉，发送消息时出现了问题。",
    };
    messages.value.push(errorMessage);
  } finally {
    isSending.value = false;
  }
};

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const goBack = () => {
  navigateTo("/threads");
};

const voiceCache = new Map<string, string>();
const playMessage = async (message: Message) => {
  if (playingMessageId.value === message.id) {
    if (currentAudio.value) {
      currentAudio.value.pause();
      currentAudio.value = null;
    }
    playingMessageId.value = null;
    return;
  }

  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
  }

  if (!role.value?.voiceId) {
    console.error("No voice ID found for role");
    return;
  }

  playingMessageId.value = message.id;

  try {
    let audioUrl = "";
    if (!voiceCache.has(message.id)) {
      audioUrl = (await synthesizeSpeech(message.content, role.value.voiceId))!;
      voiceCache.set(message.id, audioUrl);
    }

    if (!audioUrl) {
      throw new Error("Failed to get audio URL");
    }

    const audio = new Audio(audioUrl);
    currentAudio.value = audio;

    audio.onended = () => {
      playingMessageId.value = null;
      currentAudio.value = null;
    };

    audio.onerror = () => {
      playingMessageId.value = null;
      currentAudio.value = null;
      console.error("语音播放失败");
    };

    await audio.play();
  } catch (err) {
    console.error("Failed to play message:", err);
    playingMessageId.value = null;
    currentAudio.value = null;
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    await loadThreadAndRole();
  } finally {
    isLoading.value = false;
    nextTick(() => {
      scrollToBottom();
    });
  }
});

onUnmounted(() => {
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
  }
  playingMessageId.value = null;
});

onUnmounted(() => {
  speechSynthesis.cancel();
});
</script>

<template>
  <UContainer class="bg-primary-50 w-screen h-dvh flex flex-col p-0">
    <header v-if="role" class="flex items-center p-4 min-h-0">
      <BackIcon />

      <div
        v-if="role"
        class="flex flex-col justify-center items-center flex-1 min-w-0">
        <div class="flex items-center">
          <UAvatar
            :src="role.avatar || undefined"
            size="md"
            class="flex-shrink-0" />
          <div class="ml-3 min-w-0 flex-1">
            <h1 class="text-lg font-bold truncate">{{ role.name }}</h1>
          </div>
        </div>
      </div>
      <Icon
        name="tabler:menu-deep"
        class="text-primary"
        @click="router.push(`/role/${role.id}/memory`)" />
    </header>
    <main class="flex-1 overflow-auto">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex-1 flex items-center justify-center">
        <div class="flex flex-col items-center space-y-4 text-primary">
          <Icon name="material-symbols:refresh" class="text-6xl animate-spin" />
          <span>正在准备对话...</span>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="flex-1 flex items-center justify-center">
        <div class="flex flex-col items-center space-y-4 text-primary">
          <Icon name="material-symbols:error" class="text-6xl" />
          <span>{{ error }}</span>
          <UButton variant="outline" @click="goBack">返回</UButton>
        </div>
      </div>

      <!-- Chat messages -->
      <div v-else class="flex-1 flex flex-col">
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Welcome message -->
          <div
            v-if="messages.length === 0"
            class="text-center text-gray-500 py-8">
            <Icon name="material-symbols:chat" class="text-4xl mb-2" />
            <p>开始与 {{ role?.name }} 对话吧</p>
          </div>

          <!-- Messages -->
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex px-2',
              message.sender === 'user' ? 'justify-end' : 'justify-start',
            ]">
            <div
              :class="[
                'flex flex-col',
                message.sender === 'user' ? 'items-end' : 'items-start',
              ]">
              <div
                :class="[
                  'px-4 py-2 rounded-lg break-words flex items-center space-x-2',
                  message.sender === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white shadow-sm',
                ]">
                <UButton
                  v-if="message.sender === 'ai'"
                  :icon="
                    playingMessageId === message.id
                      ? 'material-symbols:stop'
                      : 'material-symbols:play-arrow'
                  "
                  size="xs"
                  :loading="playingMessageId === message.id"
                  @click="playMessage(message)" />
                <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
              </div>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isSending" class="flex justify-start">
            <div class="bg-white shadow-sm px-4 py-2 rounded-lg">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 0.1s" />
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 0.2s" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="bg-white shadow-lg rounded-tl-xl rounded-tr-xl w-full">
      <form
        class="p-4 flex space-x-2 items-center"
        @submit.prevent="handleSendMessage">
        <UInput
          v-model="newMessage"
          placeholder="输入消息..."
          class="flex-1"
          size="xl"
          :disabled="isSending || !thread" />

        <!-- <UButton
          type="submit"
          icon="material-symbols:send"
          :loading="isSending"
          :disabled="!newMessage.trim() || !thread"
          size="xl"
          class="text-xl"
          @click="handleSendMessage" /> -->
      </form>
    </footer>
  </UContainer>
</template>
