import OpenAI from "openai";

/**
 * 测试 DeepSeek API 连接
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  if (!config.deepseekApiKey) {
    throw createError({
      statusCode: 500,
      message: "DEEPSEEK_API_KEY not configured",
    });
  }

  try {
    const deepseek = new OpenAI({
      apiKey: config.deepseekApiKey,
      baseURL: "https://api.deepseek.com",
    });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个友好的AI助手。",
        },
        {
          role: "user",
          content: "请简单介绍一下你自己。",
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content || "No response";

    return {
      success: true,
      message: "DeepSeek API connection successful",
      response: response,
      model: completion.model,
      usage: completion.usage,
    };
  } catch (error) {
    console.error("DeepSeek API test failed:", error);
    
    throw createError({
      statusCode: 500,
      message: `DeepSeek API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
