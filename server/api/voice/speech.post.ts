import { Client } from "@gradio/client";
import z from "zod";

import { voiceManager } from "~~/server/service/voiceManager";

const bodySchema = z.object({
  roleId: z.string(),
  text: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse);

  const audio = await voiceManager.instance.getVoice(body.roleId);

  if (!audio) {
    throw createError({
      statusCode: 400,
      statusMessage: "No audio found",
    });
  }

  const client = await Client.connect("IndexTeam/IndexTTS");

  const result = await client.predict("/gen_single", {
    prompt: audio,
    text: body.text,
  });

  return (result.data as { value: { url: string } }[])[0].value.url;
});
