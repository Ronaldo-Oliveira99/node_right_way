'use strict';
const fs = require('fs');
const spawn = require('child_process').spawn;
const filename = process.argv[2];

    if (!filename) {
        throw Error('A file to watch must be specified!');
    }

fs.watch(filename,() => {
    const ls = spawn('ls', ['-l', '-h', filename]);

    ls.stdout.pipe(process.stdout);
    
});

console.log(`Now watching ${filename} for changes...`);

//RESULTADO:  -rw-r--r-- 1 rluiz 197609 0 mar  5 17:04 target.txt


// TESTE PARAMENTROS EM PROCESSOS FILHOS

// 'use strict';
// const fs = require('fs');
// const spawn = require('child_process').spawn;
// const filename = process.argv[2];
// const lss = process.argv[3];
// const l = process.argv[4];
// const h = process.argv[5];

//     if (!filename) {
//         throw Error('A file to watch must be specified!');
//     }

// fs.watch(filename,() => {
//     const ls = spawn(lss,[l,h,filename ]);

//     //ls.stdout.pipe(process.stdout);

//     ls.stdout.on('data', (data) => {
//         console.log(`stdout: ${data}`)
//       })
// })
// console.log(`Now watching ${filename} for changes...`);


// let child = spawn(process.argv[2], process.argv.slice(3));
// child.stdout.pipe(process.stdout);


// const fs = require('fs');
// const filename = process.argv[2];
// if (!filename) {
// throw Error('A file to watch must be specified!');
// }
// fs.watch(filename, () => console.log(`File ${filename} changed!`));
// console.log(`Now watching ${filename} for changes...`);
