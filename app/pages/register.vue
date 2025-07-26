<script setup lang="ts">
definePageMeta({ layout: false });

const { register, pending, error, isAuthenticated } = useAuth();

const form = reactive({
  id: "",
  name: "",
  password: "",
  confirmPassword: "",
});

const formError = ref<string | null>(null);
const router = useRouter();
const handleRegister = async () => {
  formError.value = null;

  if (!form.id || !form.name || !form.password || !form.confirmPassword) {
    formError.value = "请填写所有字段";
    return;
  }

  if (form.password !== form.confirmPassword) {
    formError.value = "密码确认不匹配";
    return;
  }

  if (form.password.length < 6) {
    formError.value = "密码至少需要6位";
    return;
  }

  const success = await register({
    id: form.id,
    name: form.name,
    password: form.password,
  });

  if (success) {
    await router.push("/login");
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
    class="max-w-md bg-primary-50 p-0 h-screen w-screen flex justify-center overflow-hidden">
    <div class="flex flex-col justify-center w-3xs space-y-4">
      <NuxtImg src="/loginHero.svg" class="mb-8" />

      <form class="space-y-4" @submit.prevent="handleRegister">
        <UInput
          v-model="form.id"
          placeholder="用户ID"
          size="xl"
          required
          :disabled="pending" />

        <UInput
          v-model="form.name"
          placeholder="用户名"
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

        <UInput
          v-model="form.confirmPassword"
          type="password"
          placeholder="确认密码"
          size="xl"
          required
          :disabled="pending" />

        <UAlert
          v-if="error || formError"
          color="error"
          variant="soft"
          :title="error || formError"
          class="mb-4" />

        <UButton
          type="submit"
          block
          size="xl"
          class="p-4 text-xl"
          :loading="pending"
          :disabled="
            !form.id || !form.name || !form.password || !form.confirmPassword
          ">
          注册
        </UButton>
      </form>

      <div class="text-center">
        <NuxtLink to="/login" class="text-primary underline">
          已有账号？立即登录
        </NuxtLink>
      </div>
    </div>
  </UContainer>
</template>
