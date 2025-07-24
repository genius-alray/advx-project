<script setup lang="ts">
const file = ref(null);
async function submit() {
  const formData = new FormData();
  formData.append("file", file.value!);
  const res = await $fetch("/api/speech/upload", {
    method: "post",
    body: formData,
  });
  console.log(res);
}
</script>

<template>
  <UContainer>
    <UFileUpload v-model="file" required name="file" />
    <UButton @click="submit">Submit</UButton>
  </UContainer>
</template>
