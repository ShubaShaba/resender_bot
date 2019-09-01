const TelegramBot = require("node-telegram-bot-api");
const token = "981352635:AAGatP72r236mYcr7KAE6hBkWTVvXBFtmvQ";
const bot = new TelegramBot(token, { polling: true });
const DB = require("./database.js");
global.bot = bot;
require("./memory.js");

const comands = {
  help: ["/start", "/createUser"]
};

bot.onText(/\/start/, function start(msg) {
  if (msg.text == "/start") {
    const chatId = msg.chat.id;
    let startComandsPack = comands.help.join("; \n");
    bot
      .sendMessage(chatId, "Hello!")
      .then(sent =>
        bot.sendMessage(chatId, "Commands list:" + "\n" + startComandsPack)
      );
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
