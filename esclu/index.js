"use strict";
const fs = require("fs");
const request = require("request");
const program = require("commander");
const pkg = require("./package.json");

const fullUrl = (path = "") => {
  // retorna a URL completo
  let url = `http://${program.host}:${program.port}/`;
  if (program.index) {
    url += program.index + "/";
    if (program.type) {
      url += program.type + "/";
    }
  }
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
  .option('-f, --filter <filter>', 'source filter for query results');

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
    request.put(fullUrl(), handleResponse); // solicitação put
  });

program
  .command("list-indices")
  .alias("li")
  .description("Obtem uma lista de indices neste cluester")
  .action(() => {
    const path = program.json ? "_all" : "_cat/indices?v";
    request({ url: fullUrl(path), json: program.json }, handleResponse);
  });

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

program.parse(process.argv);
if (!program.args.filter((arg) => typeof arg === "object").length) {
  program.help();
}
