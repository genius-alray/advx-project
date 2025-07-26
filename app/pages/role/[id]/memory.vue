<script setup lang="ts">
import type { Knowledge } from "~~/server/service/knowledgeManager";
import type { Role } from "~~/shared/types/role";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const roleId = route.params.id as string;

// 简单的响应式状态
const error = ref<string | null>(null);
const {
  data: rolesData,
  refresh: refreshRoles,
  pending,
} = await useFetch<Role[]>("/api/role/all");
const {
  data: knowledgeData,
  refresh: refreshKnowledge,
  pending: pendingKnowledge,
} = await useFetch<Knowledge[]>(`/api/role/${roleId}/knowledge`);
const role = computed(() =>
  rolesData.value?.find((r: Role) => r.id === roleId)
);
const knowledge = computed(() => knowledgeData.value || []);

// 直接删除记忆
const handleDelete = async (knowledgeId: string) => {
  if (!confirm("确定要删除这条记忆吗？")) return;

  try {
    await $fetch(`/api/knowledge/${knowledgeId}`, {
      method: "DELETE",
    });

    await refreshKnowledge(); // 重新加载数据
  } catch (err) {
    console.error("Failed to delete knowledge:", err);
    alert("删除记忆失败，请重试");
  }
};
function finishEdit() {
  editOpen.value = false;
  refreshKnowledge();
}
const editOpen = ref(false);
</script>

<template>
  <div class="contents">
    <header
      class="bg-transparent text-2xl font-bold flex justify-between px-8 items-center">
      <span><BackIcon /> 记忆收录</span>
      <UDrawer v-model:open="editOpen" :handle="false">
        <Icon
          name="material-symbols:add-circle-outline"
          class="text-primary text-4xl" />
        <template #body>
          <MemoryEdit :id="role!.id" @finish="finishEdit" />
        </template>
      </UDrawer>
    </header>
    <main class="flex-1 w-full flex flex-col max-w-md overflow-auto px-8">
      <!-- 角色信息展示 -->
      <div v-if="role" class="py-4">
        <div class="flex items-center space-x-4">
          <!-- 角色头像 -->
          <div class="w-16 h-16 rounded-full overflow-hide flex-shrink-0">
            <img
              v-if="role.avatar"
              :src="role.avatar"
              :alt="role.name"
              class="w-full h-full object-cover" />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-400">
              <Icon name="material-symbols:person" class="text-2xl" />
            </div>
          </div>

          <!-- 角色信息 -->
          <div class="flex-1 text-md">
            <span>{{ role.name }}</span>
            <span class="text-primary"
              >· 已收录 {{ knowledge.length }} 段记忆</span
            >
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="pending" class="py-16 flex items-center justify-center">
        <LoadingState message="加载记忆中..." />
      </div>

      <!-- Error state -->
      <div
        v-else-if="error && knowledge.length === 0"
        class="py-16 flex items-center justify-center">
        <ErrorState :message="error" @retry="refreshKnowledge" />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="knowledge.length === 0"
        class="py-16 flex items-center justify-center">
        <EmptyState
          icon="material-symbols:auto-stories"
          title="还没有添加任何记忆"
          description="在上方输入框中添加关于这个角色的第一段记忆吧" />
      </div>

      <!-- 记忆卡片列表 -->
      <div v-else class="pb-6">
        <USeparator label="已收录记忆" class="my-8 text-primary" />
        <div class="grid gap-4">
          <div
            v-for="item in knowledge"
            :key="item.id"
            class="rounded-lg flex justify-center space-x-2 text-primary bg-primary-50/50 shadow-md shadow-primary/50 py-3">
            <Icon
              :name="'streamline-plump-color:voice-activation-1'"
              class="text-xl" />
            <span>
              {{ item.name }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
