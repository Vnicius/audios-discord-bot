const defaultCommands = require("../config").defaultCommands;

/**
 * Get the list of commands
 * @param {Tree} audiosTree - tree with the audios
 * @returns {Array<Object>} list of commands
 */
function getAudiosCommands(audiosTree) {
  let result = [];
  result["audios"] = [];

  // get the commands in the root
  if (audiosTree.files) {
    audiosTree.files.forEach(file => {
      result.audios.push(file.command);
    });
  }

  // get the commands in the directories
  if (audiosTree.dirs) {
    Object.keys(audiosTree.dirs).forEach(dir => {
      result[dir] = recursiveGetAudiosCommands(audiosTree.dirs[dir]);
      result[dir] = result[dir].sort();
    });
  }

  return result;
}

/**
 * Search the audios commands recursively
 * @param {Tree} audiosTree - tree with the audios
 * @returns {Array<Object>} list of commands
 */
function recursiveGetAudiosCommands(audiosTree) {
  let filesCommands = [];
  let dirsCommands = [];

  // get the commands in the root
  if (audiosTree.files) {
    audiosTree.files.forEach(file => {
      filesCommands.push(file.command);
    });
  }

  // get the commands in the directories
  if (audiosTree.dirs) {
    Object.keys(audiosTree.dirs).forEach(dir => {
      dirsCommands = dirsCommands.concat(
        recursiveGetAudiosCommands(audiosTree.dirs[dir])
      );
    });
  }

  return filesCommands.concat(dirsCommands);
}

/**
 * Return the help message
 * @param {Tree} audiosTree - tree with the audios
 * @returns {String} string in markdown syntax
 */
function getHelpMessage(audiosTree) {
  let defaultCommandsList = [];
  let commands = getAudiosCommands(audiosTree);
  let commandsTxt = "";

  // mount the help message with the default commands
  Object.keys(defaultCommands).forEach(command => {
    defaultCommandsList.push(
      `${defaultCommands[command].command} - ${
        defaultCommands[command].description
      }`
    );
  });

  // mount the help message with the audios commands
  Object.keys(commands).forEach(commandType => {
    let name = commandType[0].toUpperCase() + commandType.slice(1);
    let commandsList = commands[commandType];

    if (commandsList.length !== 0) {
      commandsTxt += `\n**${name}**\n \`\`\``;
      commandsList.forEach(commandName => {
        commandsTxt += `${commandName}\n`;
      });

      commandsTxt += "```";
    }
  });

  return (
    `\n**Default**\n\n\`\`\`${defaultCommandsList.join("\n")} \`\`\`` +
    commandsTxt
  );
}

module.exports = { getHelpMessage };
