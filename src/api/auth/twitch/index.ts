import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const MILLISECONDS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
const TWITCH_CLIENT_DATA = `client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}`;
const AUTHORIZATION_DATA = "grant_type=authorization_code&redirect_uri=http://localhost:3033/api/auth/twitch/auth";

const twitchAuth = Router();

type GoodQuery = {
  code: string,
  scope: string,
  state?: string,
}

type BadQuery = {
  error: string,
  error_description: string,
  state?: string,
}

twitchAuth.get("/token2", async (req: Request<{}, {}, {}, GoodQuery | BadQuery>, res: Response) => {
  const { query } = req;
  if (!query) return res.status(401).send("Недостаточно данных");
  if (isBad(query)) return res.status(404).send(query.error_description);

  const authorizationData = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `${TWITCH_CLIENT_DATA}&code=${query.code}&${AUTHORIZATION_DATA}`,
    //`client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
  })
    .then((res) => res.json());
  console.log(authorizationData);

  // authorizationData as { status: number, message: string }
  if (authorizationData.status) {
    return res.redirect(process.env.FRONTEND_URL + "auth/login");
  }

  res.cookie("refresh_token", authorizationData.refresh_token, {
    secure: false, // TODO true when will use SSL,
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(Date.now() + MILLISECONDS_IN_YEAR),
  });

  // https://dev.twitch.tv/docs/api/reference/#get-users
  const twitchUser: TwitchUser = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${authorizationData.access_token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID ?? "",
    },
  })
    .then((res) => res.json())
    .then((json) => json.data[0]);

  console.log({ twitchUser, email: twitchUser.email });

  // await prisma.user.upsert({
  //   where: { email: twitchUser.email },
  //   create: {
  //     photoUrl: twitchUser.profile_image_url,
  //     nickname: twitchUser.display_name, // OR twitchUser.login
  //     // add ses
  //   },
  //   update: {
  //     // add ses
  //   }
  // });

  const tokenData = await fetch("https://id.twitch.tv/oauth2/validate", {
      headers: { Authorization: `OAuth ${authorizationData.access_token}` },
    },
  )
    .then((res) => res.json());
  if (tokenData.status.at(0) === "4") {
    return res.redirect(process.env.FRONTEND_URL + "auth/login");
  }
  console.log({ validTokenData: tokenData });

  res.redirect(process.env.FRONTEND_URL as string + "auth/login"); // TODO remove "auth/login"
});

twitchAuth.get("/auth", (req: Request, res: Response) => {
  // TODO WRITE SESSION IN DB
  // FIXME, PROBABLY ME USELESS, DELETE ME
  console.log("WORK");
  res.json(req.body);
});

twitchAuth.get("/token2", async (req: Request<{}, {}, {}, GoodQuery | BadQuery>, res: Response) => {

});

function isBad(query: GoodQuery | BadQuery): query is BadQuery {
  return (query as BadQuery).error !== undefined;
}

function getTwitchSmth({ code }: GoodQuery) {
  return `client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:3033/api/auth/twitch/auth`;
}

type TwitchUser = {
  id: string,
  login: string,
  display_name: string,
  type: string,
  broadcaster_type: string,
  description: string,
  profile_image_url: string,
  offline_image_url: string,
  view_count?: number,
  email: string,
  created_at: string
}

function getAccessToken(): Promise<unknown> {
  return fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `${TWITCH_CLIENT_DATA}&grant_type=client_credentials`,
  });
}

export default twitchAuth;
