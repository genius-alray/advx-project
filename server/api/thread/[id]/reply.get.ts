import { threadManager } from "~~/server/service/threadManager";
import { roleManager } from "~~/server/service/roleManager";
import { knowledgeManager } from "~~/server/service/knowledgeManager";
import OpenAI from "openai";

// 初始化 DeepSeek API 客户端
const config = useRuntimeConfig();
const deepseek = new OpenAI({
  apiKey: config.deepseekApiKey,
  baseURL: "https://api.deepseek.com",
});

/**
 * 向 thread 添加 AI 回复
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const threadId = event.context.params!.id;

  const thread = await threadManager.instance.getThread(threadId);
  if (!thread) {
    throw createError({
      statusCode: 404,
      message: "thread not found",
    });
  }

  // 获取角色信息
  const role = await roleManager.instance.getRole(thread.roleId);
  if (!role) {
    throw createError({
      statusCode: 404,
      message: "role not found",
    });
  }

  try {
    // 获取角色的知识库内容
    const knowledge = await knowledgeManager.instance.getRoleKnowledgeText(
      role.id
    );

    // 构建对话历史
    const messages: Array<{ role: "user" | "assistant"; content: string }> =
      thread.content.map((msg) => ({
        role:
          msg.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      }));

    // 构建系统提示词，包含知识库信息
    const knowledgeContext =
      knowledge.length > 0
        ? `\n\n相关记忆和故事：\n${knowledge.join("\n\n---\n\n")}`
        : "";

    const systemPrompt = `你是 ${role.name}，${role.description}。

背景信息：${role.background || "暂无特殊背景"}${knowledgeContext}

请以这个角色的身份回复用户的消息。保持角色的个性特点，用温暖、亲切的语调与用户对话。回复要自然、有情感，就像真正的家人在交流一样。

如果用户询问相关的记忆或故事，你可以参考上面提供的记忆内容来回答，但要以第一人称的方式，就像是你自己的亲身经历一样。`;

    // 调用 DeepSeek API
    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system" as const, content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse =
      completion.choices[0]?.message?.content || "抱歉，我现在无法回复。";

    // 添加 AI 回复到对话中
    await threadManager.instance.addMessage(threadId, {
      id: genUUID4(),
      sender: "ai",
      senderId: thread.roleId,
      type: "text",
      content: aiResponse,
    });

    return {
      success: true,
      message: aiResponse,
    };
  } catch (error) {
    console.error("DeepSeek API error:", error);

    // 如果 API 调用失败，返回默认回复
    const fallbackMessage = "抱歉，我现在有些忙，稍后再聊好吗？";

    await threadManager.instance.addMessage(threadId, {
      id: genUUID4(),
      sender: "ai",
      senderId: thread.roleId,
      type: "text",
      content: fallbackMessage,
    });

    return {
      success: true,
      message: fallbackMessage,
    };
  }
});
