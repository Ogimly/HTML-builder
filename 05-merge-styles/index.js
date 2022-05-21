const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');
const { stdout, stderr } = require('process');

const dirSrc = path.join(__dirname, 'styles');
const dirDist = path.join(__dirname, 'project-dist');
const styleFileName = 'bundle.css';

// node 04-copy-directory -с off||on
// default value 'on' -> true
const commentStatus = () => {
  const index = process.argv.indexOf('-c');
  return index === -1 ? true : !(process.argv[index + 1] === 'off');
};

const mergeStyles = async (dirSrc, dirDist, styleFileName, commentStatus = true) => {
  const fullName = path.join(dirDist, styleFileName);

  const streamWrite = fs.createWriteStream(fullName, 'utf-8');

  const files = await fsPromises.readdir(dirSrc, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile()) {
      const fileName = path.join(dirSrc, file.name);

      if (path.extname(fileName) === '.css') {
        const streamRead = fs.createReadStream(fileName, 'utf-8');

        if (commentStatus) stdout.write(`merge ${fileName} -> ${fullName}\r\n`);
        streamRead.pipe(streamWrite);
      }
    }
  }
  return true;
};

(async () => {
  try {
    await mergeStyles(dirSrc, dirDist, styleFileName, commentStatus());
    stdout.write('Done. New styles file is ' + path.join(dirDist, styleFileName));
  } catch (err) {
    stderr.write('Failed. ' + err);
  }
})();
