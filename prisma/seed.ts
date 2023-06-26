import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

main();
const a = {
  num: 28,
  id: "ccecf8a1-0e82-40dd-b29b-c53ab9565929",
  accname: null,
  email: "semen.neb@gmail.com",
  personalLink: "cli909tqj0000v1no69t43mtx",
  photoUrl: null,
  nickname: "Durak Player",
  connectStatus: "OFFLINE",
  createdAt: "2023-05-29T15:29:42.092Z",
};

async function main() {
  const users = [{
    num: 7,
    id: "gum",
    accname: "gum",
    email: null,
    personalLink: "475724126566341",
    photoUrl: "https://randomuser.me/api/portraits/women/92.jpg",
    nickname: "Rock",
    connectStatus: "OFFLINE",
    createdAt: "2023-01-24T14:08:52.617Z",
  },
    {
      num: 8,
      id: "dude",
      accname: "dude",
      email: null,
      personalLink: "3678112126566341",
      photoUrl: "https://randomuser.me/api/portraits/women/16.jpg",
      nickname: "Shakira",
      connectStatus: "OFFLINE",
      createdAt: "2023-01-24T14:08:52.617Z",
    },
    {
      num: 5,
      id: "oxigen",
      accname: "oxigen",
      email: null,
      personalLink: "46589895671",
      photoUrl: "https://randomuser.me/api/portraits/men/70.jpg",
      nickname: "Ruina",
      connectStatus: "OFFLINE",
      createdAt: "2023-01-24T14:08:52.617Z",
    },
    {
      num: 4,
      id: "mad",
      accname: "mad",
      email: null,
      personalLink: "465746785",
      photoUrl: "https://randomuser.me/api/portraits/men/80.jpg",
      nickname: "Imposter",
      connectStatus: "OFFLINE",
      createdAt: "2023-01-24T14:08:52.617Z",
    },
    {
      num: 1,
      id: "admin",
      accname: "admin",
      email: null,
      personalLink: "__unknown__user__",
      photoUrl: "https://randomuser.me/api/portraits/lego/6.jpg",
      nickname: "GeForseN-",
      connectStatus: "OFFLINE",
      createdAt: "2023-01-24T14:08:52.617Z",
    },
    {
      num: 2,
      id: "second",
      accname: "second",
      email: null,
      personalLink: "second2",
      photoUrl: "https://randomuser.me/api/portraits/men/25.jpg",
      nickname: "SeConDNiCk",
      connectStatus: "OFFLINE",
      createdAt: "2023-01-24T14:08:52.617Z",
    },
    {
      num: 3,
      id: "third",
      accname: "third",
      email: null,
      personalLink: "kittyG",
      photoUrl: "https://randomuser.me/api/portraits/women/88.jpg",
      nickname: "kovvka",
      connectStatus: "OFFLINE",
      createdAt: "2023-01-24T14:08:52.617Z",
    },
    {
      num: 6,
      id: "buble",
      accname: "buble",
      email: null,
      personalLink: "47571241",
      photoUrl: "https://randomuser.me/api/portraits/men/28.jpg",
      nickname: "SuS",
      connectStatus: "OFFLINE",
      createdAt: "2023-01-24T14:08:52.617Z",
    },
  ];
  users.sort((a, b) => a.num - b.num).map(async ({ num, nickname, photoUrl, personalLink }) => {
    return await prisma.user.update({
      where: { num },
      data: {
        UserProfile: {
          create: {
            nickname,
            photoUrl,
            personalLink,
          },
        },
      },
    });
  });
}


// {
//   num: 7,
//     id: 'gum',
//   accname: 'gum',
//   email: null,
//   personalLink: '475724126566341',
//   photoUrl: 'https://randomuser.me/api/portraits/women/92.jpg',
//   nickname: 'Rock',
//   connectStatus: 'OFFLINE',
//   createdAt: 2023-01-24T14:08:52.617Z,
//   updatedAt: 2023-05-19T12:24:35.954Z
// },
// {
//   num: 8,
//     id: 'dude',
//   accname: 'dude',
//   email: null,
//   personalLink: '3678112126566341',
//   photoUrl: 'https://randomuser.me/api/portraits/women/16.jpg',
//   nickname: 'Shakira',
//   connectStatus: 'OFFLINE',
//   createdAt: 2023-01-24T14:08:52.617Z,
//   updatedAt: 2023-05-19T12:24:35.954Z
// },
// {
//   num: 5,
//     id: 'oxigen',
//   accname: 'oxigen',
//   email: null,
//   personalLink: '46589895671',
//   photoUrl: 'https://randomuser.me/api/portraits/men/70.jpg',
//   nickname: 'Ruina',
//   connectStatus: 'OFFLINE',
//   createdAt: 2023-01-24T14:08:52.617Z,
//   updatedAt: 2023-05-19T12:24:35.954Z
// },
// {
//   num: 4,
//     id: 'mad',
//   accname: 'mad',
//   email: null,
//   personalLink: '465746785',
//   photoUrl: 'https://randomuser.me/api/portraits/men/80.jpg',
//   nickname: 'Imposter',
//   connectStatus: 'OFFLINE',
//   createdAt: 2023-01-24T14:08:52.617Z,
//   updatedAt: 2023-05-19T12:24:35.954Z
// },
// {
//   num: 1,
//     id: 'admin',
//   accname: 'admin',
//   email: null,
//   personalLink: '__unknown__user__',
//   photoUrl: 'https://randomuser.me/api/portraits/lego/6.jpg',
//   nickname: 'GeForseN-',
//   connectStatus: 'OFFLINE',
//   createdAt: 2023-01-24T14:08:52.617Z,
//   updatedAt: 2023-05-19T12:24:35.954Z
// },
// {
//   num: 2,
//     id: 'second',
//   accname: 'second',
//   email: null,
//   personalLink: 'second2',
//   photoUrl: 'https://randomuser.me/api/portraits/men/25.jpg',
//   nickname: 'SeConDNiCk',
//   connectStatus: 'OFFLINE',
//   createdAt: 2023-01-24T14:08:52.617Z,
//   updatedAt: 2023-05-19T12:24:35.954Z
// },
// {
//   num: 3,
//     id: 'third',
//   accname: 'third',
//   email: null,
//   personalLink: 'kittyG',
//   photoUrl: 'https://randomuser.me/api/portraits/women/88.jpg',
//   nickname: 'kovvka',
//   connectStatus: 'OFFLINE',
//   createdAt: 2023-01-24T14:08:52.617Z,
//   updatedAt: 2023-05-19T12:24:35.954Z
// },
// {
//   num: 6,
//     id: 'buble',
//   accname: 'buble',
//   email: null,
//   personalLink: '47571241',
//   photoUrl: 'https://randomuser.me/api/portraits/men/28.jpg',
//   nickname: 'SuS',
//   connectStatus: 'OFFLINE',
//   createdAt: 2023-01-24T14:08:52.617Z,
//   updatedAt: 2023-05-19T12:24:35.954Z
// },
// {
//   num: 28,
//     id: 'ccecf8a1-0e82-40dd-b29b-c53ab9565929',
//   accname: null,
//   email: 'semen.neb@gmail.com',
//   personalLink: 'cli909tqj0000v1no69t43mtx',
//   photoUrl: null,
//   nickname: 'Durak Player',
//   connectStatus: 'OFFLINE',
//   createdAt: 2023-05-29T15:29:42.092Z,
//   updatedAt: 2023-05-29T15:29:42.092Z
// }

