<script setup lang="ts">
const roles = ref<Role[]>([
  {
    voiceId: "",
    id: "",
    belongsTo: "",
    name: "1",
    description: "desc",
    avatar:
      "https://www.figma.com/file/rsTEDse31EOCz0MD89ZpgB/image/1d39378b14e23369bd1bea0d6d6fb9b062150611",
    background: "",
  },
  {
    voiceId: "",
    id: "",
    belongsTo: "",
    name: "2",
    description: "desc",
    avatar:
      "https://www.figma.com/file/rsTEDse31EOCz0MD89ZpgB/image/1d39378b14e23369bd1bea0d6d6fb9b062150611",
    background: "",
  },
  {
    voiceId: "",
    id: "",
    belongsTo: "",
    name: "3",
    description: "desc",
    avatar:
      "https://www.figma.com/file/rsTEDse31EOCz0MD89ZpgB/image/1d39378b14e23369bd1bea0d6d6fb9b062150611",
    background: "",
  },
  {
    voiceId: "",
    id: "",
    belongsTo: "",
    name: "3",
    description: "desc",
    avatar:
      "https://www.figma.com/file/rsTEDse31EOCz0MD89ZpgB/image/1d39378b14e23369bd1bea0d6d6fb9b062150611",
    background: "",
  },
  {
    voiceId: "",
    id: "",
    belongsTo: "",
    name: "3",
    description: "desc",
    avatar:
      "https://www.figma.com/file/rsTEDse31EOCz0MD89ZpgB/image/1d39378b14e23369bd1bea0d6d6fb9b062150611",
    background: "",
  },
  {
    voiceId: "",
    id: "",
    belongsTo: "",
    name: "3",
    description: "desc",
    avatar:
      "https://www.figma.com/file/rsTEDse31EOCz0MD89ZpgB/image/1d39378b14e23369bd1bea0d6d6fb9b062150611",
    background: "",
  },
  {
    voiceId: "",
    id: "",
    belongsTo: "",
    name: "3",
    description: "desc",
    avatar:
      "https://www.figma.com/file/rsTEDse31EOCz0MD89ZpgB/image/1d39378b14e23369bd1bea0d6d6fb9b062150611",
    background: "",
  },
]);
</script>

<template>
  <div v-if="roles.length == 0" class="flex items-center justify-center h-full">
    <div class="flex flex-col items-center space-y-4 text-primary">
      <Icon name="material-symbols:question-mark-rounded" class="text-8xl" />
      <span>Empty</span>
    </div>
  </div>
  <div v-else class="p-4 space-y-4 h-full overflow-auto">
    <div
      v-for="role of roles"
      :key="role.id"
      class="flex h-24 items-center py-4 px-8 shadow-xl shadow-primary/20 rounded-xl space-x-4 bg-white">
      <UAvatar :src="role.avatar" size="3xl" />
      <div class="flex flex-1 flex-col">
        <span class="text-2xl">{{ role.name }}</span>
        <span class="text-md text-black/50">{{ role.description }}</span>
      </div>
    </div>
  </div>
</template>
