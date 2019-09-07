const DB = require('./database');
const utils = require('./utils');

module.exports = function(bot) {
  function editMessage(chatId, msgId, newText, options) {
    bot.editMessageText(newText, {
      chat_id: chatId,
      message_id: msgId,
      ...options,
    });
  }

  function generateChatsKeyboardForUser(key, userId) {
    return Promise.all(
      Object.keys(DB.data[userId]).map(chatId =>
        bot
          .getChat(chatId)
          .catch(() => null)
          .then(group => [
            { text: group.title, callback_data: key + ' ' + group.id },
          ]),
      ),
    ).then(keyboard => keyboard.filter(row => row != null));
  }

  bot.onText(/\/startResending (.+)/, function(msg) {
    if (utils.checkPrivateChat(bot, msg)) {
      const userId = msg.from.id;
      let groupId = msg.text.split(' ')[1];
      let promise = bot.getChat(groupId);

      promise.then(
        () => {
          DB.addKey([userId, groupId]);
          DB.data[userId][groupId].status = true;
          DB.write();

          bot.sendMessage(userId, 'Done').then(() => {
            bot.sendMessage(
              userId,
              "Well the last part is setting keywords or phrases(if you want it). Enter '/setOption'",
            );
          });
        },
        () => {
          bot.sendMessage(
            userId,
            "Sorry i can't add this group to your resending list. Have you already added me there?",
          );
        },
      );
    }
  });

  bot.onText(/\/stopResending/, function(msg) {
    if (msg.chat.type === 'private') {
      const userId = msg.from.id;
      generateChatsKeyboardForUser('GroupToRemove', userId).then(keyboard =>
        bot.sendMessage(
          userId,
          keyboard.length > 0
            ? 'Which group needs to be deleted from your list?'
            : "Sorry i can't find existant groups in your list.",
          { reply_markup: { inline_keyboard: keyboard } },
        ),
      );
    }
  });

  bot.on('callback_query', query => {
    if (!query.data.startsWith('GroupToRemove')) {
      return;
    }
    const msgId = query.message.message_id;
    const userId = query.message.chat.id;
    const groupId = query.data.split(' ')[1];

    console.log(userId, groupId);
    if (DB.data[userId][groupId]) {
      delete DB.data[userId][groupId];
      DB.write();

      generateChatsKeyboardForUser('GroupToRemove', userId).then(keyboard =>
        editMessage(
          userId,
          msgId,
          keyboard.length > 0
            ? 'Which group needs to be deleted from your list?'
            : 'No more groups left.',
          { reply_markup: { inline_keyboard: keyboard } },
        ),
      );
    }
  });

  let myUserId;
  bot.getMe().then(user => {
    myUserId = user.id;
  });

  bot.on('new_chat_members', function(msg) {
    if (myUserId != null) {
      if (msg.new_chat_members.find(member => member.id === myUserId)) {
        bot.sendMessage(msg.chat.id, 'chat ID: `' + msg.chat.id + '`', {
          parse_mode: 'Markdown',
        });
      }
    }
  });

  DB.addKey(['users']);
  DB.write();
};
