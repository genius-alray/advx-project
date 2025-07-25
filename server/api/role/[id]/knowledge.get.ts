import { knowledgeManager } from "~~/server/service/knowledgeManager";

/**
 * 获取角色的所有知识/记忆
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const roleId = event.context.params!.id;
  
  try {
    const knowledge = await knowledgeManager.instance.getRoleKnowledge(roleId);
    return knowledge;
  } catch (error) {
    console.error("Failed to get role knowledge:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to get role knowledge",
    });
  }
});
