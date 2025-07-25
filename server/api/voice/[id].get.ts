import { voiceManager } from "~~/server/service/voiceManager";

/**
 * 获取语音文件
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  const voiceId = event.context.params!.id;
  
  const voice = await voiceManager.instance.getVoice(voiceId);
  
  if (!voice) {
    throw createError({
      statusCode: 404,
      statusMessage: "Voice not found",
    });
  }
  
  // 设置响应头
  setHeader(event, "Content-Type", voice.type || "audio/mpeg");
  setHeader(event, "Content-Length", voice.size.toString());
  setHeader(event, "Cache-Control", "public, max-age=31536000");
  setHeader(event, "Content-Disposition", `attachment; filename="voice-${voiceId}.${getFileExtension(voice.type)}"`);
  
  return voice;
});

function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a",
    "audio/ogg": "ogg",
  };
  return extensions[mimeType] || "audio";
}
