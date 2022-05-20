const path = require('path');
const fs = require('fs');
const { readdir } = require('fs');

let folderPath = __dirname;
const withFileTypes = { withFileTypes: true };

readdir(folderPath, withFileTypes, (err, files) => {
  for (const file of files) {
    if (file.isDirectory() && file.name === 'files-copy') {
      readdir(folderPath + '\\files-copy', withFileTypes, (err, files) => {
        for (const file of files) {
          fs.unlink(folderPath + '\\files-copy\\' + file.name, () => {
            fs.rmdir(folderPath + '\\files-copy', () => {});
          });
        }
      });
    }

    if (file.isDirectory() && file.name === 'files') {
      fs.mkdir(folderPath + '\\files-copy\\', () => {
        readdir(folderPath + '\\files', withFileTypes, (err, files) => {
          for (const file of files) {
            if (file.isFile()) {
              fs.copyFile(
                folderPath + '\\files' + '\\' + file.name,
                folderPath + '\\files-copy\\' + file.name,
                () => {}
              );
            }
          }
        });
      });
    }
  }
});
