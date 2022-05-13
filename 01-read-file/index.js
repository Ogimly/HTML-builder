const fs = require('fs');
const path = require('path');

let text = '';

const dataListener = (chunk) => {
  text += chunk;
};
const errorListener = (error) => {
  console.error(`error reading file: ${error}`);
};
const endListener = () => {
  console.log(text);
};

const fullName = path.join(__dirname, 'text.txt');
const streamRead = fs.createReadStream(fullName, 'utf-8');

streamRead.on('data', dataListener);
streamRead.on('error', errorListener);
streamRead.on('end', endListener);
