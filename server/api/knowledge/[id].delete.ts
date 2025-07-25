import { knowledgeManager } from "~~/server/service/knowledgeManager";

/**
 * 删除知识条目
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const knowledgeId = event.context.params!.id;
  
  try {
    const success = await knowledgeManager.instance.deleteKnowledge(knowledgeId);
    
    if (!success) {
      throw createError({
        statusCode: 404,
        message: "Knowledge not found",
      });
    }
    
    return {
      success: true,
      message: "Knowledge deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete knowledge:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to delete knowledge",
    });
  }
});
