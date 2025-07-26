import { voiceManager } from "~~/server/service/voiceManager";

/**
 * 获取用户语音文件的详细信息
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  const voiceIds = await voiceManager.instance.getUserVoices(user.id);

  if (!voiceIds || voiceIds.length === 0) {
    return [];
  }

  const voiceDetails: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  } | null> = [];

  for (const voiceId of voiceIds) {
    const voiceData = await voiceManager.instance.voices.get(voiceId);
    if (!voiceData) {
      voiceDetails.push(null);
      continue;
    }

    voiceDetails.push({
      id: voiceId,
      name: voiceData.name,
      size: voiceData.size,
      type: voiceData.type,
      url: `/api/voice/${voiceId}`,
    });
  }

  return voiceDetails.filter((voice) => voice !== null);
});
