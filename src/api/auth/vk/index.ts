import { FastifyInstance, FastifyRequest } from "fastify";
import oauthPlugin from "@fastify/oauth2";
import pluginSettings, { authProviderKey, VK_AUTH_CALLBACK_URI } from "./plugin.settings";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { findUserByEmail, findUserWithAuthProvider, getUpdatedUserWithNewAuthProvider } from "../index";

const prisma = new PrismaClient();

type VkData = {
  id: number,
  nickname: string,
  photo_200: string,
  first_name: string,
  last_name: string,
  can_access_closed: boolean,
  is_closed: boolean
}

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
    const vkToken = await getVkToken(request);
    const user = await getUser(vkToken);
    setSession(request, user, vkToken);
    reply.redirect(process.env.FRONTEND_URL!);
  });
}

async function getUser({ access_token, user_id: vkId, email }: VkToken) {
  const vkLinkedUser = await findVkLinkedUser(vkId);
  if (vkLinkedUser) return vkLinkedUser;
  const additionalVkUserInfo = await getAdditionalVkUserInfo({ access_token, vkId });
  if (!email) {
    return createNewVkLinkedUser({ ...additionalVkUserInfo });
  }
  const user = await findUserByEmail(email);
  if (!user) {
    return createNewVkLinkedUser({ email, ...additionalVkUserInfo });
  }
  return user.AuthInfo?.vkId
    ? user
    : await getUpdatedUserWithVkAuth({ userId: user.id, vkId });
}

function getAdditionalVkUserInfo({ access_token, vkId }: { access_token: string, vkId: number }) {
  return fetch(`https://api.vk.com/method/users.get?${new URLSearchParams({
    user_ids: String(vkId),
    fields: "photo_200, nickname",
    v: String(process.env.VK_API_VERSION),
  })}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }).then((res) => res.json());
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
  return findUserWithAuthProvider({
    authProviderIdValue: vkId,
    authProviderKey,
  });
}

function getUpdatedUserWithVkAuth({ userId, vkId }: { userId: string, vkId: number }) {
  return getUpdatedUserWithNewAuthProvider({
    userId,
    authProviderIdValue: vkId,
    authProviderKey,
  });
}

function getVkToken(request: FastifyRequest) {
  return fetch(`https://oauth.vk.com/access_token?${new URLSearchParams({
    client_id: String(process.env.VK_CLIENT_ID)!,
    client_secret: process.env.VK_CLIENT_SECRET!,
    redirect_uri: "http://localhost:3000/login/vk/callback",
    code: (request.query as { code: string }).code,
  })}`)
    .then((res) => res.json())
    .then(json => vkTokenSchema.parse(json));
}

function setSession(request: FastifyRequest, user: any, { access_token }: VkToken) {
  request.session.set("auth", { userId: user.id, provider: "vk", access_token });
  request.session.set("userProfile", user.UserProfile);
}