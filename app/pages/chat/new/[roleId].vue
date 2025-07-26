<script setup lang="ts">
import type { Role } from "~~/shared/types/role";

definePageMeta({ layout: false });

const route = useRoute();
const roleId = route.params.roleId as string;

const isLoading = ref(true);
const error = ref<string | null>(null);

const createAndRedirectToChat = async () => {
  try {
    const roles = await $fetch<Role[]>("/api/role/all");
    const role = roles.find((r: Role) => r.id === roleId);
    if (!role) {
      throw new Error("角色不存在");
    }

    const result = await $fetch<{ id: string }>("/api/thread/create", {
      method: "POST",
      body: { roleId },
    });

    if (result?.id) {
      await navigateTo(`/chat/${result.id}`);
    } else {
      throw new Error("创建对话失败");
    }
  } catch (err) {
    console.error("Failed to create new chat:", err);
    error.value = err instanceof Error ? err.message : "创建对话失败";

    setTimeout(() => {
      navigateTo("/");
    }, 3000);
  }
};

onMounted(async () => {
  isLoading.value = true;
  await createAndRedirectToChat();
  isLoading.value = false;
});
</script>

<template>
  <div
    class="h-screen w-full bg-primary-50/50 flex items-center justify-center max-w-md mx-auto">
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center space-y-4 text-primary">
      <Icon name="material-symbols:refresh" class="text-6xl animate-spin" />
      <span>正在创建新对话...</span>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="flex flex-col items-center space-y-4 text-primary">
      <Icon name="material-symbols:error" class="text-6xl" />
      <span>{{ error }}</span>
      <span class="text-sm text-gray-500">3秒后自动返回首页</span>
    </div>
  </div>
</template>
