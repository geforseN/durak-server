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

// USE in VUE <a href="https://github.com/login/oauth/authorize?scope=user:email&client_id=ENTER_ME_PLS" />
github.get("/callback", async (req: Request<{ code: string }>, res) => {
  try {
    assert.ok(typeof req.query.code === "string", "Unable to log in using GitHub: no code was provided.");
    const { access_token, token_type, scope } = await getGithubAccessTokenData(req.query.code);
    const githubUser = await getGithubUser(access_token);
    const {
      email = (await getPrivatePrimalGithubUserEmail(access_token)).email,
    } = githubUser;
    if (!email) {
      return await __createNewUserWithoutEmail__();
    } else {
      await __tryFindUserWith__({ email });
    }
    __setCookies__(res, access_token);
  } catch (error) {
    assert.ok(error instanceof Error);
    res.status(404).send(error.message);
  }
  return res.send("COOL");

});

async function getGithubAccessTokenData(code: string) {
  const githubAccessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID ?? "",
    client_secret: process.env.GITHUB_CLIENT_SECRET ?? "",
    code,
  });
  const githubAccessTokenResponse = await fetch(
    new URL(`https://github.com/login/oauth/access_token?${githubAccessTokenParams}`), {
      headers: {
        Accept: "application/json",
      },
    },
  );
  assert.ok(githubAccessTokenResponse.ok, "Failed to log in using GitHub: Access token not received.");
  return z.object({
    access_token: z.string(),
    token_type: z.string(),
    scope: z.string(),
  }).parse(await githubAccessTokenResponse.json());
}

async function getGithubUserEmails(access_token: string) {
  const emailsData = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/json",
    },
  });
  return z.array(
    z.record(z.unknown()),
  ).parse(await emailsData.json());
}

async function getPrivatePrimalGithubUserEmail(access_token: string) {
  const emails = await getGithubUserEmails(access_token);
  return emails.find(email => email.primary)?.email as {
    email: string,
    primary: true,
    verified: boolean,
    visibility: boolean
  };
}

async function getGithubUser(access_token: string) {
  const data = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/json",
    },
  });

  return z.object({
    avatar: z.string(),
    email: z.string().email().optional(),
  }).parse(await data.json());
}


async function __createNewUserWithoutEmail__() {
  return prisma.user.create.bind(null);
}

async function __tryFindUserWith__({ email }: { email: string }) {
  await prisma.user.findFirst({
    where: {
      email,
    },
  });
}

function __setCookies__(res: Response, access_token: string) {
  const oneDayInMS = 1000 * 60 * 60 * 24;

  res.cookie("github_access_token", access_token, {
    sameSite: "lax",
  });
  res.cookie("sid", randomUUID(), {
    sameSite: "lax",
    expires: new Date(Date.now() + oneDayInMS),
    httpOnly: true,
  });
}

export default github;