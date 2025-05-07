import type { SessionStore } from "@fastify/session";
import type { Session } from "fastify";

// LINK: https://socket.io/docs/v4/server-options/#allowrequest
// LINK: https://socket.io/how-to/deal-with-cookies#nodejs-client-and-cookies
// LINK: https://socket.io/how-to/use-with-express-session

export function getSidFromCookie(fullCookie: string) {
  const match = fullCookie.match(/(?:^|;\s*)sessionId=([^;]+)/);
  if (!match) {
    return null;
  }
  const sessionId = decodeURIComponent(match[1]);
  if (sessionId === null) {
    return null;
  }
  const sid = sessionId.split(".")[0];
  if (typeof sid !== "string") {
    console.warn("sid is not string");
    return null;
  }
  return sid;
}

export async function getUserDataBySessionId(
  sessionId: string,
  sessionStore: SessionStore,
) {
  const userData = Promise.withResolvers<Session>();
  sessionStore.get(sessionId, (error, session) => {
    if (error || !session || !session.user) {
      console.log(
        {
          error,
          session,
        },
        "store couldn't get session data",
      );
      userData.reject();
    } else {
      userData.resolve(session);
    }
  });
  return userData.promise;
}
