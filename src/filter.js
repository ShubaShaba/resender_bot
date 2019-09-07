const DB = require('./database.js');
const utils = require('./utils');

module.exports = function(bot) {
  bot.onText(/^\/setOption (.+)/, function(msg) {
    if (utils.checkPrivateChat(bot, msg)) {
      const user = msg.from.id;
      let groupId = msg.text.split(' ')[1];
      let groupData = DB.data[user][groupId];
      if (!groupData) {
        bot.sendMessage(user, 'Sorry i have no groups with this id');
      } else {
        let wordsArray = msg.text.toLowerCase().split(' ');
        for (let i = 0; i < 2; i++) {
          wordsArray.shift();
        }
        groupData[user][groupId].keywords = wordsArray;
        DB.write();
      }
    }
  });

  DB.addKey(['users']);
  DB.write();
};
