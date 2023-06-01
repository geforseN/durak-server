import oauthPlugin, { OAuth2Namespace } from "@fastify/oauth2";

export const VK_AUTH_CALLBACK_URI = "/login/vk/callback";
export const authProviderKey = "vkId";
const NAMESPACE_NAME = 'vkOAuth2';

declare module "fastify" {
  interface FastifyInstance {
    [NAMESPACE_NAME]: OAuth2Namespace;
  }
}

export default {
  name: NAMESPACE_NAME,
  scope: ['email'],
  credentials: {
    client: {
      id: process.env.VK_CLIENT_ID!,
      secret: process.env.VK_CLIENT_SECRET!,
    },
    auth: oauthPlugin.GITHUB_CONFIGURATION,
  },
  generateStateFunction: () => true,
  checkStateFunction: (state: string, callback: Function) => callback(),
  startRedirectPath: "/login/vk",
  callbackUri: `http://localhost:${process.env.FASTIFY_PORT}${VK_AUTH_CALLBACK_URI}`,
};