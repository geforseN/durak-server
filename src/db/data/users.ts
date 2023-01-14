import { ConnectStatus } from "../enum/connect-status.enum";
import { User } from "../shema";

const users: User[] = [
  {
    accName: "admin",
    urlToProfile: "__unknown__user__",
    photoUrl: "https://randomuser.me/api/portraits/lego/6.jpg",
    nickname: "GeForseN-",
    connectStatus: ConnectStatus.offline,
  },
  {
    accName: "second",
    urlToProfile: "second2",
    nickname: "SeConDNiCk",
    photoUrl: "https://randomuser.me/api/portraits/men/25.jpg",
    connectStatus: ConnectStatus.offline
  },
  {
    accName: "third",
    photoUrl: "https://randomuser.me/api/portraits/women/88.jpg",
    nickname: "kovvka",
    urlToProfile: "kittyG",
    connectStatus: ConnectStatus.offline
  },
];

export default users;
