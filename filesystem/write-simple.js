// ABORDAGEM SOB UM ARQUIVO DE ESCRITA INTEIRO

'use strict';
const fs = require('fs');
fs.writeFile('target.txt', 'hello world', (err) => {
    if (err) {
        throw err;
    }
console.log('File saved!');
});