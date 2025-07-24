import * as voiceManager from "~~/server/service/voiceManager";

export default defineEventHandler(async (ev) => {
  try {
    const formData = await readFormData(ev);
    const file = formData.get("file") as File;
    const data = await file.arrayBuffer();
    const blob = new Blob([data], { type: file.type });
    voiceManager.save(blob);
    console.log(voiceManager.getAudioBlob());
    return {
      success: true,
    };
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to upload",
    });
  }
});
