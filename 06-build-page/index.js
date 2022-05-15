const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');
const { stdout, stderr } = require('process');

const dirDist = path.join(__dirname, 'project-dist');

const dirAssets = path.join(__dirname, 'assets');
const dirDistAssets = path.join(dirDist, 'assets');

const dirStyles = path.join(__dirname, 'styles');
const fileStyle = path.join(dirDist, 'style.css');

const dirComponents = path.join(__dirname, 'components');
const fileTemplate = path.join(__dirname, 'template.html');
const fileIndex = path.join(dirDist, 'index.html');

const promises = [];
const components = [];

async function mergeStyles(dirSrc, fileStyle) {
  try {
    const streamWrite = fs.createWriteStream(fileStyle, 'utf-8');

    const files = await fsPromises.readdir(dirSrc, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile()) {
        const fullName = path.join(dirSrc, file.name);

        let ext = path.extname(fullName);
        if (ext === '.css') {
          let text = '';
          const streamRead = fs.createReadStream(fullName, 'utf-8');

          streamRead.on('data', (chunk) => (text += chunk));
          streamRead.on('error', (err) => stderr.write(`Error reading file: ${err}`));
          streamRead.on('end', () => {
            streamWrite.write(text);
            stdout.write(`merge ${file.name} -> ${fileStyle}` + '\r\n');
          });
        }
      }
    }
  } catch (err) {
    stderr.write(`Error: ${err}`);
  }
}

async function copyFiles(pathSrc, pathDest) {
  try {
    const files = await fsPromises.readdir(pathSrc, { withFileTypes: true });

    for (const file of files) {
      let pathSrcNew = path.join(pathSrc, file.name);
      let pathDestNew = path.join(pathDest, file.name);

      stdout.write(`copy ${file.name} -> ${pathDestNew}` + '\r\n');

      if (file.isFile()) {
        try {
          await fsPromises.copyFile(pathSrcNew, pathDestNew);
        } catch (err) {
          stderr.write(`Error copy file: ${err}`);
        }
      } else {
        copyDir(pathSrcNew, pathDestNew);
      }
    }
  } catch (err) {
    stderr.write(`Error reading dir: ${err}`);
  }
}
async function copyDir(dirSrc, dirDest) {
  try {
    await fsPromises.rm(dirDest, { recursive: true, force: true });

    try {
      await fsPromises.mkdir(dirDest, { recursive: true });

      copyFiles(dirSrc, dirDest);
    } catch (err) {
      stderr.write(`Error creating dir: ${err}`);
    }
  } catch (err) {
    stderr.write(`Error removing dir: ${err}`);
  }
}

async function readComponent(fullName) {
  return new Promise((resolve, reject) => {
    let text = '';
    const streamRead = fs.createReadStream(fullName, 'utf-8');

    streamRead.on('data', (chunk) => (text += chunk));
    streamRead.on('error', (err) => reject(err));
    streamRead.on('end', () => {
      resolve({ name: path.basename(fullName, '.html'), text: text });
    });
  });
}

async function writeHTML(text, components, fileIndex) {
  components.forEach((component) => {
    text = text.split(`{{${component.name}}}`).join(component.text);
  });

  const streamWrite = fs.createWriteStream(fileIndex, 'utf-8');
  streamWrite.write(text);
  stdout.write(`build ${fileIndex}` + '\r\n');
}

async function buildHTML(fileTemplate, dirComponents, fileIndex) {
  try {
    const files = await fsPromises.readdir(dirComponents, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile()) {
        const fullName = path.join(dirComponents, file.name);

        let ext = path.extname(fullName);
        if (ext === '.html') {
          try {
            promises.push(readComponent(fullName));
          } catch (err) {
            stderr.write(`Error reading components: ${err}`);
          }
        }
      }
    }

    Promise.allSettled(promises).then((results) => {
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          components.push(result.value);
        } else {
          stderr.write(`Error reading components: ${result.reason}`);
        }
      });

      const streamRead = fs.createReadStream(fileTemplate, 'utf-8');
      let text = '';

      streamRead.on('data', (chunk) => (text += chunk));
      streamRead.on('error', (error) => stderr.write(`error reading file: ${error}`));
      streamRead.on('end', () => writeHTML(text, components, fileIndex));
    });
  } catch (err) {
    stderr.write(`Error reading dir: ${err}`);
  }
}

async function webpack() {
  try {
    await fsPromises.rm(dirDist, { recursive: true, force: true });

    try {
      await fsPromises.mkdir(dirDist, { recursive: true });

      await buildHTML(fileTemplate, dirComponents, fileIndex);

      await copyDir(dirAssets, dirDistAssets);

      await mergeStyles(dirStyles, fileStyle);
    } catch (err) {
      stderr.write(`Error creating dir: ${err}`);
    }
  } catch (err) {
    stderr.write(`Error removing dir: ${err}`);
  }
}

webpack();
