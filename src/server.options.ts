const serverOptions = {
  cookie: true,
  cors: {
    origin: [
      "https://admin.socket.io",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  },
};
export default serverOptions;