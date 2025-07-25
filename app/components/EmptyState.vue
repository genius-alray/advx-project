<script setup lang="ts">
interface Props {
  icon?: string;
  title?: string;
  description?: string;
  actionText?: string;
  showAction?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'material-symbols:inbox',
  title: '暂无数据',
  description: '',
  actionText: '添加',
  showAction: false
});

const emit = defineEmits<{
  action: []
}>();

const handleAction = () => {
  emit('action');
};
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="flex flex-col items-center space-y-4 text-primary">
      <Icon :name="icon" class="text-8xl" />
      <span class="text-lg font-medium">{{ title }}</span>
      <span v-if="description" class="text-sm text-black/50">{{ description }}</span>
      <UButton 
        v-if="showAction"
        @click="handleAction" 
        variant="outline">
        {{ actionText }}
      </UButton>
    </div>
  </div>
</template>
