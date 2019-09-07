const DB = require('./database.js');

module.exports = function(bot) {
  function editMessage(newText, chatId, msgId, keyboard) {
    bot.editMessageText(newText, {
      chat_id: chatId,
      message_id: msgId,
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  function createGroupsKeyboard(list, key) {
    let keyboard = [];

    list.forEach(group => {
      if (group) {
        keyboard.push([
          { text: group.title, callback_data: key + ' ' + group.id },
        ]);
      }
    });
    if (keyboard.length !== 0) {
      return keyboard;
    }
  }

  function initializeGroupsKeyboard(
    user,
    key,
    msgIfListExist,
    msgIfListNonExist,
    messageType,
    msgId,
  ) {
    let userData = DB.data.users;

    Promise.all(
      Object.keys(userData[user]).map(group =>
        bot.getChat(group).then(
          resolver => {
            return resolver;
          },
          rejected => {
            return null;
          },
        ),
      ),
    ).then(result => {
      let keyboard = createGroupsKeyboard(result, key);
      if (keyboard) {
        if (messageType === 'new') {
          bot.sendMessage(user, msgIfListExist, {
            reply_markup: {
              inline_keyboard: keyboard,
            },
          });
        } else if (messageType === 'edit') {
          editMessage(msgIfListExist, user, msgId, keyboard);
        }
      } else {
        if (messageType === 'new') {
          bot.sendMessage(user, msgIfListNonExist);
        } else if (messageType === 'edit') {
          editMessage(msgIfListNonExist, user, msgId, []);
        }
      }
    });
  }

  // bot.onText(/\/startResending/, function(msg) {
  //   if (msg.chat.type === "private") {
  //     const user = msg.from.id;
  //   }
  // });

  bot.onText(/\/startResending (.+)/, function(msg) {
    if (msg.chat.type === 'private') {
      const user = msg.from.id;
      let userData = DB.data.users[user];
      if (!userData) {
        bot.sendMessage(user, 'Sorry, first you MUST create user.');
      } else {
        let groupId = msg.text.split(' ')[1];
        let promise = bot.getChat(groupId);

        promise.then(
          result => {
            DB.addKey(['users', user, groupId]);
            DB.data.users[user][groupId].status = true;
            DB.write();

            bot.sendMessage(user, 'Done').then(func => {
              bot.sendMessage(
                user,
                "Well the last part is setting keywords or phrases(if you want it). Enter '/setOption'",
              );
            });
          },
          rejected => {
            bot.sendMessage(
              user,
              "Sorry i can't add this group to your resending list. Have you already added me there?",
            );
          },
        );
      }
    }
  });

  bot.onText(/\/stopResending/, function(msg) {
    if (msg.chat.type === 'private') {
      const user = msg.from.id;
      initializeGroupsKeyboard(
        user,
        'GroupToRemove',
        'Which group needs to be deleted from your user?',
        "Sorry i can't find existant groups in your list.",
        'new',
        null,
      );
    }
  });

  bot.on('callback_query', query => {
    if (!query.data.startsWith('GroupToRemove')) {
      return;
    }
    const msgId = query.message.message_id;
    const user = query.message.chat.id;
    const result = query.data.split(' ')[1];

    const usersData = DB.data.users;
    if (usersData[user][result]) {
      delete usersData[user][result];
      DB.write();

      initializeGroupsKeyboard(
        user,
        'GroupToRemove',
        'Which group needs to be deleted from your user?',
        'No more groups left.',
        'edit',
        msgId,
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
