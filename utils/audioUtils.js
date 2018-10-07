const fs = require("fs");
const Tree = require("../model/Tree");
const Audio = require("../model/Audio");

/**
 * Get all audios in the path as object
 * @param {String} path - path of the directory with the audios files
 * @returns {Tree}
 */
function getAudiosTree(path) {
  let tree = new Tree();
  recursiveDirs(tree, path);
  return tree;
}

/**
 * Mount the tree of file recursively
 * @param {Tree} tree - tree with the
 * @param {String} path - path of the directory with the audios files
 */
function recursiveDirs(tree, path) {
  let files = fs.readdirSync(path);

  files.forEach(fileName => {
    let dotIndex = fileName.indexOf(".");

    if (dotIndex !== -1) {
      let type = fileName.slice(dotIndex + 1, fileName.length);

      if (type !== "md") {
        let command = fileName.slice(0, dotIndex);
        tree.files.push({
          command: `.${command}`,
          file: `${path}/${fileName}`,
          type: type
        });
      }
    } else {
      if (!tree.dirs) {
        tree.dirs = {};
      }

      tree.dirs[fileName] = new Tree();
      recursiveDirs(tree["dirs"][fileName], path + "/" + fileName);
    }
  });
}

/**
 * Search a audio in the list of audios
 * @param {String} command - command in the message
 * @param {Tree} audiosTress - audio's tree
 * @returns {Audio} audio object ou null if not find
 */
function getAudioByCommand(command, audiosTree) {
  return recursiveGetAudioByCommand(command, audiosTree);
}

/**
 * Get the audio object in a list by a command
 * @param {String} command - command in the message
 * @param {Array<Tree>} audiosList - array with audios object
 * @returns {Audio} audio object ou null if not find
 */
function getAudio(command, audiosList) {
  let result = null;

  if (audiosList.length !== 0) {
    audiosList.forEach(audio => {
      if (audio.command === command) {
        result = audio;
      }
    });
  }

  return result;
}

/**
 * Search a audio in the audio's tree recursively
 * @param {String} command - command in the message
 * @param {Tree} audiosTrees - audio's tree
 * @returns {Audio} audio object ou null if not find
 */
function recursiveGetAudioByCommand(command, audiosTree) {
  let audio = null;

  // check if any audio with the command
  if (audiosTree.files) {
    audio = getAudio(command, audiosTree.files);
  }

  // if no find a audio
  if (!audio && audiosTree.dirs) {
    // search in the directories
    Object.keys(audiosTree.dirs).forEach(dir => {
      let audioInDir = recursiveGetAudioByCommand(
        command,
        audiosTree.dirs[dir]
      );
      if (audioInDir && !audio) {
        audio = audioInDir;
      }
    });
  }

  return audio;
}

/**
 * Send the audio to the voice channel
 * @param {Object} voiceChannel - user's voice channel
 * @param {object} audio - audio object
 * @param {Object} server - server context
 */
function sendAudio(voiceChannel, audio, server) {
  // connect to de server
  if (server.getConnection() === null) {
    // enter in the voice channel
    voiceChannel.join().then(connection => {
      var dispatcher;
      // send the audio
      if (audio.type === "ogg") {
        dispatcher = connection.playStream(fs.createReadStream(audio.file), {
          type: audio.type
        });
      } else {
        dispatcher = connection.playStream(audio.file);
      }

      // end the connection
      dispatcher.on("end", () => {
        connection.disconnect();
        voiceChannel.leave();
      });
    });
  } else {
    // if is connected
    if (audio.type === "ogg") {
      server.getConnection().playStream(fs.createReadStream(audio.file), {
        type: audio.type
      });
    } else {
      server.getConnection().playStream(audio.file);
    }
  }
}

module.exports = { getAudiosTree, getAudioByCommand, sendAudio };
