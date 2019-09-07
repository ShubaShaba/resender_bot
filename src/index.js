const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const bot = new TelegramBot(config.token, { polling: true });

const DB = require('./database');
const utils = require('./utils');
require('./groups')(bot);
require('./filter')(bot);

const COMMANDS = [
  '/startResending SPACE <id>',
  '/startResending',
  '/setOption',
  '/deleteUser',
  '/stopResending',
];

bot.onText(/^\/(start|help)$/, msg => {
  if (!utils.checkPrivateChat(bot, msg)) return;

  const chatId = msg.chat.id;
  let comandsPack = COMMANDS.join('\n');
  bot.sendMessage(chatId, 'Commands list:\n' + comandsPack);
});

bot.on('message', msg => {
  if (!msg.chat.type === 'group' || msg.chat.type === 'supergroup') return;

  const chatId = msg.chat.id;
  const msgId = msg.message_id;
  Object.keys(DB.data).forEach(userId => {
    if (!(userId in DB.data)) return;
    let userChats = DB.data[userId];
    if (!(chatId in userChats)) return;
    let chatRule = userChats[chatId];
    if (!chatRule.status) return;
    if (chatRule.keywords) {
      let lowerCaseText = msg.text.toLowerCase();
      if (chatRule.keywords.find(item => lowerCaseText.includes(item))) {
        bot.forwardMessage(userId, chatId, msgId);
      }
    } else {
      bot.forwardMessage(userId, chatId, msgId);
    }
  });
});

bot.on('polling_error', msg => console.log(msg));
