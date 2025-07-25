import z from "zod";
import { knowledgeManager } from "~~/server/service/knowledgeManager";

const bodySchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
  type: z.enum(["text", "file"]).optional().default("text"),
});

/**
 * 为角色添加知识/记忆
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const roleId = event.context.params!.id;
  const body = await readValidatedBody(event, bodySchema.parse);
  
  try {
    const knowledge = await knowledgeManager.instance.addKnowledge(
      roleId,
      body.content,
      body.type
    );
    
    return {
      success: true,
      knowledge,
    };
  } catch (error) {
    console.error("Failed to add knowledge:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to add knowledge",
    });
  }
});
