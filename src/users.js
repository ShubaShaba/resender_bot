const DB = require("./database.js");

bot.onText(/\/createUser/, function(msg) {
  if (msg.chat.type === "private") {
    const user = msg.from.id;
    DB.addKey(["users", user]);
    DB.write();

    bot
      .sendMessage(user, "Your user was created.")
      .then(sent =>
        bot.sendMessage(
          user,
          "Now you can start receive message from diferent groups. Just enter '/startResending' or '/startResending + group id'"
        )
      );
  } else {
    bot.sendMessage(msg.chat.id, "Only for private chats");
  }
});

bot.onText(/\/deleteUser/, function(msg) {
  if (msg.chat.type === "private") {
    const user = msg.from.id;
    const usersData = DB.data.users;
    if (usersData[user]) {
      delete usersData[user];
      DB.write();
      bot.sendMessage(user, "Your user was deleted.");
    }
  } else {
    bot.sendMessage(msg.chat.id, "Only for private chats");
  }
});

DB.addKey(["users"]);
DB.write();
