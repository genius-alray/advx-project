<script setup lang="ts">
import type { Role } from "~~/shared/types/role";
import type { Knowledge } from "~~/server/service/knowledgeManager";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const roleId = route.params.id as string;

// 简单的响应式状态
const role = ref<Role | null>(null);
const knowledge = ref<Knowledge[]>([]);
const newMemory = ref("");
const isLoading = ref(true);
const isAdding = ref(false);
const isUploading = ref(false);
const uploadError = ref<string | null>(null);
const editingKnowledge = ref<Knowledge | null>(null);
const editContent = ref("");
const error = ref<string | null>(null);
const isSaving = ref(false);

// 直接获取角色数据
const loadRole = async () => {
  try {
    const roles = await $fetch<Role[]>("/api/role/all");
    role.value = roles.find((r: Role) => r.id === roleId) || null;
    if (!role.value) {
      throw new Error("Role not found");
    }
  } catch (err) {
    console.error("Failed to load role:", err);
    await navigateTo("/");
  }
};

// 直接获取记忆数据
const loadKnowledge = async () => {
  if (!roleId) return;

  isLoading.value = true;
  try {
    knowledge.value = await $fetch<Knowledge[]>(
      `/api/role/${roleId}/knowledge`
    );
  } catch (err) {
    console.error("Failed to load knowledge:", err);
    error.value = "加载记忆失败";
  } finally {
    isLoading.value = false;
  }
};

// 直接添加记忆
const handleAddMemory = async () => {
  if (!newMemory.value.trim() || isAdding.value) return;

  const memoryText = newMemory.value.trim();
  newMemory.value = "";
  isAdding.value = true;

  try {
    await $fetch(`/api/role/${roleId}/knowledge`, {
      method: "POST",
      body: {
        content: memoryText,
        type: "text",
      },
    });

    await loadKnowledge(); // 重新加载数据
  } catch (err) {
    console.error("Failed to add memory:", err);
    alert(
      `添加记忆时发生错误: ${err instanceof Error ? err.message : "未知错误"}`
    );
    newMemory.value = memoryText; // 恢复输入内容
  } finally {
    isAdding.value = false;
  }
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Reset the input
  target.value = "";

  // Clear previous upload error
  uploadError.value = null;
  isUploading.value = true;

  try {
    // Validate file type
    const allowedTypes = ["text/plain", "text/markdown", "application/json"];
    const allowedExtensions = [".txt", ".md", ".json"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      throw new Error("不支持的文件类型。请上传 .txt、.md 或 .json 文件");
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("文件大小不能超过 5MB");
    }

    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      throw new Error("文件内容为空，请检查文件是否包含有效内容");
    }

    await $fetch(`/api/role/${roleId}/knowledge/batch`, {
      method: "POST",
      body: {
        contents: lines,
        type: "file",
      },
    });

    await loadKnowledge(); // 重新加载数据
    uploadError.value = null;
  } catch (err) {
    console.error("Failed to upload file:", err);
    uploadError.value =
      err instanceof Error ? err.message : "文件上传失败，请稍后重试";
  } finally {
    isUploading.value = false;
  }
};

const startEdit = (item: Knowledge) => {
  editingKnowledge.value = item;
  editContent.value = item.content;
};

const cancelEdit = () => {
  editingKnowledge.value = null;
  editContent.value = "";
};

// 直接保存编辑
const saveEdit = async () => {
  if (!editingKnowledge.value || !editContent.value.trim() || isSaving.value)
    return;

  isSaving.value = true;
  try {
    await $fetch(`/api/knowledge/${editingKnowledge.value.id}`, {
      method: "PUT",
      body: {
        content: editContent.value.trim(),
      },
    });

    await loadKnowledge(); // 重新加载数据
    cancelEdit();
  } catch (err) {
    console.error("Failed to update knowledge:", err);
    alert("更新记忆失败，请重试");
  } finally {
    isSaving.value = false;
  }
};

// 直接删除记忆
const handleDelete = async (knowledgeId: string) => {
  if (!confirm("确定要删除这条记忆吗？")) return;

  try {
    await $fetch(`/api/knowledge/${knowledgeId}`, {
      method: "DELETE",
    });

    await loadKnowledge(); // 重新加载数据
  } catch (err) {
    console.error("Failed to delete knowledge:", err);
    alert("删除记忆失败，请重试");
  }
};

const goBack = () => {
  navigateTo("/");
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 文件输入引用
const fileInputRef = ref<HTMLInputElement | null>(null);

// 触发文件选择
const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

// 页面初始化 - 每次进入页面都重新加载所有数据
onMounted(async () => {
  await loadRole();
  await loadKnowledge();
});
</script>

<template>
  <div
    class="min-h-screen w-full bg-primary-50/50 flex flex-col max-w-md mx-auto"
  >
    <!-- Header -->
    <header class="flex items-center p-4 bg-white shadow-sm min-h-0">
      <UButton
        icon="material-symbols:arrow-back"
        variant="ghost"
        size="sm"
        class="flex-shrink-0"
        @click="goBack"
      />

      <div v-if="role" class="flex items-center ml-4 flex-1 min-w-0">
        <UAvatar
          :src="role.avatar || undefined"
          size="md"
          class="flex-shrink-0"
        />
        <div class="ml-3 min-w-0 flex-1">
          <h1 class="text-lg font-bold truncate">{{ role.name }} 的记忆</h1>
          <p class="text-sm text-gray-500 truncate">管理角色的记忆和故事</p>
        </div>
      </div>
    </header>

    <!-- Add memory form -->
    <div class="p-4 bg-white shadow-sm flex-shrink-0">
      <form class="space-y-4" @submit.prevent="handleAddMemory">
        <UTextarea
          v-model="newMemory"
          placeholder="输入一段关于这个角色的记忆、故事或对话..."
          :rows="3"
          class="w-full resize-none"
          :disabled="isAdding"
        />

        <div class="flex flex-wrap gap-2">
          <UButton
            type="submit"
            icon="material-symbols:add"
            :loading="isAdding"
            :disabled="!newMemory.trim()"
            class="flex-shrink-0"
          >
            添加记忆
          </UButton>

          <UButton
            type="button"
            icon="material-symbols:upload-file"
            variant="outline"
            :loading="isUploading"
            :disabled="isAdding || isUploading"
            class="flex-shrink-0"
            @click="triggerFileUpload"
          >
            {{ isUploading ? "上传中..." : "上传文件" }}
          </UButton>

          <input
            ref="fileInputRef"
            type="file"
            accept=".txt,.md,.json"
            class="hidden"
            @change="handleFileUpload"
          />
        </div>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
          class="mb-4"
        />

        <UAlert
          v-if="uploadError"
          color="error"
          variant="soft"
          :title="uploadError"
          class="mb-4"
          @close="uploadError = null"
        />
      </form>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="py-16 flex items-center justify-center">
      <LoadingState message="加载记忆中..." />
    </div>

    <!-- Error state -->
    <div
      v-else-if="error && knowledge.length === 0"
      class="py-16 flex items-center justify-center"
    >
      <ErrorState :message="error" @retry="loadKnowledge" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="knowledge.length === 0"
      class="py-16 flex items-center justify-center"
    >
      <EmptyState
        icon="material-symbols:auto-stories"
        title="还没有添加任何记忆"
        description="在上方输入框中添加关于这个角色的第一段记忆吧"
      />
    </div>

    <!-- Knowledge list -->
    <div v-else class="pb-6">
      <div class="px-4 pt-6 space-y-4">
        <div class="text-sm text-gray-600 px-2">
          已保存 {{ knowledge.length }} 段记忆
        </div>

        <div
          v-for="(item, index) in knowledge"
          :key="item.id"
          class="bg-white rounded-xl p-5 shadow-sm overflow-hidden"
        >
          <!-- Edit mode -->
          <div v-if="editingKnowledge?.id === item.id" class="space-y-3">
            <UTextarea
              v-model="editContent"
              :rows="4"
              class="w-full resize-none"
            />
            <div class="flex flex-wrap gap-2">
              <UButton
                size="xs"
                :loading="isSaving"
                class="flex-shrink-0"
                @click="saveEdit"
              >
                保存
              </UButton>
              <UButton
                size="xs"
                variant="outline"
                class="flex-shrink-0"
                @click="cancelEdit"
              >
                取消
              </UButton>
            </div>
          </div>

          <!-- View mode -->
          <div v-else>
            <div class="flex items-start justify-between mb-3 min-w-0">
              <div class="flex items-center space-x-2 min-w-0 flex-1">
                <Icon
                  :name="
                    item.type === 'file'
                      ? 'material-symbols:description'
                      : 'material-symbols:chat'
                  "
                  class="text-primary flex-shrink-0 text-lg"
                />
                <span class="text-sm text-gray-500 truncate">
                  记忆 #{{ index + 1 }} · {{ formatDate(item.createdAt) }}
                </span>
              </div>
              <div class="flex space-x-1 flex-shrink-0 ml-2">
                <UButton
                  icon="material-symbols:edit"
                  variant="ghost"
                  size="xs"
                  @click="startEdit(item)"
                />
                <UButton
                  icon="material-symbols:delete"
                  variant="ghost"
                  color="error"
                  size="xs"
                  @click="handleDelete(item.id)"
                />
              </div>
            </div>
            <p
              class="text-gray-800 leading-relaxed whitespace-pre-wrap break-words"
            >
              {{ item.content }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
