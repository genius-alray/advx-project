<script setup lang="ts">
import type { Role } from "~~/shared/types/role";

definePageMeta({
  middleware: "auth",
});

// 简单的响应式状态
const roles = ref<Role[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// 直接获取角色数据
const loadRoles = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    roles.value = await $fetch<Role[]>("/api/role/all");
  } catch (err) {
    console.error("Failed to load roles:", err);
    error.value = "加载角色失败";
  } finally {
    isLoading.value = false;
  }
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
  // Navigate to chat with this role
  navigateTo(`/chat/${role.id}`);
};

const handleMemoryClick = (role: Role) => {
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
      <div class="flex space-x-2 opacity-100 transition-opacity">
        <UButton
          icon="material-symbols:auto-stories"
          variant="ghost"
          color="primary"
          size="sm"
          @click.stop="handleMemoryClick(role)"
          title="管理记忆"
        />
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
