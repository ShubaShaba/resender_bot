const DB = require('./database');
const utils = require('./utils');

module.exports = function(bot) {
  bot.onText(/^\/setOption\s.+$/, function(msg) {
    if (!utils.checkPrivateChat(bot, msg)) return;

    let args = msg.text.split(/\s+/);

    let userId = msg.from.id;
    if (!(userId in DB.data)) {
      bot.sendMessage(userId, "Sorry, you haven't added any groups yet");
      return;
    }
    let userChats = DB.data[userId];
    let chatId = args[1];
    if (!(chatId in userChats)) {
      bot.sendMessage(userId, 'Sorry, I have no groups with this ID');
      return;
    }
    let chatRule = userChats[chatId];
    chatRule.keywords = args.slice(2).map(keyword => keyword.toLowerCase());
    DB.write();
  });
};
