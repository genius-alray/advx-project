<script setup lang="ts">
const { fetchThreads, deleteThread, error } = useThreads();
const { fetchRoles } = useRoles();
const { isAuthenticated } = useAuth();

const threads = ref<Thread[]>([]);
const roles = ref<Role[]>([]);
const isLoading = ref(true);

watch(
  isAuthenticated,
  (authenticated) => {
    if (!authenticated) {
      navigateTo("/login");
    }
  },
  { immediate: true }
);

const loadData = async () => {
  if (!isAuthenticated.value) return;

  isLoading.value = true;
  try {
    const [threadsData, rolesData] = await Promise.all([
      fetchThreads(),
      fetchRoles(),
    ]);
    threads.value = threadsData;
    roles.value = rolesData;
  } catch (err) {
    console.error("Failed to load data:", err);
  } finally {
    isLoading.value = false;
  }
};

const getRoleName = (roleId: string) => {
  const role = roles.value.find((r) => r.id === roleId);
  return role?.name || "未知角色";
};

const _handleDeleteThread = async (threadId: string) => {
  const success = await deleteThread(threadId);
  if (success) {
    await loadData();
  }
};

const handleThreadClick = (thread: Thread) => {
  navigateTo(`/chat/${thread.id}`);
};

usePageRefresh(loadData);

const { onTabRefresh } = useTabNavigation();
onTabRefresh(loadData);
</script>

<template>
  <div class="contents">
    <header
      class="bg-transparent text-2xl font-bold flex justify-between px-9 items-center"
    >
      <span>对话历史</span>
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
      <div v-else-if="error" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center space-y-4 text-primary">
          <Icon name="material-symbols:error" class="text-8xl" />
          <span>{{ error }}</span>
          <UButton variant="outline" @click="loadData">重试</UButton>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="threads.length === 0"
        class="flex items-center justify-center h-full"
      >
        <div class="flex flex-col items-center space-y-4 text-primary">
          <Icon name="material-symbols:chat-bubble" class="text-8xl" />
          <span>还没有任何对话</span>
          <span class="text-sm text-black/50"
            >去首页选择一个角色开始对话吧</span
          >
        </div>
      </div>

      <!-- Threads list -->
      <div v-else class="p-4 space-y-4 h-full overflow-auto">
        <div
          v-for="thread of threads"
          :key="thread.id"
          class="flex items-center py-4 px-6 shadow-xl shadow-primary/20 rounded-xl space-x-4 bg-white cursor-pointer hover:shadow-2xl transition-shadow group"
          @click="handleThreadClick(thread)"
        >
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <span class="text-lg font-semibold">{{ thread.title }}</span>
              <span class="text-xs text-gray-500">{{
                getRoleName(thread.roleId)
              }}</span>
            </div>

            <div
              v-if="thread.content && thread.content.length > 0"
              class="text-sm text-gray-600"
            >
              {{
                thread.content[thread.content.length - 1]?.content?.slice(
                  0,
                  50
                )
              }}...
            </div>
            <div v-else class="text-sm text-gray-400">暂无消息</div>
          </div>

          <!-- <UButton
            icon="material-symbols:delete"
            variant="ghost"
            color="error"
            size="sm"
            class="opacity-0 transition-opacity"
            @click.stop="_handleDeleteThread(thread.id)"
          /> -->
        </div>
      </div>
    </main>
  </div>
</template>
