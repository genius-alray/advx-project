<script setup lang="ts">
const emits = defineEmits(["close", "created"]);

interface Props {
  editingRole?: any;
}

const props = withDefaults(defineProps<Props>(), {
  editingRole: null,
});

const { createRole, pending, error } = useRoles();

const form = reactive({
  name: "",
  description: "",
  avatar: "",
  background: "",
  voiceId: "",
});

const formError = ref<string | null>(null);

const handleSubmit = async () => {
  formError.value = null;

  if (!form.name.trim()) {
    formError.value = "请输入角色名称";
    return;
  }

  const result = await createRole({
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    avatar: form.avatar.trim() || undefined,
    background: form.background.trim() || undefined,
    voiceId: form.voiceId.trim() || undefined,
  });

  if (result) {
    emits("created", result);
    emits("close");
    // Reset form
    Object.assign(form, {
      name: "",
      description: "",
      avatar: "",
      background: "",
      voiceId: "",
    });
  }
};

const handleCancel = () => {
  emits("close");
  // Reset form
  Object.assign(form, {
    name: "",
    description: "",
    avatar: "",
    background: "",
    voiceId: "",
  });
};
</script>

<template>
  <div class="flex flex-col justify-center items-center p-8 space-y-2">
    <Icon
      name="material-symbols:account-circle"
      class="text-8xl text-primary mb-8"
    />

    <form @submit.prevent="handleSubmit" class="w-full space-y-4">
      <UInput
        v-model="form.name"
        placeholder="名称"
        class="w-full"
        size="xl"
        required
        :disabled="pending"
      />

      <UInput
        v-model="form.description"
        placeholder="身份/描述"
        class="w-full"
        size="xl"
        :disabled="pending"
      />

      <UTextarea
        v-model="form.background"
        placeholder="背景故事"
        autoresize
        :rows="3"
        class="w-full"
        size="xl"
        :disabled="pending"
      />

      <UInput
        v-model="form.avatar"
        placeholder="头像URL (可选)"
        class="w-full"
        size="xl"
        :disabled="pending"
      />

      <UInput
        v-model="form.voiceId"
        placeholder="语音ID (可选)"
        class="w-full"
        size="xl"
        :disabled="pending"
      />

      <UAlert
        v-if="error || formError"
        color="error"
        variant="soft"
        :title="error || formError"
        class="mb-4"
      />

      <div class="w-full flex mt-8 space-x-4">
        <UButton
          type="button"
          icon="material-symbols:cancel"
          size="xl"
          variant="outline"
          @click="handleCancel"
          :disabled="pending"
        >
          取消
        </UButton>
        <span class="flex-1" />
        <UButton
          type="submit"
          icon="material-symbols:check-circle"
          size="xl"
          :loading="pending"
          :disabled="!form.name.trim()"
        >
          确认
        </UButton>
      </div>
    </form>
  </div>
</template>
