import { FastifyInstance } from "fastify";
import oauthPlugin, { OAuth2Namespace, OAuth2Token } from "@fastify/oauth2";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

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

const GITHUB_AUTH_CALLBACK_URI = "/login/github/callback";
declare module "fastify" {
  interface FastifyInstance {
    githubOAuth2: OAuth2Namespace;
  }

  interface Session {
    auth: {
      provider: "github" | "twitch"
      userId: string
      access_token: string
    };
  }
}

export default async function(fastify: FastifyInstance) {
  fastify.register(oauthPlugin, {
    name: "githubOAuth2",
    scope: [],
    credentials: {
      client: {
        id: process.env.GITHUB_CLIENT_ID as string,
        secret: process.env.GITHUB_CLIENT_SECRET as string,
      },
      auth: oauthPlugin.GITHUB_CONFIGURATION,
    },
    generateStateFunction: () => true,
    checkStateFunction: (state: string, callback: Function) => callback(),
    startRedirectPath: "/login/github",
    callbackUri: `http://localhost:${process.env.FASTIFY_PORT}${GITHUB_AUTH_CALLBACK_URI}`,
  });

  fastify.get(GITHUB_AUTH_CALLBACK_URI, async function(request, reply) {
    const tokenData: OAuth2Token = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
    console.log(tokenData);
    const { access_token } = tokenData.token;
    const githubUser = await getGithubUser(access_token);
    const user = await getUser(githubUser, access_token);
    request.session.set("auth", { userId: user.id, provider: "github", access_token });
    reply.redirect(process.env.FRONTEND_URL!);
  });
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

async function getPrivatePrimalGithubUserEmail(access_token: string) {
  const emails = await getGithubUserEmails(access_token);
  return emails.find((email) => email.primary)?.email;
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
  const githubLinkedUserInfo = await prisma.userAuthInfo.findFirst({
    where: { githubId: githubUser.id },
    select: { User: true },
  });
  if (githubLinkedUserInfo?.User) {
    return githubLinkedUserInfo.User;
  }
  const { email = await getPrivatePrimalGithubUserEmail(access_token) } = githubUser;
  if (!email) {
    return prisma.user.create({
      data: {
        UserProfile: {
          create: {
            photoUrl: githubUser.avatar_url,
            nickname: githubUser.login,
          },
        },
        AuthInfo: {
          create: {
            githubId: githubUser.id,
          },
        },
      },
    });
  }
  const user = await prisma.user.findUnique({ where: { email }, include: { AuthInfo: true } });
  if (user?.AuthInfo?.githubId) return user;
  if (!user) {
    return prisma.user.create({
      data: {
        email,
        UserProfile: {
          create: {
            photoUrl: githubUser.avatar_url,
            nickname: githubUser.login,
          },
        },
        AuthInfo: {
          create: {
            githubId: githubUser.id,
          },
        },
      },
    });
  }
  return prisma.user.update({
    where: { id: user.id },
    data: {
      AuthInfo: {
        connectOrCreate: {
          where: { userId: user.id },
          create: { githubId: githubUser.id },
        },
      },
    },
  });
}