"use strict";
const fs = require("fs");
const request = require("request");
const program = require("commander");
const pkg = require("./package.json");

const fullUrl = (path = "") => {
  // retorna a URL completo
  let url = `http://${program.host}:${program.port}/`;
  //let url = `http://${program.host}:${program.port}/${path}/`;
  if (program.index) {
    url += program.index + "/";
    if (program.type) {
      url += program.type + "/";
    }
    if (program.id) {
      url += program.id + "/";
    }
  }
  return url + path.replace(/^\/*/, "");
  return url + path.replace(/^\/*/, "");
};

const handleResponse = (err, res, body) => {
  if (program.json) {
    console.log(JSON.stringify(err || body));
  } else {
    if (err) throw err;
    console.log(body);
  }
};

program
  .version(pkg.version)
  .description(pkg.description)
  .usage("[options] <command> [...]")
  .option("-o, --host <hostname>", "hostname [localhost]", "localhost")
  .option("-p, --port <number>", "port number [9200]", "9200")
  .option("-j, --json", "format output as JSON")
  .option("-i, --index <name>", "which index to use")
  .option("-t, --type <type>", "default type for bulk operations")
  .option('-f, --filter <filter>', 'source filter for query results')
  .option('-id, --id <id>', 'id to retrieve a book for id');

program
  .command("url [path]")
  .description("gera a URL para as opções e caminho (o padrão é /)")
  .action((path = "/") => console.log(fullUrl(path)));

program
  .command("get [path]")
  .description("executa uma solicitação HTTP GET para o caminho (o padrão é /)")
  .action((path = "/") => {
    const options = {
      url: fullUrl(path),
      json: program.json,
    };
    request(options, (err, res, body) => {
      if (program.json) {
        console.log(JSON.stringify(err || body));
      } else {
        if (err) throw err;
        console.log(body);
      }
    });
  });

program
  .command("create-index")
  .description("create an index")
  .action(() => {
    if (!program.index) {
      // se o usuario especificou um indice com o sinalizador --index
      const msg = "No index specified! Use --index <name>";
      if (!program.json) throw Error(msg); // e o usuario especificou um indice com o sinalizador --json
      console.log(JSON.stringify({ error: msg }));
      return;
    }
    //console.log('teste_path', fullUrl())
    //console.log('program_teste', program.index)
    request.put(fullUrl(), handleResponse); // solicitação put
  });

program
  .command("list-indices")
  .alias("li")
  .description("Obtem uma lista de indices neste cluster")
  .action(() => {
    const path = program.json ? "_all" : "_cat/indices?v";
    request({ url: fullUrl(path), json: program.json }, handleResponse);
  });

  // carregar documentos em massa
program
  .command("bulk <file>") // parametro obrigatório
  .description("read and perform bulk options from the specified file")
  .action((file) => {
    fs.stat(file, (err, stats) => { // verifica de forma assincrona
      if (err) {
        if (program.json) {
          console.log(JSON.stringify(err));
          return;
        }
        throw err;
      }
      const options = { // opções para solicitação
        url: fullUrl("_bulk"),
        json: true,  // esperamos receber json
        headers: {
          "content-length": stats.size,
          "content-type": "application/json",
        },
      };
      const req = request.post(options); // será usado como fluxo gravável.
      // recebimento da resposta do servidor (fluxo legivel) -> passar o caminho do arquivo para iniciar o fluxo
      const stream = fs.createReadStream(file); 

      // pipe = canalizar para um objeto de solicitação
      stream.pipe(req);

      // canalizamos a saída do objeto de solicitação diretamente para process.stdout.
      req.pipe(process.stdout);
    });
  });

program
  .command('query [queries...]')
  .alias('q')
  .description('perform an Elasticsearch query')
  .action((queries = []) => {
    const options = {
      url: fullUrl('_search'),
      json: program.json,
      qs: {},
    };
    if (queries && queries.length) {
      options.qs.q = queries.join(' ');
    }
    if (program.filter) {
      options.qs._source = program.filter;
    }
  request(options, handleResponse);
});

/*  Exercicio 1 - implemente um novo comando chamado delete-index, que 
 verifica  um índice especificado com o sinalizador --index e emite uma 
 solicitação HTTP DELETE para removelo */
program
  .command("delete-index")
  .description("delete an index")
  .action(() => {
    if (!program.index) {
      // se o usuario especificou um indice com o sinalizador --index
      const msg = "No index specified! Use --index <name>";
      if (!program.json) throw Error(msg); // e o usuario especificou um indice com o sinalizador --json
      console.log(JSON.stringify({ error: msg }));
      return;
    }
    console.log('deletando o indice...')
    request.delete(fullUrl(), handleResponse); // solicitação delete
  });

  /*  Exercicio 2 - Adicionar um novo comando chamado put. que insere um 
  novo documento para indexação(ou substitui o documento existente se houver
  uma colisão). 
  EX: Recuperar um livro pelo _id:
  $./esclu get pg132 --index books --type book | jq '.'
  Salvar um documento em um arquivo:
  $./esclu get pg132 -i books -t book | jq '._source' > ../data/art_of_war.json
  
  Idelmente, devemos ser capazer de reinserir o documento do arquivo usando o 
  seguinte comando:
  $ ./esclu put ../data/art_of_war.json -i books -t book --id pg132
  
  Para fazer isso funcionar, voce precisará de fazer o seguinte:
  - Adicione um novo sinalizador opcional --d.
  - Atualize a função fullUrl() para anexar o ID na URL retornada.
  - Adicione um novo comando chamado put que recebe um único parâmentro
  obrigatório chamado file( o mesmo que o comando bulk)
  - Dentro do callback action() do seu novo comando, asegure que um ID
  foi especificado ou falhe ruidosamente.
  - Transmita o conteúdo do arquivo para o elasticsearch por meio do 
  objeto de solicitação e transmitir os resultados para a saída padrão.

  */

  program
  .command("put <file>") // parametro obrigatório
  .description("executa uma solicitação HTTP GET para o caminho (o padrão é /)")
  .action((file) => {
      fs.stat(file, (err, stats) => { // verifica de forma assincrona
        if (err) {
          if (program.id) {
            console.log(JSON.stringify(err));
            return;
          }
          throw err;
        }
        // const options = { // opções para solicitação
        //   url: fullUrl("_bulk"),
        //   json: true,  // esperamos receber json
        //   headers: {
        //     "content-length": stats.size,
        //     "content-type": "application/json",
        //   },
        // };
        // const req = request.post(options); // será usado como fluxo gravável.
        // recebimento da resposta do servidor (fluxo legivel) -> passar o caminho do arquivo para iniciar o fluxo
        //const stream = fs.createReadStream(file); 
  
        // pipe = canalizar para um objeto de solicitação
        //stream.pipe(req);
  
        // canalizamos a saída do objeto de solicitação diretamente para process.stdout.
       // req.pipe(process.stdout);
      });
    // console.log('teste',path)
    // console.log('teste2',fullUrl(path))
    console.log('teste=3',program.id)
  });
  
  program.parse(process.argv); 
if (!program.args.filter((arg) => typeof arg === "object").length) {
  program.help();
}
