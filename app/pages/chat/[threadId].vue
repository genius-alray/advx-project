<script setup lang="ts">
import type { Message } from "~~/shared/types/message";
import type { Role } from "~~/shared/types/role";
import type { Thread } from "~~/shared/types/thread";

definePageMeta({ layout: false });

const route = useRoute();
const threadId = route.params.threadId as string;

// 简单的响应式状态
const role = ref<Role | null>(null);
const thread = ref<Thread | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref("");
const isLoading = ref(true);
const isSending = ref(false);
const chatContainer = ref<HTMLElement>();
const lastFailedMessage = ref<string | null>(null);
const error = ref<string | null>(null);

// 加载thread和相关的role数据
const loadThreadAndRole = async () => {
  try {
    // 首先获取thread数据
    const threadData = await $fetch<Thread>(`/api/thread/${threadId}/content`);
    if (!threadData) {
      throw new Error("Thread not found");
    }
    thread.value = threadData;
    messages.value = threadData.content || [];

    // 然后获取对应的role数据
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
    // Add user message to local state immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      senderId: "current-user",
      type: "text",
      content: messageText,
    };
    messages.value.push(userMessage);

    // Scroll to bottom after adding user message
    nextTick(() => {
      scrollToBottom();
    });

    // 直接发送消息到后端
    await $fetch(`/api/thread/${thread.value.id}/text`, {
      method: "POST",
      body: { message: messageText },
    });

    // 直接获取 AI 回复
    const replyResult = await $fetch<{ success: boolean; message?: string }>(
      `/api/thread/${thread.value.id}/reply`
    );

    if (replyResult.success && replyResult.message) {
      // Add AI message to local state immediately
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        senderId: thread.value.roleId,
        type: "text",
        content: replyResult.message,
      };
      messages.value.push(aiMessage);

      // Scroll to bottom after adding AI message
      nextTick(() => {
        scrollToBottom();
      });
    } else {
      // 如果 AI 回复失败，重新获取对话内容
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
    // Store the failed message for retry
    lastFailedMessage.value = messageText;

    // Show error message to user
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

// 页面初始化 - 加载现有的thread和role数据
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
</script>

<template>
  <UContainer class="bg-primary-50 w-screen h-screen flex flex-col p-0">
    <header class="flex items-center p-4 min-h-0">
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
                'max-w-[75%] px-4 py-2 rounded-lg break-words',
                message.sender === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-white shadow-sm',
              ]">
              <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
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
