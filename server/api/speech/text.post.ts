// import { Client } from "@gradio/client";
// import { voiceManager } from "~~/server/service/voiceManager";

// /**
//  * @deprecated
//  */
// export default defineEventHandler(async (event) => {
//   const data = await readBody(event);
//   const user = await requireUserSession(event);
//   const audio = voiceManager.instance.getVoice(user.id);
//   if (!audio) {
//     throw createError({
//       statusCode: 400,
//       statusMessage: "No audio found",
//     });
//   }
//   const client = await Client.connect("IndexTeam/IndexTTS");
//   const result = await client.predict("/gen_single", {
//     prompt: audio,
//     text: data.text,
//   });
//   return (result.data as { value: { url: string } }[])[0].value.url;
// });
