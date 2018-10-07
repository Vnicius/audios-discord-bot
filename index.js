const Discord = require("discord.js");
const bot = new Discord.Client();
const dotenv = require("dotenv");

const Guild = require("./model/Guild");
const configs = require("./config");
const defaultMessages = configs.defaultMessages;
const defaultCommands = configs.defaultCommands;
const getAudiosTree = require("./utils/audioUtils").getAudiosTree;
const getAudioByCommand = require("./utils/audioUtils").getAudioByCommand;
const stayInVoiceChannel = require("./utils/serverUtils").stayInVoiceChannel;
const leaveVoiceChannel = require("./utils/serverUtils").leaveVoiceChannel;
const sendAudio = require("./utils/audioUtils").sendAudio;
const hasCommand = require("./utils/commandUtils").hasCommand;
const hasDefaultCommand = require("./utils/commandUtils").hasDefaultCommand;
const getHelpMessage = require("./utils/helpUtils").getHelpMessage;

dotenv.load();

var servers = [];

const audiosTree = getAudiosTree("audios");

/**
 * Search for a server in the array
 * @param {String} serverID - server's id
 * @returns {Obejct}
 */
function getServer(serverID) {
  let result = null;

  servers.forEach(server => {
    if (server.getId() === serverID) {
      result = server;
    }
  });

  return result;
}

/**
 * Add a server in the array
 * @param {String} serverId - server's id
 */
function setServer(serverId) {
  servers.push(new Guild(serverId));
}

/**
 * Update the list of permissions in the server
 * @param {String} serverID - server's id
 * @param {String} newPermissions - role to be added
 */
function updateServerPermissions(serverID, newPermissions) {
  servers.forEach(server => {
    if (server.getId() === serverID) {
      newPermissions.forEach(permission => server.addPermission(permission));
    }
  });
}

/**
 * Add a set of roles in the server
 * @param {String} content - content of the message
 * @param {String} serverID - server's id
 * @returns {String} roles added
 */
function addRolePermission(content, serverID) {
  let permissionCommand = content.trim().split(" ");
  let roles = permissionCommand
    .slice(1)
    .filter(role => role.replace(/\s+/, "") !== "");

  servers.forEach(server => {
    if (server.getId() === serverID) {
      roles.forEach(permission => server.addPermission(permission));
    }
  });

  return roles.map(role => `**${role}**`).join(", ");
}

/**
 * Remove a set of roles in the server
 * @param {String} content - content of the message
 * @param {String} serverID - server's id
 * @returns {String} roles removed
 */
function removeRolePermission(content, serverID) {
  let permissionCommand = content.trim().split(" ");
  let roles = permissionCommand
    .slice(1)
    .filter(role => role.replace(/\s+/, "") !== "");

  servers.forEach(server => {
    if (server.getId() === serverID) {
      roles.forEach(permission => server.removePermission(permission));
    }
  });

  return roles.map(role => `**${role}**`).join(", ");
}

/**
 * Check if the member has permission to use the commands
 * @param {Object} member - user that sends the message
 * @param {Array} permissions - list of roles permissions
 * @returns {boolean}
 */
function hasPermission(member, permissions) {
  return member.roles.some(role => permissions.includes(role.name));
}

function handleCommand(message, server) {
  const { content, member, channel, guild, author } = message;
  const { permissions } = server;
  const {
    busyMessage,
    goToVoiceChannelMessage,
    permissionAddMessage,
    permissionRemoveMessage,
    listPermissionsMessage,
    nonePermissionMessage
  } = defaultMessages;
  const {
    stay,
    leave,
    help,
    addPermission,
    removePermission,
    listPermissions
  } = defaultCommands;

  // check if is a correct command
  if (hasCommand(content, audiosTree)) {
    // check if the user is in a voice channel
    if (!member.voiceChannel) {
      channel.send(goToVoiceChannelMessage);
    } else {
      // try to connect in the voice channel
      if (server.getConnection()) {
        // check if the voice channel is the same of the bot
        if (member.voiceChannel.id === server.getVChannelId()) {
          // get the audio object
          const audio = getAudioByCommand(content, audiosTree);
          sendAudio(member.voiceChannel, audio, server);
        } else {
          // if the bot is in other voice channel
          channel.send(busyMessage);
        }
      } else if (!guild.voiceConnection) {
        const audio = getAudioByCommand(content, audiosTree);
        sendAudio(member.voiceChannel, audio, server);
      } else {
        channel.send(busyMessage);
      }
    }
  } else if (content === stay.command) {
    // if the command is to stay in a voice channel
    stayInVoiceChannel(message, server);
  } else if (content === leave.command) {
    // command to leave a voice channel
    leaveVoiceChannel(message, server);
  } else if (content === help.command) {
    // send the list of commands
    author.send(getHelpMessage(audiosTree));
  } else if (content.indexOf(addPermission.command) === 0) {
    channel.send(
      `${permissionAddMessage} ${addRolePermission(content, server.getId())}`
    );
  } else if (content.indexOf(removePermission.command) === 0) {
    channel.send(
      `${permissionRemoveMessage} ${removeRolePermission(
        content,
        server.getId()
      )}`
    );
  } else if (content === listPermissions.command) {
    if (permissions.length === 0) {
      channel.send(nonePermissionMessage);
    } else {
      channel.send(
        `${listPermissionsMessage} ${permissions
          .map(role => `**${role}**`)
          .join(", ")}`
      );
    }
  }
}

bot.on("message", message => {
  const { content, guild, member, channel } = message;
  const { permissionDeniedMessage } = defaultMessages;
  let server = null;
  let permissions = [];

  if (guild) {
    // check if the server is not in the list
    if (getServer(guild.id) === null) {
      // add a new server
      setServer(guild.id);
    }
    // get the server object
    server = getServer(guild.id);
    permissions = server.getPermissions();

    // check if has any permission
    if (permissions.length === 0) {
      handleCommand(message, server);
    } else if (hasCommand(content, audiosTree) || hasDefaultCommand(content)) {
      // check if the memeber has permission
      if (hasPermission(member, permissions)) {
        handleCommand(message, server);
      } else if (member.user.id !== process.env.CLIENT_ID) {
        // send the if not the bot message
        channel.send(permissionDeniedMessage);
      }
    }
  }
});

bot.on("ready", () => {
  bot.user.setActivity(defaultMessages.listenningMessage, {
    type: "LISTENING"
  });
});

bot.login(process.env.TOKEN);
