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
          "Now you can start receive message from diferent groups. Just enter '/startResending + group id'"
        )
      );
  } else {
    bot.sendMessage(msg.chat.id, "Only for private chats");
  }
});

bot.onText(/\/startResending (.+)/, function(msg) {
  if (msg.chat.type === "private") {
    const user = msg.from.id;
    let userData = DB.data.users[user];
    if (!userData) {
      bot.sendMessage(user, "Sorry, you MUST create user first.");
    } else {
      let message = msg.text;
      let groupId = message.split(" ")[1];
      DB.addKey(["users", user, groupId]);
      DB.data.users[user][groupId].status = true;
      DB.write();

      bot.sendMessage(
        user,
        "Well the last part is setting keywords or phrases. Enter '/setOption + group id + keyword...as many keyword/phrase as you need'"
      );
    }
  }
});

bot.onText(/\/setOption (.+)/, function(msg) {
  if (msg.chat.type === "private") {
    const user = msg.from.id;
    let message = msg.text;
    let groupId = message.split(" ")[1];
    let userData = DB.data.users[user][groupId];
    if (!userData) {
      bot.sendMessage(user, "Sorry i have no groups with this id");
    } else {
      let wordsArray = message.toLowerCase().split(" ");
      for (let i = 0; i < 2; i++) {
        wordsArray.shift();
      }
      DB.data.users[user][groupId].keywords = wordsArray;
      DB.write();
    }
  }
});

DB.addKey(["users"]);
DB.write();
