import oauthPlugin, { OAuth2Namespace } from "@fastify/oauth2";

export const GITHUB_AUTH_CALLBACK_URI = "/login/github/callback";
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
    userProfile: any;
  }
}

export default {
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
};
