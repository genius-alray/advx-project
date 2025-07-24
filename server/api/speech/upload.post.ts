// import { voiceManager } from "~~/server/service/voiceManager";

// /**
//  * @deprecated
//  */
// export default defineEventHandler(async (event) => {
//   const user = await requireUserSession(event);
//   try {
//     const formData = await readFormData(event);
//     const file = formData.get("file") as File;
//     const data = await file.arrayBuffer();
//     const blob = new Blob([data], { type: file.type });
//     voiceManager.instance.addVoice(user.id, blob);
//     return {
//       success: true,
//     };
//   } catch {
//     throw createError({
//       statusCode: 500,
//       statusMessage: "Failed to upload",
//     });
//   }
// });
