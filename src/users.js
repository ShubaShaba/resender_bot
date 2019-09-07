const DB = require('./database');
const utils = require('./utils');

module.exports = function(bot) {
  bot.onText(/^\/createUser/, function(msg) {
    if (utils.checkPrivateChat(bot, msg)) {
      const user = msg.from.id;
      DB.addKey(['users', user]);
      DB.write();

      bot
        .sendMessage(user, 'Your user was created.')
        .then(sent =>
          bot.sendMessage(
            user,
            "Now you can start receive message from diferent groups. Just enter '/startResending' or '/startResending + group id'",
          ),
        );
    }
  });

  bot.onText(/^\/deleteUser/, function(msg) {
    if (utils.checkPrivateChat(bot, msg)) {
      const user = msg.from.id;
      const usersData = DB.data.users;
      if (usersData[user]) {
        delete usersData[user];
        DB.write();
        bot.sendMessage(user, 'Your user was deleted.');
      }
    }
  });

  DB.addKey(['users']);
  DB.write();
};
