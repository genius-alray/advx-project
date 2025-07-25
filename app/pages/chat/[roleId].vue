<script setup lang="ts">
import type { Role } from "~~/shared/types/role";
import type { Thread } from "~~/shared/types/thread";
import type { Message } from "~~/shared/types/message";

definePageMeta({ layout: false });

const route = useRoute();
const roleId = route.params.roleId as string;

// 简单的响应式状态
const role = ref<Role | null>(null);
const thread = ref<Thread | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref("");
const isLoading = ref(true);
const isSending = ref(false);
const chatContainer = ref<HTMLElement>();
const lastFailedMessage = ref<string | null>(null);

// 直接获取角色数据
const loadRole = async () => {
  try {
    const roles = await $fetch<Role[]>("/api/role/all");
    role.value = roles.find((r: Role) => r.id === roleId) || null;
    if (!role.value) {
      throw new Error("Role not found");
    }
  } catch (err) {
    console.error("Failed to load role:", err);
    await navigateTo("/");
  }
};

// 直接创建新对话
const createNewThread = async () => {
  if (!role.value) return;

  try {
    const result = await $fetch<{ id: string }>("/api/thread/create", {
      method: "POST",
      body: { roleId },
    });

    if (result) {
      const threadData = await $fetch<Thread>(
        `/api/thread/${result.id}/content`
      );
      if (threadData) {
        thread.value = threadData;
        messages.value = threadData.content || [];
      }
    }
  } catch (err) {
    console.error("Failed to create thread:", err);
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
  navigateTo("/");
};

const retryLastMessage = async () => {
  if (!lastFailedMessage.value || !thread.value || isSending.value) return;

  newMessage.value = lastFailedMessage.value;
  lastFailedMessage.value = null;
  await handleSendMessage();
};

// 页面初始化 - 每次进入页面都重新加载所有数据
onMounted(async () => {
  isLoading.value = true;
  try {
    await loadRole();
    await createNewThread();
  } finally {
    isLoading.value = false;
    nextTick(() => {
      scrollToBottom();
    });
  }
});
</script>

<template>
  <div
    class="h-screen w-full bg-primary-50/50 flex flex-col max-w-md mx-auto overflow-hidden"
  >
    <!-- Header -->
    <header class="flex items-center p-4 bg-white shadow-sm min-h-0">
      <UButton
        icon="material-symbols:arrow-back"
        variant="ghost"
        size="sm"
        @click="goBack"
        class="flex-shrink-0"
      />

      <div v-if="role" class="flex items-center ml-4 flex-1 min-w-0">
        <UAvatar
          :src="role.avatar || undefined"
          size="md"
          class="flex-shrink-0"
        />
        <div class="ml-3 min-w-0 flex-1">
          <h1 class="text-lg font-bold truncate">{{ role.name }}</h1>
          <p class="text-sm text-gray-500 truncate">{{ role.description }}</p>
        </div>
      </div>

      <div v-else class="flex-1 ml-4">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div class="h-3 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    </header>

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
        <UButton @click="goBack" variant="outline">返回</UButton>
      </div>
    </div>

    <!-- Chat messages -->
    <div v-else class="flex-1 flex flex-col">
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Welcome message -->
        <div
          v-if="messages.length === 0"
          class="text-center text-gray-500 py-8"
        >
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
          ]"
        >
          <div
            :class="[
              'max-w-[75%] px-4 py-2 rounded-lg break-words',
              message.sender === 'user'
                ? 'bg-primary text-white'
                : 'bg-white shadow-sm',
            ]"
          >
            <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isSending" class="flex justify-start">
          <div class="bg-white shadow-sm px-4 py-2 rounded-lg">
            <div class="flex space-x-1">
              <div
                class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              ></div>
              <div
                class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 0.1s"
              ></div>
              <div
                class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 0.2s"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message input -->
      <div class="p-4 bg-white flex-shrink-0">
        <!-- Retry button for failed messages -->
        <div
          v-if="lastFailedMessage"
          class="mb-3 p-3 bg-red-50 rounded-lg border border-red-200"
        >
          <div class="flex items-center justify-between min-w-0">
            <div class="flex items-center space-x-2 min-w-0 flex-1">
              <Icon
                name="material-symbols:error"
                class="text-red-500 flex-shrink-0"
              />
              <span class="text-sm text-red-700 truncate">消息发送失败</span>
            </div>
            <div class="flex space-x-2 flex-shrink-0 ml-2">
              <UButton
                size="xs"
                variant="outline"
                @click="lastFailedMessage = null"
              >
                取消
              </UButton>
              <UButton size="xs" @click="retryLastMessage" :loading="isSending">
                重试
              </UButton>
            </div>
          </div>
          <div
            class="mt-2 text-sm text-gray-600 bg-white p-2 rounded border break-words"
          >
            "{{ lastFailedMessage }}"
          </div>
        </div>

        <form @submit.prevent="handleSendMessage" class="flex space-x-2">
          <UInput
            v-model="newMessage"
            placeholder="输入消息..."
            class="flex-1 min-w-0"
            :disabled="isSending || !thread"
            @keydown.enter.prevent="handleSendMessage"
          />

          <UButton
            type="submit"
            icon="material-symbols:send"
            :loading="isSending"
            :disabled="!newMessage.trim() || !thread"
            class="flex-shrink-0"
          />
        </form>
      </div>
    </div>
  </div>
</template>
