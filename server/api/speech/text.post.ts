import { Client } from "@gradio/client";
import * as voiceManager from "~~/server/service/voiceManager";

export default defineEventHandler(async (ev) => {
  const data = await readBody(ev);
  const audio = voiceManager.getAudioBlob();
  if (!audio) {
    throw createError({
      statusCode: 400,
      statusMessage: "No audio found",
    });
  }
  const client = await Client.connect("IndexTeam/IndexTTS");
  const result = await client.predict("/gen_single", {
    prompt: audio,
    text: data.text,
  });
  return (result.data as { value: { url: string } }[])[0].value.url;
});
