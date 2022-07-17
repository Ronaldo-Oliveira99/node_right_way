'use strict';
const fs = require('fs');
fs.watch('target.txt', () => console.log('File changed!'));
console.log('Now watching target.txt for changes...');

// • Nos exemplos de observação de arquivos, o que acontece se o arquivo de destino não existir?
//R: o programa lançará uma exceção: Error: A file to watch must be specified!
//exceção sem tratamento interroperá o processo.

// • O que acontece se um arquivo que está sendo monitorado for excluído?
//R: executa o callback da watch function emitindo a informação sobre a alteração do arquivo 


//--------- funcionalidade de expansão ---------------------------
/* Em um exemplo inicial de nosso programa de arquivos-watcher, extraímos
o nome do arquivo(filename) para assistir(WATCH) de process.argv. Considere estas perguntas: */

//• Em vez disso, como você levaria o PROCESS para SPAWN() partir de process.argv?
//R: spawn() retorna uma instancia de ChildProcess(processo filho) permitindo que um processo pai registre funções de ouvinte 
// que são chamados quando determinados eventos ocorrem, que é um processo assincrono ou seja, não blequeia o event loop. 
// spawn lança um comando em um novo processo no qual pode-se passar isso como argumento. 

/*• Como você passaria um número arbitrário de parâmetros adicionais de processo.argv ao processo gerado 
(por exemplo,node watcher-spawn-cmd.js target.txt ls -l -h) */
//R: criar uma variavel e salvar o index dos parametros, apos isso passar paro o processo filho. 