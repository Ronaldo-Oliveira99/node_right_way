"use strict";

// 1. Percorra o diretório data/cache/epub procurando por arquivos que terminem em .rdf.
// 2. Leia cada arquivo RDF.
// 3. Execute o conteúdo RDF por meio de parseRDF().
// 4. Colete os objetos serializados JSON em um único arquivo em massa para inserção.

const dir = require("node-dir");
const parseRDF = require("./lib/parse-rdf.js");

// pegar o caminho na posição 2 do comando no console => ex: /media/ronaldo/16C282B7C2829B1F/estudos/node/right_way/data/cache/epub/
const dirname = process.argv[2];

const options = {
  match: /\.rdf$/, // Corresponde aos nomes de arquivos que estão em '.rdf'.
  exclude: ["pg0.rdf"], // Ignore the template RDF file (ID = 0).
};

// content é o retorno com o arquivo rdf encontrado
dir.readFiles(dirname, options, (err, content, next) => {
  if (err) throw err;

  //console.log('content', content);
  const doc = parseRDF(content);
  console.log('content', doc);
  console.log(JSON.stringify({ index: { _id: `pg${doc.id}` } }));
  console.log(JSON.stringify(doc));
  next();
});

//capturar eventos de erro no fluxo process.stdout 
process.stdout.on("error", (err) => {
  if (err.code === "EPIPE") {
    process.exit();
  }
  throw err; // Or take any other appropriate action.
});
