<script setup lang="ts">
import type { Role } from "~~/shared/types/role";

definePageMeta({
  middleware: "auth",
});

// 简单的响应式状态
const roles = ref<Role[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const memoryCounts = ref<Record<string, number>>({});

// 直接获取角色数据
const loadRoles = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    roles.value = await $fetch<Role[]>("/api/role/all");
    // 加载每个角色的记忆数量
    await loadMemoryCounts();
  } catch (err) {
    console.error("Failed to load roles:", err);
    error.value = "加载角色失败";
  } finally {
    isLoading.value = false;
  }
};

// 加载所有角色的记忆数量
const loadMemoryCounts = async () => {
  const counts: Record<string, number> = {};

  for (const role of roles.value) {
    try {
      const memories = await $fetch<{ id: string }[]>(
        `/api/role/${role.id}/knowledge`
      );
      counts[role.id] = memories.length;
    } catch (err) {
      console.error(`Failed to load memory count for role ${role.id}:`, err);
      counts[role.id] = 0;
    }
  }

  memoryCounts.value = counts;
};

// 直接删除角色
const handleDeleteRole = async (roleId: string) => {
  if (!confirm("确定要删除这个角色吗？")) return;

  try {
    await $fetch(`/api/role/${roleId}`, {
      method: "DELETE",
    });
    await loadRoles(); // 重新加载数据
  } catch (err) {
    console.error("Failed to delete role:", err);
    alert("删除角色失败，请重试");
  }
};

const handleRoleClick = (role: Role) => {
  // Navigate to memory management for this role
  navigateTo(`/role/${role.id}/memory`);
};

// 页面初始化 - 每次进入页面都重新加载所有数据
onMounted(async () => {
  await loadRoles();
});
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="flex items-center justify-center h-full">
    <div class="flex flex-col items-center space-y-4 text-primary">
      <Icon name="material-symbols:refresh" class="text-8xl animate-spin" />
      <span>加载中...</span>
    </div>
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="flex items-center justify-center h-full">
    <div class="flex flex-col items-center space-y-4 text-primary">
      <Icon name="material-symbols:error" class="text-8xl" />
      <span>{{ error }}</span>
      <UButton @click="loadRoles" variant="outline">重试</UButton>
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else-if="roles.length === 0"
    class="flex items-center justify-center h-full"
  >
    <div class="flex flex-col items-center space-y-4 text-primary">
      <Icon name="material-symbols:person-add" class="text-8xl" />
      <span>还没有创建任何角色</span>
      <span class="text-sm text-black/50">点击右上角的 + 号创建第一个角色</span>
    </div>
  </div>

  <!-- Roles list -->
  <div v-else class="p-4 space-y-4 h-full overflow-auto">
    <div
      v-for="role of roles"
      :key="role.id"
      class="flex h-24 items-center py-4 px-8 shadow-xl shadow-primary/20 rounded-xl space-x-4 bg-white cursor-pointer hover:shadow-2xl transition-shadow group"
      @click="handleRoleClick(role)"
    >
      <UAvatar :src="role.avatar || undefined" size="3xl" />
      <div class="flex flex-1 flex-col">
        <span class="text-2xl">{{ role.name }}</span>
        <span class="text-md text-black/50">{{ role.description }}</span>
      </div>

      <!-- 记忆数量显示 -->
      <div class="flex flex-col items-center justify-center px-4">
        <div class="text-2xl font-bold text-primary">
          {{ memoryCounts[role.id] || 0 }}
        </div>
        <div class="text-xs text-gray-500">段记忆</div>
      </div>

      <!-- 删除按钮 -->
      <div class="flex-shrink-0">
        <UButton
          icon="material-symbols:delete"
          variant="ghost"
          color="error"
          size="sm"
          @click.stop="handleDeleteRole(role.id)"
          title="删除角色"
        />
      </div>
    </div>
  </div>
</template>
