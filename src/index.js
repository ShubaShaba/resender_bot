const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const bot = new TelegramBot(config.token, { polling: true });

const DB = require('./database');
const utils = require('./utils');
require('./users')(bot);
require('./groups')(bot);
require('./filter')(bot);

const comands = {
  help: ['/help', '/createUser'],
  helpForUsers: [
    '/startResending + id',
    '/startResending',
    '/setOption',
    '/deleteUser',
    '/stopResending',
  ],
};

bot.onText(/^\/start/, function start(msg) {
  if (utils.checkPrivateChat(bot, msg)) {
    const chat = msg.chat.id;
    let startComandsPack = comands.help.join('; \n');
    bot
      .sendMessage(chat, 'Hello!')
      .then(sent =>
        bot.sendMessage(chat, 'Commands list:\n' + startComandsPack),
      );
  }
});

bot.onText(/^\/help/, function start(msg) {
  if (utils.checkPrivateChat(bot, msg)) {
    const chat = msg.chat.id;
    const usersData = DB.data.users;
    if (!usersData[chat]) {
      bot.sendMessage(chat, 'First you have to create user');
    } else {
      let comandsPack = comands.helpForUsers.join('; \n');
      bot.sendMessage(chat, 'Commands list:' + '\n' + comandsPack);
    }
  }
});

bot.on('message', msg => {
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    const chat = msg.chat.id;
    const ms = msg.message_id;
    const usersData = DB.data.users;
    if (usersData) {
      Object.keys(usersData).forEach(user => {
        if (usersData[user][chat]) {
          if (usersData[user][chat].status) {
            if (usersData[user][chat].keywords) {
              let result = usersData[user][chat].keywords.find(item =>
                msg.text.toLowerCase().includes(item),
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

bot.on('polling_error', msg => console.log(msg));
