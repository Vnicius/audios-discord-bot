const configs = require("../config");
const defaultMessages = configs.defaultMessages;

/**
 * Make the bot stay in a voice channel
 * @param {Object} message - message object
 * @param {Object} server - server object
 */
function stayInVoiceChannel(message, server) {
  const { member, channel, guild } = message;

  // check if the user is a voice channel
  if (!member.voice.channel) {
    channel.send(defaultMessages.goToVoiceChannelMessage);
  } else {
    // get the connect
    if (!guild.me.voice.channel) {
      // make the connection with the voice channel
      member.voice.channel.join().then((connection) => {
        server.setConnection(connection);
      });
    } else {
      // if is buisy in other voice channel
      channel.send(defaultMessages.busyMessage);
    }
  }
}

/**
 * Make the bot leave a voice channel
 * @param {Object} message - message object
 * @param {Object} server - server object
 */
function leaveVoiceChannel(message, server) {
  // check if the user is in a voice channel
  if (!message.member.voice.channel) {
    message.channel.send(defaultMessages.goToVoiceChannelMessage);
  } else {
    // if the voice channel is the same of the user
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id === message.guild.me.voice.channel.id
    ) {
      // leave the connection
      message.guild.me.voice.channel.leave();
      server.setConnection(null);
    } else {
      message.channel.send(defaultMessages.busyMessage);
    }
  }
}

module.exports = { stayInVoiceChannel, leaveVoiceChannel };
