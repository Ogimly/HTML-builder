const fs = require('fs');
const path = require('path');
const process = require('process');
const { stdin: input, stdout: output } = require('process');
const readline = require('readline');

const lineListener = (input) => {
  if (input === 'exit') {
    process.exit();
  } else {
    streamWrite.write(input + '\r\n');
  }
};
const exitListener = () => {
  output.write('Yours text in text.txt. Thank you!');
  rl.close();
};

const rl = readline.createInterface({ input, output });

const fullName = path.join(__dirname, 'text.txt');
const streamWrite = fs.createWriteStream(fullName, 'utf-8');

output.write('Enter text to write to file:');

rl.on('line', lineListener);

process.on('exit', exitListener);
