import { z } from "zod";

const _bodySchema = z.object({
  id: z.string(),
  password: z.string(),
});

/**
 * 用户登录
 */
export default defineEventHandler(async (event) => {
  // const body = await readValidatedBody(event, bodySchema.parse);
  // const user = await userManager.instance.getUser(body.id);
  // if (!user) {
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: "User not found",
  //   });
  // }
  // console.log(user, body);
  // if (user.password !== body.password) {
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: "Incorrect username or password",
  //   });
  // }
  // await setUserSession(event, {
  //   user: {
  //     id: user.id,
  //     name: user.name,
  //   },
  // });

  // demo
  const user = {
    id: "admin",
    name: "admin",
  };
  await setUserSession(event, {
    user,
  });
  return {
    message: "Login success",
    user: {
      id: user.id,
      name: user.name,
    },
  };
});
