const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');
const { stdout, stderr } = require('process');

const dirSrc = path.join(__dirname, 'styles');
const dirDist = path.join(__dirname, 'project-dist');
const styleFileName = 'bundle.css';

async function mergeStyles() {
  try {
    const fullName = path.join(dirDist, styleFileName);
    const streamWrite = fs.createWriteStream(fullName, 'utf-8');

    const files = await fsPromises.readdir(dirSrc, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile()) {
        const fullName = path.join(dirSrc, file.name);

        let ext = path.extname(fullName);
        if (ext === '.css') {
          let text = '';
          const streamRead = fs.createReadStream(fullName, 'utf-8');

          streamRead.on('data', (chunk) => (text += chunk));
          streamRead.on('error', (error) => stderr.write(`error reading file: ${error}`));
          streamRead.on('end', () => {
            streamWrite.write(text);
            stdout.write(`${file.name} -> ${styleFileName}` + '\r\n');
          });
        }
      }
    }
  } catch (err) {
    stderr.write(`Error: ${err}`);
  }
}

mergeStyles();
