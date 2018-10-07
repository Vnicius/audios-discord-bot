const Tree = require("../model/Tree");
const defaultCommands = require("../config").defaultCommands;

/**
 * Check if a message is in the list of commands
 * @param {String} command - command in the message
 * @returns {boolean} If any file has the same command
 */
function inCommandsList(command, filesList) {
  if (filesList.length != 0) {
    return filesList.findIndex(file => file.command === command) !== -1;
  }

  return false;
}

/**
 * Check if has the command recursively
 * @param {String} command - text with the command
 * @param {Tree} audiosList - tree with audios
 * @returns {boolean} Boolean if the system has or not the command
 */
function recursiveInAudiosList(command, audiosList) {
  let hasFileWithCommand = false;
  let hasDirWithCommand = false;

  if (audiosList.files) {
    hasFileWithCommand = inCommandsList(command, audiosList.files);
  }

  if (audiosList.dirs) {
    Object.keys(audiosList.dirs).forEach(dir => {
      if (recursiveInAudiosList(command, audiosList.dirs[dir])) {
        hasDirWithCommand = true;
      }
    });
  }

  return hasFileWithCommand || hasDirWithCommand;
}

/**
 * Check if the system has the command
 * @param {String} command - text with the command
 * @param {Tree} audiosList - tree with audios
 * @returns {boolean} Boolean if the system has or not the command
 */
function hasCommand(command, audiosList) {
  return recursiveInAudiosList(command, audiosList);
}

/**
 * Check if the command exist in the default commands
 * @param {String} command - text with the command
 * @returns {boolean} if the default command exit or not
 */
function hasDefaultCommand(command) {
  return (
    Object.keys(defaultCommands).filter(cmd => cmd.command === command) !== 0
  );
}

module.exports = {
  hasCommand,
  hasDefaultCommand
};
