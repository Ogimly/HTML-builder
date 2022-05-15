const fsPromises = require('fs/promises');
// const fs = require('fs');
const path = require('path');
const { stdout, stderr } = require('process');

async function copyFiles(pathSrc, pathDest) {
  try {
    const files = await fsPromises.readdir(pathSrc, { withFileTypes: true });

    for (const file of files) {
      let pathSrcNew = path.join(pathSrc, file.name);
      let pathDestNew = path.join(pathDest, file.name);

      if (file.isFile()) {
        try {
          await fsPromises.copyFile(pathSrcNew, pathDestNew);
        } catch (err) {
          stderr.write(`Error copy file: ${err}`);
        }
      } else {
        copyFiles(pathSrcNew, pathDestNew);
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

const dirSrc = path.join(__dirname, 'files');
const dirDest = path.join(__dirname, 'files-copy');

async function start() {
  try {
    await copyDir(dirSrc, dirDest);
    stdout.write('Directory copying finished. Thank you!');
  } catch (err) {
    stderr.write('Error! ');
  }
}

start();
