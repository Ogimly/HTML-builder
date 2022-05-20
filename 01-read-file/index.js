const fs = require('fs');
const path = require('path');
const { stdout, stderr } = require('process');

let text = '';

const dataListener = (chunk) => {
  text += chunk;
};
const errorListener = (error) => {
  stderr.write(`error reading file: ${error}`);
};
const endListener = () => {
  stdout.write(text);
};

const fullName = path.join(__dirname, 'text.txt');
const streamRead = fs.createReadStream(fullName, 'utf-8');

streamRead.on('data', dataListener);
streamRead.on('error', errorListener);
streamRead.on('end', endListener);

//
// use pipe()
// const fullName = path.join(__dirname, 'text.txt');
// const streamRead = fs.createReadStream(fullName, 'utf-8');
//
// streamRead.pipe(stdout);

//
// use pipeline()
// const { pipeline } = require('stream');

// const fullName = path.join(__dirname, 'text.txt');
// const streamRead = fs.createReadStream(fullName, 'utf-8');
// pipeline(streamRead, stdout, (error) => {
//   if (error) {
//     stderr.write(`error reading file: ${error}`);
//   }
// });
