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