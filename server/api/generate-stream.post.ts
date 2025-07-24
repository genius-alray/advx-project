import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
interface ChatRequestBody {
  prompt: string;
}
const knowledgeStorage = useStorage("memory");
export default defineEventHandler(async (ev) => {
  const data = (await readBody(ev)) as ChatRequestBody;

  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: data.prompt,
    config: {
      systemInstruction:
        "你的任务是模仿一个人类进行回答，下面是你要模仿的人曾经说过的话，你的回复应当模仿这样的风格。\n---\n\n" +
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
