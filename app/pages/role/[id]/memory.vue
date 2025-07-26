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
  <div class="min-h-screen w-full flex flex-col max-w-md mx-auto">
    <!-- 角色信息展示 -->
    <div v-if="role" class="px-4 py-6">
      <div class="flex items-center space-x-4 mb-4">
        <!-- 角色头像 -->
        <div class="w-16 h-16 rounded-full overflow-hide flex-shrink-0">
          <img
            v-if="role.avatar"
            :src="role.avatar"
            :alt="role.name"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            <Icon name="material-symbols:person" class="text-2xl" />
          </div>
        </div>

        <!-- 角色信息 -->
        <div class="flex-1">
          <h2 class="text-xl font-semibold text-gray-800">{{ role.name }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ role.description }}</p>
        </div>

        <!-- 记忆数量 -->
        <div class="text-center">
          <div class="text-2xl font-bold text-primary">
            {{ knowledge.length }}
          </div>
          <div class="text-xs text-gray-500">段记忆</div>
        </div>
      </div>
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

    <!-- 记忆卡片列表 -->
    <div v-else class="px-4 pb-6">
      <div class="grid gap-4">
        <div
          v-for="(item, index) in knowledge"
          :key="item.id"
          class="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
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
            <!-- 卡片头部 -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <Icon
                    :name="
                      item.type === 'file'
                        ? 'material-symbols:description'
                        : 'material-symbols:chat'
                    "
                    class="text-primary text-sm"
                  />
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-800">
                    记忆 #{{ index + 1 }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatDate(item.createdAt) }}
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex space-x-1">
                <UButton
                  icon="material-symbols:edit"
                  variant="ghost"
                  size="xs"
                  class="opacity-60 hover:opacity-100"
                  @click="startEdit(item)"
                />
                <UButton
                  icon="material-symbols:delete"
                  variant="ghost"
                  color="error"
                  size="xs"
                  class="opacity-60 hover:opacity-100"
                  @click="handleDelete(item.id)"
                />
              </div>
            </div>

            <!-- 记忆内容 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <p
                class="text-gray-800 leading-relaxed whitespace-pre-wrap break-words text-sm"
              >
                {{ item.content }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
