const DB = require("./database.js");

bot.onText(/\/startResending (.+)/, function(msg) {
  if (msg.chat.type === "private") {
    const user = msg.from.id;
    let userData = DB.data.users[user];
    if (!userData) {
      bot.sendMessage(user, "Sorry, first you MUST create user.");
    } else {
      let groupId = msg.text.split(" ")[1];
      let promise = bot.getChat(groupId);

      promise.then(
        result => {
          DB.addKey(["users", user, groupId]);
          DB.data.users[user][groupId].status = true;
          DB.write();

          bot.sendMessage(
            user,
            // "Well the last part is setting keywords or phrases(if you want it). Enter '/setOption'"
            "Done"
          );
        },
        rejected => {
          bot.sendMessage(
            user,
            "Sorry i can't add this group to your resending list. Have you already added me there?"
          );
        }
      );
    }
  }
});

// bot.onText(/\/startResending/, function(msg) {
//   if (msg.chat.type === "private") {
//   }
// });

// bot.onText(/\/stopResending/, function(msg) {
//   if (msg.chat.type === "private") {
//   }
// });

bot.onText(/\/setOption (.+)/, function(msg) {
  if (msg.chat.type === "private") {
    const user = msg.from.id;
    let groupId = msg.text.split(" ")[1];
    let groupData = DB.data.users[user][groupId];
    if (!groupData) {
      bot.sendMessage(user, "Sorry i have no groups with this id");
    } else {
      let wordsArray = message.toLowerCase().split(" ");
      for (let i = 0; i < 2; i++) {
        wordsArray.shift();
      }
      groupData[user][groupId].keywords = wordsArray;
      DB.write();
    }
  }
});

DB.addKey(["users"]);
DB.write();
