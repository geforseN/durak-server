import { FastifyInstance } from "fastify";
import oauthPlugin, { OAuth2Token } from "@fastify/oauth2";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import pluginSettings, { GITHUB_AUTH_CALLBACK_URI } from "./plugin.settings";
import { findUserAuthInfoWithAuthProvider, findUserByEmail, getUpdatedUserWithNewAuthProvider } from "../index";

const prisma = new PrismaClient();

const githubUserSchema = z.object({
  email: z.string().email().nullable(),
  login: z.string(),
  id: z.number(),
  avatar_url: z.string(),
  url: z.string(),
  html_url: z.string(),
  name: z.string().nullish(),
});
type GithubUser = z.input<typeof githubUserSchema>;

const githubTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
  scope: z.string(),
});
type GithubToken = z.input<typeof githubTokenSchema>

const githubUserPrivateEmailsSchema = z.array(
  z.object({
    email: z.string(),
    primary: z.boolean(),
    verified: z.boolean(),
    visibility: z.string().nullable(),
  }),
);
type GithubUserPrivateEmails = z.input<typeof githubUserPrivateEmailsSchema>


export default async function(fastify: FastifyInstance) {
  fastify.register(oauthPlugin, pluginSettings);
  fastify.get(GITHUB_AUTH_CALLBACK_URI, async function(request, reply) {
    const tokenData: OAuth2Token = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
    console.log(tokenData);
    const { access_token } = tokenData.token;
    const githubUser = await getGithubUser(access_token);
    const user = await getUser(githubUser, access_token);
    request.session.set("auth", { userId: user.id, provider: "github", access_token });
    request.session.set("userProfile", user.UserProfile);
    reply.redirect(process.env.FRONTEND_URL!);
  });
}

async function getGithubUser(access_token: string): Promise<GithubUser> {
  const data = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/json",
    },
  });
  return githubUserSchema.parse(await data.json());
}

async function getUser(githubUser: GithubUser, access_token: string) {
  const githubLinkedUserAuthInfo = await findUserAuthInfoWithAuthProvider({
    authProviderIdValue: githubUser.id,
    authProviderKey: "githubId",
  });
  if (githubLinkedUserAuthInfo) {
    return githubLinkedUserAuthInfo.User;
  }
  const { email = await getPrivatePrimalGithubUserEmail(access_token) } = githubUser;
  if (!email) {
    return createNewGithubLinkedUser(githubUser);
  }
  const user = await findUserByEmail(email);
  if (!user) {
    return createNewGithubLinkedUser(githubUser);
  }
  return user.AuthInfo?.githubId
    ? user
    : getUpdatedUserWithNewAuthProvider({
      userId: user.id,
      authProviderKey: "githubId",
      authProviderIdValue: githubUser.id,
    });
}

async function getPrivatePrimalGithubUserEmail(access_token: string) {
  const emails = await getGithubUserEmails(access_token);
  return emails.find((email) => email.primary)?.email;
}

async function getGithubUserEmails(access_token: string): Promise<GithubUserPrivateEmails> {
  const emailsData = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/json",
    },
  });
  return githubUserPrivateEmailsSchema.parse(await emailsData.json());
}

function createNewGithubLinkedUser({ avatar_url, login, id, email = null }: GithubUser) {
  return prisma.user.create({
    data: {
      email,
      UserProfile: {
        create: {
          photoUrl: avatar_url,
          nickname: login,
        },
      },
      AuthInfo: {
        create: {
          githubId: id,
        },
      },
    },
    include: {
      AuthInfo: true,
      UserProfile: true,
    },
  });
}

function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, include: { AuthInfo: true, UserProfile: true } });
}

function findGithubLinkedUser(githubId: number) {
  return prisma.userAuthInfo.findFirst({
    where: { githubId },
    include: {
      User: {
        include: {
          UserProfile: true,
        },
      },
    },
  });
}

function addGithubIdToUser({ userId: id, githubId }: { userId: string, githubId: number }) {
  return prisma.user.update({
    where: { id },
    data: {
      AuthInfo: {
        update: {
          githubId,
        },
      },
    },
    include: {
      AuthInfo: true,
      UserProfile: true,
    },
  });
}