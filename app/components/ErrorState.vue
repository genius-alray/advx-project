<script setup lang="ts">
interface Props {
  message?: string;
  showRetry?: boolean;
  retryText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: '发生了错误',
  showRetry: true,
  retryText: '重试'
});

const emit = defineEmits<{
  retry: []
}>();

const handleRetry = () => {
  emit('retry');
};
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="flex flex-col items-center space-y-4 text-primary">
      <Icon name="material-symbols:error" class="text-8xl" />
      <span>{{ message }}</span>
      <UButton 
        v-if="showRetry"
        @click="handleRetry" 
        variant="outline">
        {{ retryText }}
      </UButton>
    </div>
  </div>
</template>
