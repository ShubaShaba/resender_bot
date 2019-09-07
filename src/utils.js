function checkPrivateChat(bot, msg) {
  if (msg.chat.type === 'private') {
    return true;
  } else {
    bot.sendMessage(msg.chat.id, 'Only for private chats');
    return false;
  }
}

module.exports = { checkPrivateChat };
