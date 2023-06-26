import oauthPlugin, { OAuth2Namespace, OAuth2Token } from "@fastify/oauth2";
import { FastifyInstance } from "fastify";

export default function(fastify: FastifyInstance) {
  fastify.register(oauthPlugin, {
    name: "twitchOAuth2",
    scope: [],
    credentials: {
      client: {
        id: process.env.TWITCH_CLIENT_ID as string,
        secret: process.env.TWITCH_CLIENT_SECRET as string,
      },
      auth: oauthPlugin.TWITCH_CONFIGURATION,
    },
    tokenRequestParams: {
      client_id: process.env.TWITCH_CLIENT_ID as string,
      client_secret: process.env.TWITCH_CLIENT_SECRET as string,
    },
    generateStateFunction: () => true,
    checkStateFunction: (state: string, callback: Function) => callback(),
    startRedirectPath: "/login/twitch",
    callbackUri: `http://localhost:${+process.env.FASTIFY_PORT!}/login/twitch/callback`,
  });

  fastify.get("/login/twitch/callback", async function(this: FastifyInstance, request, reply) {
    console.log("TWITCH callback PARAMETERS ARE", request.query);
    // TODO IF FOUND IN SESSION AND TOKEN EXPIRED
    // await ((this as any).twitchOAuth2 as OAuth2Namespace).getNewAccessTokenUsingRefreshToken

    const tokenData: OAuth2Token = await ((this as any).twitchOAuth2 as OAuth2Namespace).getAccessTokenFromAuthorizationCodeFlow(request);

    console.log(tokenData.token, tokenData.expired());
    reply.redirect(process.env.FRONTEND_URL as string);
  });
  // fastify.get('/login/twitch/callback', async function (request, reply) {
  //   const { token } = await this.twitchOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
  //   console.log(token.access_token)
  //   // if later you need to refresh the token you can use
  //   // const { token: newToken } = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)
  //   reply.send({ access_token: token.access_token })
  // })
}

