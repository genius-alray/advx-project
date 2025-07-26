import z from "zod";
import { knowledgeManager } from "~~/server/service/knowledgeManager";

const bodySchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
  name: z.string().optional(),
});

/**
 * 更新知识条目
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const knowledgeId = event.context.params!.id;
  const body = await readValidatedBody(event, bodySchema.parse);

  try {
    const knowledge = await knowledgeManager.instance.updateKnowledge(
      knowledgeId,
      body.content,
      body.name
    );

    if (!knowledge) {
      throw createError({
        statusCode: 404,
        message: "Knowledge not found",
      });
    }

    return {
      success: true,
      knowledge,
    };
  } catch (error) {
    console.error("Failed to update knowledge:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to update knowledge",
    });
  }
});
