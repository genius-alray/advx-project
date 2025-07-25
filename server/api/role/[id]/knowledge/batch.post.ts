import z from "zod";
import { knowledgeManager } from "~~/server/service/knowledgeManager";

const bodySchema = z.object({
  contents: z.array(z.string()).min(1, "Contents cannot be empty"),
  type: z.enum(["text", "file"]).optional().default("text"),
});

/**
 * 批量为角色添加知识/记忆（用于文件上传）
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const roleId = event.context.params!.id;
  const body = await readValidatedBody(event, bodySchema.parse);
  
  try {
    const knowledgeList = await knowledgeManager.instance.addBatchKnowledge(
      roleId,
      body.contents,
      body.type
    );
    
    return {
      success: true,
      count: knowledgeList.length,
      knowledge: knowledgeList,
    };
  } catch (error) {
    console.error("Failed to add batch knowledge:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to add batch knowledge",
    });
  }
});
