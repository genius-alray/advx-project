import type { Role } from "~/shared/types/role";
import type { Thread } from "~/shared/types/thread";
import type { Message } from "~/shared/types/message";

/**
 * API composable for role management
 */
export const useRoles = () => {
  const pending = ref(false);
  const error = ref<string | null>(null);

  const fetchRoles = async (): Promise<Role[]> => {
    try {
      pending.value = true;
      error.value = null;
      const roles = await $fetch<Role[]>("/api/role/all");
      return roles || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch roles";
      return [];
    } finally {
      pending.value = false;
    }
  };

  const createRole = async (roleData: {
    name: string;
    description?: string;
    avatar?: string;
    background?: string;
    voiceId?: string;
  }): Promise<{ id: string } | null> => {
    try {
      pending.value = true;
      error.value = null;
      const result = await $fetch<{ id: string }>("/api/role/create", {
        method: "POST",
        body: roleData,
      });
      return result;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create role";
      return null;
    } finally {
      pending.value = false;
    }
  };

  const deleteRole = async (roleId: string): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;
      await $fetch(`/api/role/${roleId}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete role";
      return false;
    } finally {
      pending.value = false;
    }
  };

  return {
    pending: readonly(pending),
    error: readonly(error),
    fetchRoles,
    createRole,
    deleteRole,
  };
};

/**
 * API composable for thread management
 */
export const useThreads = () => {
  const pending = ref(false);
  const error = ref<string | null>(null);

  const fetchThreads = async (): Promise<Thread[]> => {
    try {
      pending.value = true;
      error.value = null;
      const threads = await $fetch<Thread[]>("/api/thread/all");
      return threads || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch threads";
      return [];
    } finally {
      pending.value = false;
    }
  };

  const createThread = async (
    roleId: string
  ): Promise<{ id: string } | null> => {
    try {
      pending.value = true;
      error.value = null;
      const result = await $fetch<{ id: string }>("/api/thread/create", {
        method: "POST",
        body: { roleId },
      });
      return result;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create thread";
      return null;
    } finally {
      pending.value = false;
    }
  };

  const fetchThread = async (threadId: string): Promise<Thread | null> => {
    try {
      pending.value = true;
      error.value = null;
      const thread = await $fetch<Thread>(`/api/thread/${threadId}/content`);
      return thread;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch thread";
      return null;
    } finally {
      pending.value = false;
    }
  };

  const deleteThread = async (threadId: string): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;
      await $fetch(`/api/thread/${threadId}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete thread";
      return false;
    } finally {
      pending.value = false;
    }
  };

  const sendMessage = async (
    threadId: string,
    message: string
  ): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;
      await $fetch(`/api/thread/${threadId}/text`, {
        method: "POST",
        body: { message },
      });
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to send message";
      return false;
    } finally {
      pending.value = false;
    }
  };

  const getAIReply = async (
    threadId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      pending.value = true;
      error.value = null;
      const response = await $fetch<{ success: boolean; message: string }>(
        `/api/thread/${threadId}/reply`
      );
      return response;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to get AI reply";
      return { success: false };
    } finally {
      pending.value = false;
    }
  };

  return {
    pending: readonly(pending),
    error: readonly(error),
    fetchThreads,
    createThread,
    fetchThread,
    deleteThread,
    sendMessage,
    getAIReply,
  };
};

/**
 * API composable for voice management
 */
export const useVoices = () => {
  const pending = ref(false);
  const error = ref<string | null>(null);

  const uploadVoice = async (file: File): Promise<{ id: string } | null> => {
    try {
      pending.value = true;
      error.value = null;
      const formData = new FormData();
      formData.append("file", file);
      const result = await $fetch<{ id: string }>("/api/voice/upload", {
        method: "POST",
        body: formData,
      });
      return result;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to upload voice";
      return null;
    } finally {
      pending.value = false;
    }
  };

  const fetchUserVoices = async (): Promise<Blob[]> => {
    try {
      pending.value = true;
      error.value = null;
      const voices = await $fetch<Blob[]>("/api/voice/all");
      return voices || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch voices";
      return [];
    } finally {
      pending.value = false;
    }
  };

  return {
    pending: readonly(pending),
    error: readonly(error),
    uploadVoice,
    fetchUserVoices,
  };
};

/**
 * API composable for role-specific knowledge management
 */
export const useRoleKnowledge = () => {
  const pending = ref(false);
  const error = ref<string | null>(null);

  const addKnowledge = async (
    roleId: string,
    content: string,
    type: "text" | "file" = "text"
  ): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;
      await $fetch(`/api/role/${roleId}/knowledge`, {
        method: "POST",
        body: { content, type },
      });
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to add knowledge";
      return false;
    } finally {
      pending.value = false;
    }
  };

  const addBatchKnowledge = async (
    roleId: string,
    contents: string[],
    type: "text" | "file" = "text"
  ): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;
      await $fetch(`/api/role/${roleId}/knowledge/batch`, {
        method: "POST",
        body: { contents, type },
      });
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to add batch knowledge";
      return false;
    } finally {
      pending.value = false;
    }
  };

  const fetchRoleKnowledge = async (roleId: string): Promise<any[]> => {
    try {
      pending.value = true;
      error.value = null;
      const knowledge = await $fetch<any[]>(`/api/role/${roleId}/knowledge`);
      return knowledge || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch knowledge";
      return [];
    } finally {
      pending.value = false;
    }
  };

  const updateKnowledge = async (
    knowledgeId: string,
    content: string
  ): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;
      await $fetch(`/api/knowledge/${knowledgeId}`, {
        method: "PUT",
        body: { content },
      });
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update knowledge";
      return false;
    } finally {
      pending.value = false;
    }
  };

  const deleteKnowledge = async (knowledgeId: string): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;
      await $fetch(`/api/knowledge/${knowledgeId}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete knowledge";
      return false;
    } finally {
      pending.value = false;
    }
  };

  return {
    pending: readonly(pending),
    error: readonly(error),
    addKnowledge,
    addBatchKnowledge,
    fetchRoleKnowledge,
    updateKnowledge,
    deleteKnowledge,
  };
};

/**
 * API composable for AI generation
 */
export const useAI = () => {
  const pending = ref(false);
  const error = ref<string | null>(null);

  const generateStream = async (
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;

      const response = await fetch("/api/generate-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }

      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to generate response";
      return false;
    } finally {
      pending.value = false;
    }
  };

  return {
    pending: readonly(pending),
    error: readonly(error),
    generateStream,
  };
};
