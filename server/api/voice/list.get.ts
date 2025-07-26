import { voiceManager } from "~~/server/service/voiceManager";

/**
 * 获取用户的语音ID列表
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  const voiceIds = await voiceManager.instance.getUserVoices(user.id);

  if (!voiceIds || voiceIds.length === 0) {
    return [];
  }

  // 获取每个语音的详细信息
  const voiceDetails: Array<{
    id: string;
    name: string;
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
    });
  }

  return voiceDetails;
});
