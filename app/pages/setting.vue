<script setup lang="ts">
const { user, logout, isAuthenticated } = useAuth();
const router = useRouter();
// Redirect to login if not authenticated
watch(
  isAuthenticated,
  (authenticated) => {
    if (!authenticated) {
      router.replace("/login");
    }
  },
  { immediate: true }
);

const handleLogout = async () => {
  const success = await logout();
  if (success) {
    await router.push("/login");
  }
};

const menuItems = [
  {
    icon: "material-symbols:person",
    label: "个人信息",
    action: () => {
      // TODO: Navigate to profile edit
    },
  },
  {
    icon: "material-symbols:mic",
    label: "语音管理",
    action: () => {
      router.push("/voice");
    },
  },

  {
    icon: "material-symbols:settings",
    label: "设置",
    action: () => {
      // TODO: Navigate to settings
    },
  },
  {
    icon: "material-symbols:help",
    label: "帮助与反馈",
    action: () => {
      // TODO: Navigate to help
    },
  },
  {
    icon: "material-symbols:logout",
    label: "退出登录",
    action: handleLogout,
    danger: true,
  },
];
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- User profile header -->
    <div class="p-6 bg-white shadow-sm">
      <div class="flex items-center space-x-4">
        <UAvatar size="3xl" />
        <div class="flex-1">
          <h1 class="text-2xl font-bold">{{ user?.name || "用户" }}</h1>
          <p class="text-gray-600">ID: {{ user?.id || "未知" }}</p>
        </div>
      </div>
    </div>

    <!-- Menu items -->
    <div class="flex-1 overflow-auto">
      <div class="p-4 space-y-2">
        <div
          v-for="item in menuItems"
          :key="item.label"
          class="flex items-center p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          :class="{ 'text-red-600': item.danger }"
          @click="item.action"
        >
          <Icon :name="item.icon" class="text-2xl mr-4" />
          <span class="flex-1 font-medium">{{ item.label }}</span>
          <Icon
            name="material-symbols:chevron-right"
            class="text-xl text-gray-400"
          />
        </div>
      </div>
    </div>

    <!-- App info -->
    <div class="p-4 text-center text-sm text-gray-500 border-t">
      <p>我们的回响 v1.0.0</p>
      <p>让珍贵的声音永远回响</p>
    </div>
  </div>
</template>
