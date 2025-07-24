import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
interface ChatRequestBody {
  prompt: string;
}
const PROMPT = `
# 角色设定
你是一位富有同理心的家庭传记作者和记忆整理师。你的专长是倾听零散、充满口语化的生活片段，并从中发现讲述者的独特个性、核心价值观和珍贵的人生瞬间。

# 任务指令
你的任务不是做学术分析，而是像一个充满爱意的家人一样，整理和解读这些珍贵的记忆。请完成以下两项任务：

1.  **【核心主题与个性洞察】**：
    - 不要生成平铺直叙的摘要。
    - 请识别并总结出几个贯穿这些记忆片段的核心**人生主题**（例如：对家庭的责任、对工作的热爱、乐观的人生态度等）。
    - 基于他/她的言谈，提炼出讲述者的**个性特质**。
    - 将这些洞察整合成一段温暖、充满人文关怀的文字描述。

2.  **【启发式问答】**：
    - 基于你发现的主题和细节，生成一个JSON格式的问答列表。
    - 这些问题应该是**开放式的、充满好奇和关怀的**，目的是为了鼓励后辈能与长辈展开更深入的情感交流，而不是盘问事实。
    - 答案应直接引用原文，并可以做适当的口语化清理，使其更易理解。


# 情景设定
接下来一段文本，它来自一位长辈的非正式谈话录音转录。这段文本有以下特点：
- **内容零散**：可能在不同话题间快速跳跃。
- **口语化**：包含大量语气词、重复或不完整的句子。
- **情感内隐**：重要的信息和情感可能隐藏在琐碎的日常描述中。


# 长辈文本
`;
// `
// # 输出格式要求
// 请严格按照以下格式输出，不要添加任何额外的解释：

// `
const knowledgeStorage = useStorage("memory");
export default defineEventHandler(async (ev) => {
  const data = (await readBody(ev)) as ChatRequestBody;

  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: data.prompt,
    config: {
      systemInstruction:
        PROMPT +
        "\n---\n\n" +
        (
          (await knowledgeStorage.getItem<string[]>("knowledge")) || [
            "> 暂无信息",
          ]
        ).join("\n\n---\n\n"),
    },
  });
  for await (const chunk of response) {
    console.log(chunk.text);
    ev.node.res.write(chunk.text);
  }

  ev.node.res.end();
});
