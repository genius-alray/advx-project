<script setup lang="ts">
definePageMeta({ layout: false });

const { login, pending, error, isAuthenticated } = useAuth();

const form = reactive({
  id: "",
  password: "",
});
const router = useRouter();
const handleLogin = async () => {
  if (!form.id || !form.password) {
    return;
  }

  const success = await login(form);
  if (success) {
    await router.push("/");
  }
};

watch(
  isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      router.push("/");
    }
  },
  { immediate: true }
);
</script>

<template>
  <UContainer
    class="max-w-md bg-primary-50 p-0 h-dvh w-screen flex justify-center overflow-hidden">
    <div class="flex flex-col justify-center w-3xs space-y-4">
      <NuxtImg src="/loginHero.svg" class="mb-8" />
      <form class="space-y-4" @submit.prevent="handleLogin">
        <UInput
          v-model="form.id"
          placeholder="用户ID"
          size="xl"
          required
          :disabled="pending" />

        <UInput
          v-model="form.password"
          type="password"
          placeholder="密码"
          size="xl"
          required
          :disabled="pending" />

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
          class="mb-4" />

        <UButton
          type="submit"
          block
          size="xl"
          class="p-4 text-xl"
          :loading="pending"
          :disabled="!form.id || !form.password">
          登录
        </UButton>
      </form>

      <div class="text-center">
        <NuxtLink to="/register" class="text-primary underline">
          还没有账号？立即注册
        </NuxtLink>
      </div>
    </div>
  </UContainer>
</template>
