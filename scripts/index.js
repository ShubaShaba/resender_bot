const TelegramBot = require("node-telegram-bot-api");
const token = "981352635:AAGatP72r236mYcr7KAE6hBkWTVvXBFtmvQ";
const bot = new TelegramBot(token, { polling: true });
const DB = require("./database.js");
global.bot = bot;
require("./users.js");
require("./usersSettings");

const comands = {
  help: ["/help", "/createUser"],
  help_for_users: [
    "/startResending + id",
    "/startResending",
    "/setOption",
    "/deleteUser",
    "/stopResending"
  ]
};

bot.onText(/\/start/, function start(msg) {
  if (msg.text === "/start") {
    if (msg.chat.type === "private") {
      const chat = msg.chat.id;
      let startComandsPack = comands.help.join("; \n");
      bot
        .sendMessage(chat, "Hello!")
        .then(sent =>
          bot.sendMessage(chat, "Commands list:" + "\n" + startComandsPack)
        );
    } else {
      bot.sendMessage(msg.chat.id, "Only for private chats");
    }
  }
});

bot.onText(/\/help/, function start(msg) {
  if (msg.chat.type === "private") {
    const chat = msg.chat.id;
    const usersData = DB.data.users;
    if (!usersData[chat]) {
      bot.sendMessage(chat, "First you have to create user");
    } else {
      let comandsPack = comands.help_for_users.join("; \n");
      bot.sendMessage(chat, "Commands list:" + "\n" + comandsPack);
    }
  } else {
    bot.sendMessage(msg.chat.id, "Only for private chats");
  }
});

bot.on("message", msg => {
  if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
    const chat = msg.chat.id;
    const ms = msg.message_id;
    const usersData = DB.data.users;
    if (usersData) {
      Object.keys(usersData).map(user => {
        if (usersData[user][chat]) {
          if (usersData[user][chat].status) {
            if (usersData[user][chat].keywords) {
              let result = usersData[user][chat].keywords.find(item =>
                msg.text.toLowerCase().includes(item)
              );
              if (result) {
                bot.forwardMessage(Number(user), chat, ms);
              }
            } else {
              bot.forwardMessage(Number(user), chat, ms);
            }
          }
        }
      });
    }
  }
});

bot.on("polling_error", msg => console.log(msg));
