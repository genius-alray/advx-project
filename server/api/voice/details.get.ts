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
  
  // 获取每个语音的详细信息
  const voiceDetails = await Promise.all(
    voiceIds.map(async (voiceId, index) => {
      const voiceData = await voiceManager.instance.voices.get(voiceId);
      if (!voiceData) {
        return null;
      }
      
      return {
        id: voiceId,
        name: `语音文件 #${index + 1}`,
        size: voiceData.size,
        type: voiceData.type,
        url: `/api/voice/${voiceId}`
      };
    })
  );
  
  return voiceDetails.filter(voice => voice !== null);
});
