import { FastifyInstance } from "fastify";
import oauthPlugin from "@fastify/oauth2";
import pluginSettings, { VK_AUTH_CALLBACK_URI } from "./plugin.settings";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { findUserByEmail, findUserWithAuthProvider, getUpdatedUserWithNewAuthProvider } from "../index";

const prisma = new PrismaClient();

const vkTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  user_id: z.number(),
  email: z.string().nullish(),
});
type VkToken = z.infer<typeof vkTokenSchema>

export default async function vkAuth(fastify: FastifyInstance) {
  fastify.register(oauthPlugin, pluginSettings);
  fastify.get(VK_AUTH_CALLBACK_URI, async function(request, reply) {
    if ((request.query as { error?: string })?.error) {
      return reply.send((request.query as { error?: string }).error);
    }
    const vkTokenResponse = await fetch(`https://oauth.vk.com/access_token?${new URLSearchParams({
      client_id: String(process.env.VK_CLIENT_ID)!,
      client_secret: process.env.VK_CLIENT_SECRET!,
      redirect_uri: "http://localhost:3000/login/vk/callback",
      code: (request.query as { code: string }).code,
    })}`);
    const vkTokenData = vkTokenSchema.parse(await vkTokenResponse.json());
    const user = await getUser(vkTokenData);
    console.log(user);
    reply.redirect(process.env.FRONTEND_URL!);
  });
}

async function getUser({ access_token, user_id: vkId, email }: VkToken) {
  const vkLinkedUserInfo = await findUserAuthInfoWithAuthProvider({
    authProviderIdValue: vkId,
    authProviderKey: "vkId",
  });
  if (vkLinkedUserInfo?.User) {
    return vkLinkedUserInfo.User;
  }
  const additionalVkInfo = await getAdditionalVkUserInfo({ access_token, vkId });
  if (!email) {
    return createNewVkLinkedUser({ ...additionalVkUserInfo });
  }
  const user = await findUserByEmail(email);
  if (!user) {
    return createNewVkLinkedUser({ email, ...additionalVkUserInfo });
  }
  return user.AuthInfo?.vkId
    ? user
    : await getUpdatedUserWithNewAuthProvider({ userId: user.id, authProviderKey: "vkId", authProviderIdValue: vkId });
}

async function getAdditionalVkUserInfo({ access_token, vkId }: { access_token: string, vkId: number }) {
  const res = await fetch(`https://api.vk.com/method/users.get?${new URLSearchParams({
    user_ids: String(vkId),
    fields: "photo_200, nickname",
    v: String(process.env.VK_API_VERSION),
  })}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const json: {
    id: number,
    nickname: string,
    photo_200: string,
    first_name: string,
    last_name: string,
    can_access_closed: boolean,
    is_closed: boolean
  } = await res.json();
  console.log(json);
  return json;
}

async function createNewVkLinkedUser({ email = null, nickname, id, photo_200 }: {
  email?: string | null,
} & VkData) {
  return prisma.user.create({
    data: {
      email,
      UserProfile: {
        create: {
          photoUrl: photo_200,
          nickname,
        },
      },
      AuthInfo: {
        create: {
          vkId: id,
        },
      },
    },
    include: {
      AuthInfo: true,
      UserProfile: true,
    },
  });
}

function findVkLinkedUser(vkId: number) {
  return prisma.userAuthInfo.findFirst({
    where: { vkId },
    include: {
      User: {
        include: {
          UserProfile: true,
        },
      },
    },
  });
}
