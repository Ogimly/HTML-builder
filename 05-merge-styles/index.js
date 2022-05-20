const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');
const { stdout, stderr } = require('process');

const dirSrc = path.join(__dirname, 'styles');
const dirDist = path.join(__dirname, 'project-dist');
const styleFileName = 'bundle.css';

async function mergeStyles(dirSrc, dirDist, styleFileName) {
  const fullName = path.join(dirDist, styleFileName);

  const streamWrite = fs.createWriteStream(fullName, 'utf-8');

  const files = await fsPromises.readdir(dirSrc, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile()) {
      const fullName = path.join(dirSrc, file.name);

      let ext = path.extname(fullName);
      if (ext === '.css') {
        const streamRead = fs.createReadStream(fullName, 'utf-8');

        stdout.write(`${file.name} -> ${styleFileName}\r\n`);
        streamRead.pipe(streamWrite);
      }
    }
  }
  return true;
}

(async () => {
  try {
    await mergeStyles(dirSrc, dirDist, styleFileName);
    stdout.write('Done. New styles file is ' + path.join(dirDist, styleFileName));
  } catch (err) {
    stderr.write('Failed. ' + err);
  }
})();
