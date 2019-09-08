const DB = require("./database");
const utils = require("./utils");

module.exports = function(bot) {
  function editMessage(chatId, msgId, newText, options) {
    bot.editMessageText(newText, {
      chat_id: chatId,
      message_id: msgId,
      ...options
    });
  }

  function generateChatsKeyboardForUser(key, userId) {
    let userChats = DB.data[userId];
    return Promise.all(
      Object.keys(userChats).map(chatId =>
        bot
          .getChat(chatId)
          .catch(() => null)
          .then(group => [
            { text: group.title, callback_data: key + " " + group.id }
          ])
      )
    ).then(keyboard => keyboard.filter(row => row != null));
  }

  bot.onText(/^\/startResending\s.+$/, function(msg) {
    if (utils.checkPrivateChat(bot, msg)) {
      let args = msg.text.split(/\s+/);

      let userId = msg.from.id;
      let chatId = args[1];
      bot.getChat(chatId).then(
        () => {
          DB.addKey([userId, chatId]);
          DB.data[userId][chatId] = { status: true };
          DB.write();

          bot.sendMessage(userId, "Done").then(() => {
            bot.sendMessage(
              userId,
              "You can also set keywords of interest using /setOption"
            );
          });
        },
        () => {
          bot.sendMessage(
            userId,
            "Sorry, I can't add this group to your list. Possible causes are:\n" +
              "1. I am not a member of this group\n" +
              "2. A group with the specified ID doesn't exist"
          );
        }
      );
    }
  });

  bot.onText(/^\/stopResending$/, function(msg) {
    if (msg.chat.type === "private") {
      let userId = msg.from.id;
      if (!(userId in DB.data)) return;
      generateChatsKeyboardForUser("GroupToRemove", userId).then(keyboard =>
        bot.sendMessage(
          userId,
          keyboard.length > 0
            ? "Which group do you want to delete?"
            : "Sorry, I can't find existant groups in your list.",
          { reply_markup: { inline_keyboard: keyboard } }
        )
      );
    }
  });

  bot.on("callback_query", query => {
    if (!query.data.startsWith("GroupToRemove")) return;

    let args = query.data.split(/\s+/);

    let msgId = query.message.message_id;
    let userId = query.message.chat.id;
    let chatId = args[1];

    if (!(userId in DB.data)) return;
    let userChats = DB.data[userId];
    if (!(chatId in userChats)) return;
    delete userChats[chatId];
    DB.write();

    generateChatsKeyboardForUser("GroupToRemove", userId).then(keyboard =>
      editMessage(
        userId,
        msgId,
        keyboard.length > 0
          ? "Which group do you want to delete?"
          : "No more groups left.",
        { reply_markup: { inline_keyboard: keyboard } }
      )
    );
  });

  let myUserId;
  bot.getMe().then(user => {
    myUserId = user.id;
  });

  bot.on("new_chat_members", function(msg) {
    if (myUserId != null) {
      if (msg.new_chat_members.find(member => member.id === myUserId)) {
        let chatId = msg.chat.id;
        bot.sendMessage(chatId, `chat ID: \`${chatId}\``, {
          parse_mode: "Markdown"
        });
      }
    }
  });
};
