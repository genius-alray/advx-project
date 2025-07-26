<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const memoryCounts = ref<Record<string, number>>({});
const {
  data,
  refresh,
  pending,
  error: fetchError,
} = await useFetch<Role[]>("/api/role/all");
const roleEditOpen = ref(false);
const roles = computed(() => data.value || []);

const handleDeleteRole = async (roleId: string) => {
  if (!confirm("确定要删除这个角色吗？")) return;

  try {
    await $fetch(`/api/role/${roleId}`, {
      method: "DELETE",
    });
    await refresh();
  } catch (err) {
    console.error("Failed to delete role:", err);
    alert("删除角色失败，请重试");
  }
};
function handleCreated() {
  roleEditOpen.value = false;
  refresh();
}
const router = useRouter();
const loadingIndicator = useLoadingIndicator();
const toast = useToast();
function createChat(roleId: string) {
  loadingIndicator.start();
  $fetch("/api/thread/create", {
    method: "POST",
    body: { roleId },
  })
    .then((res) => {
      router.push(`/chat/${res.id}`);
    })
    .catch((err) => {
      toast.add({
        title: "创建失败" + err,
        color: "error",
      });
    })
    .finally(() => {
      loadingIndicator.finish();
    });
}
</script>

<template>
  <div class="contents">
    <header
      class="bg-transparent text-2xl font-bold flex justify-between px-9 items-center"
    >
      <span>记忆回廊</span>
      <UDrawer v-model:open="roleEditOpen" :handle="false">
        <Icon
          name="material-symbols:add-circle-outline"
          class="text-primary text-4xl"
        />
        <template #body>
          <RoleEdit @created="handleCreated" />
        </template>
      </UDrawer>
    </header>
    <main class="flex-1">
      <div v-if="pending" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center space-y-4 text-primary">
          <Icon name="material-symbols:refresh" class="text-8xl animate-spin" />
          <span>加载中...</span>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="fetchError"
        class="flex items-center justify-center h-full"
      >
        <div class="flex flex-col items-center space-y-4 text-primary">
          <Icon name="material-symbols:error" class="text-8xl" />
          <span>{{ fetchError }}</span>
          <UButton variant="outline" @click="() => refresh()">重试</UButton>
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
          <span class="text-sm text-black/50"
            >点击右上角的 + 号创建第一个角色</span
          >
        </div>
      </div>

      <!-- Roles list -->
      <div v-else class="p-4 space-y-4 h-full overflow-auto">
        <div
          v-for="role of roles"
          :key="role.id"
          class="flex h-24 items-center py-4 px-8 shadow-xl shadow-primary/20 rounded-xl space-x-4 bg-white cursor-pointer hover:shadow-2xl transition-shadow group"
          @click="createChat(role.id)"
        >
          <UAvatar :src="role.avatar || undefined" size="3xl" />
          <div class="flex flex-1 flex-col overflow-hidden">
            <span class="text-lg overflow-ellipsis overflow-hidden">{{
              role.name
            }}</span>
            <span
              class="text-md text-black/50 overflow-ellipsis overflow-hidden"
              >{{ role.description }}</span
            >
          </div>

          <!-- 记忆数量显示 -->
          <div class="flex flex-col items-center justify-center px-4 min-w-24">
            <div class="text-xl font-bold text-primary">
              {{ memoryCounts[role.id] || 0 }}
            </div>
            <div class="text-xs text-gray-500">段记忆</div>
          </div>

          <!-- 删除按钮 -->
          <!-- <div class="flex-shrink-0">
            <UButton
              icon="material-symbols:delete"
              variant="ghost"
              color="error"
              size="sm"
              title="删除角色"
              @click.stop="handleDeleteRole(role.id)" />
          </div> -->
        </div>
      </div>
    </main>
  </div>
</template>
