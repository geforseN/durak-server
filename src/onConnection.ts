import { FastifyInstance, FastifyRequest } from "fastify";
import { SocketStream } from "@fastify/websocket";
import prisma from "../prisma";

export default async function onConnection(fastify: FastifyInstance) {
  fastify.get("/", { websocket: true }, async (connection: SocketStream, req: FastifyRequest) => {
    if (req.session.userProfile?.connectStatus === "OFFLINE") {
      req.session.userProfile.connectStatus = "ONLINE";
      console.log("BEFORE UPDATE LINE");
      prisma.userProfile.update({
        where: {
          userId: req.session.userProfile.userId,
        }, data: {
          connectStatus: "ONLINE",
        },
      }).then(() => {
        console.log("UPDATED");
      });
      console.log("AFTER UPDATE LINE");
    }
    console.log("BEFORE send userProfile LINE");
    connection.socket.send(JSON.stringify(req.session.userProfile), () => {
      console.log("sent userProfile");
    });
    console.log("AFTER send userProfile LINE");
    connection.socket.onclose = () => {
      console.log("CLOSE", req.session.userProfile.connectStatus);
      if (req.session.userProfile.connectStatus !== "ONLINE") return;
      setTimeout(async () => {
        console.log("BEFORE set userProfile offline LINE");
        req.session.userProfile = await prisma.userProfile.update({
          where: {
            userId: req.session.userProfile.userId,
          }, data: {
            connectStatus: "OFFLINE",
          },
        });
        console.log("AFTER set userProfile offline LINE");
      }, 5_000);
    };
  });
}