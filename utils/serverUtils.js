/**
 * Make the bot stay in a voice channel
 * @param {Object} message - message object
 * @param {Object} server - server object
 */
function stayInVoiceChannel(message, server) {
  const { member, channel, guild } = message;

  // check if the user is a voice channel
  if (!member.voiceChannel) {
    channel.send(defaultMessages.goToVoiceChannelMessage);
  } else {
    // get the connect
    if (!guild.voiceConnection) {
      server.setVChannelId(member.voiceChannel.id);

      // make the connection with the voice channel
      member.voiceChannel.join().then(connection => {
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
  if (!message.member.voiceChannel) {
    message.channel.send(defaultMessages.goToVoiceChannelMessage);
  } else {
    // if the voice channel is the same of the user
    if (
      message.guild.voiceConnection &&
      message.member.voiceChannel.id === server.getVChannelId()
    ) {
      // leave the connection
      server.setVChannelId(null);
      server.getConnection().disconnect();
      server.setConnection(null);
    } else {
      message.channel.send(defaultMessages.busyMessage);
    }
  }
}

module.exports = { stayInVoiceChannel, leaveVoiceChannel };
