import oauthPlugin, { OAuth2Namespace } from "@fastify/oauth2";
import { ConnectStatus, Prisma } from "@prisma/client";

export const GITHUB_AUTH_CALLBACK_URI = "/login/github/callback";
export const authProviderKey = "githubId";
const NAMESPACE_NAME = "githubOAuth2";

declare module "fastify" {
  interface FastifyInstance {
    [NAMESPACE_NAME]: OAuth2Namespace;
  }

  interface Session {
    auth: {
      provider: "github";
      userId: string;
      access_token: string;
    };
    userProfile: {
      userId: string;
      personalLink: string;
      updatedAt: Date;
      photoUrl: string | null;
      nickname: string;
      connectStatus: ConnectStatus;
    };
    isAnonymous: boolean;
  }
}

export default {
  name: NAMESPACE_NAME,
  scope: [],
  credentials: {
    client: {
      id: process.env.GITHUB_CLIENT_ID!,
      secret: process.env.GITHUB_CLIENT_SECRET!,
    },
    auth: oauthPlugin.GITHUB_CONFIGURATION,
  },
  generateStateFunction: () => true,
  checkStateFunction: (state: string, callback: Function) => callback(),
  startRedirectPath: "/login/github",
  callbackUri: `http://localhost:${process.env.FASTIFY_PORT}${GITHUB_AUTH_CALLBACK_URI}`,
};
