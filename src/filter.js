const DB = require('./database.js');

module.exports = function(bot) {
  bot.onText(/\/setOption (.+)/, function(msg) {
    if (msg.chat.type === 'private') {
      const user = msg.from.id;
      let groupId = msg.text.split(' ')[1];
      let groupData = DB.data.users[user][groupId];
      if (!groupData) {
        bot.sendMessage(user, 'Sorry i have no groups with this id');
      } else {
        let wordsArray = message.toLowerCase().split(' ');
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
