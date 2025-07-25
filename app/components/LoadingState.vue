<script setup lang="ts">
interface Props {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  message: '加载中...',
  size: 'md'
});

const iconSizes = {
  sm: 'text-4xl',
  md: 'text-8xl', 
  lg: 'text-12xl'
};
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="flex flex-col items-center space-y-4 text-primary">
      <Icon 
        name="material-symbols:refresh" 
        :class="[iconSizes[size], 'animate-spin']" />
      <span>{{ message }}</span>
    </div>
  </div>
</template>
