<script setup lang="ts">
const route = useRoute();

// 页面标题配置
const name = computed(() => {
  // 记忆管理页面特殊处理
  if (route.path.includes("/memory")) {
    return "记忆收录";
  }

  return (
    {
      "/": "记忆回廊",
      "/voice": "语音管理",
      "/b": "对话历史",
      "/c": "个人中心",
    }[route.path] || "我们的回响"
  );
});

// 判断是否显示返回按钮
const showBackButton = computed(() => {
  return route.path.includes("/memory") || route.path.includes("/chat/");
});

// 判断是否显示加号按钮
const showAddButton = computed(() => {
  return route.name === "index" || route.path.includes("/memory");
});

const isDrawerOpen = ref(false);

// 返回按钮处理
const handleBack = () => {
  if (route.path.includes("/memory")) {
    navigateTo("/");
  } else {
    history.back();
  }
};

// 获取当前角色ID（用于记忆管理页面）
const currentRoleId = computed(() => {
  if (route.path.includes("/memory")) {
    return route.params.id as string;
  }
  return null;
});

const handleRoleCreated = async () => {
  isDrawerOpen.value = false;

  // 使用选项卡刷新机制来更新角色列表
  if (route.name === "index" && process.client) {
    // 触发选项卡刷新事件，这会调用 index.vue 中的 loadRoles 函数
    window.dispatchEvent(
      new CustomEvent("tab-navigation-refresh", {
        detail: { path: "/" },
      })
    );
  }
};

const handleMemoryCreated = async () => {
  isDrawerOpen.value = false;

  // 刷新记忆管理页面
  if (route.path.includes("/memory") && process.client) {
    window.location.reload();
  }
};

const handleDrawerClose = () => {
  isDrawerOpen.value = false;
};
</script>

<template>
  <UContainer
    class="max-w-md bg-primary-50/50 p-0 pt-8 h-screen w-screen flex flex-col max-h-screen"
  >
    <header class="flex items-center px-4 py-2 bg-transparent">
      <!-- 返回按钮 -->
      <UButton
        v-if="showBackButton"
        icon="material-symbols:arrow-back"
        variant="ghost"
        size="sm"
        @click="handleBack"
      />

      <!-- 页面标题 -->
      <h1 class="text-2xl font-bold text-gray-800 ml-4 flex-1">{{ name }}</h1>

      <!-- 加号按钮 -->
      <UDrawer v-if="showAddButton" v-model="isDrawerOpen">
        <UButton icon="material-symbols:add" variant="ghost" size="sm" />
        <template #content>
          <!-- 首页：角色创建 -->
          <RoleEdit
            v-if="route.name === 'index'"
            @close="handleDrawerClose"
            @created="handleRoleCreated"
          />
          <!-- 记忆管理页面：记忆添加 -->
          <MemoryAdd
            v-else-if="route.path.includes('/memory') && currentRoleId"
            :role-id="currentRoleId"
            @close="handleDrawerClose"
            @created="handleMemoryCreated"
          />
        </template>
      </UDrawer>
    </header>
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
    <footer
      class="h-20 bg-white rounded-tl-2xl rounded-tr-2xl flex justify-between shadow-xl shadow-slate-400"
    >
      <FooterButton icon="streamline-plump-color:polaroid" target="/" />

      <FooterButton
        icon="streamline-plump-color:fill-and-sign"
        target="/voice"
      />
      <FooterButton
        icon="streamline-plump-color:chat-bubble-oval-smiley-1"
        target="/threads"
      />
      <FooterButton
        icon="streamline-plump-color:user-single-neutral-male"
        target="/setting"
      />
    </footer>
    <div
      class="h-96 w-full blur-xl bg-primary/20 fixed left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 -z-10 rounded-full"
    />
  </UContainer>
</template>
