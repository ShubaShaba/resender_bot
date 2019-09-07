const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const bot = new TelegramBot(config.token, { polling: true });

const DB = require('./database');
const utils = require('./utils');
require('./groups')(bot);
require('./filter')(bot);

const comands = {
  helpForUsers: [
    '/startResending + id',
    '/startResending',
    '/setOption',
    '/deleteUser',
    '/stopResending',
  ],
};

bot.onText(/^\/start$/, function start(msg) {
  if (utils.checkPrivateChat(bot, msg)) {
    const chat = msg.chat.id;
    let startComandsPack = comands.help.join('; \n');
    bot
      .sendMessage(chat, 'Hello!')
      .then(() => bot.sendMessage(chat, 'Commands list:\n' + startComandsPack));
  }
});

bot.onText(/^\/help$/, function start(msg) {
  if (utils.checkPrivateChat(bot, msg)) {
    const chat = msg.chat.id;
    let comandsPack = comands.helpForUsers.join('; \n');
    bot.sendMessage(chat, 'Commands list:' + '\n' + comandsPack);
  }
});

bot.on('message', msg => {
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    const chatId = msg.chat.id;
    const msgId = msg.message_id;
    Object.keys(DB.data).forEach(userId => {
      let userChats = DB.data[userId];
      if (chatId in userChats) {
        let chatRule = userChats[chatId];
        if (chatRule.status) {
          if (chatRule.keywords) {
            let lowerCaseText = msg.text.toLowerCase();
            if (chatRule.keywords.find(item => lowerCaseText.includes(item))) {
              bot.forwardMessage(userId, chatId, msgId);
            }
          } else {
            bot.forwardMessage(userId, chatId, msgId);
          }
        }
      }
    });
  }
});

bot.on('polling_error', msg => console.log(msg));
