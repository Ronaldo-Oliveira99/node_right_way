/* Nosso aplicativo será chamado Better Book Bundle Builder (ou B4 para abreviar). */
/* Comunicará com dois índices: o índice de livros e o índice b4 */
/* Para o aplicativo B4, o índice de livros é somente leitura (não adicionaremos, excluiremos 
ou substituiremos nenhum documento nele). */
/* O índice b4 armazenará dados do usuário, incluindo os pacotes de livros 
que os usuários fizer */


"use strict";
const express = require("express");
const morgan = require("morgan");
const nconf = require("nconf");
const pkg = require("./package.json");

nconf.argv().env("__"); // deve carregar as variaveis de argumentos primeiro, depois de ambiemte
// .env
nconf.defaults({ conf: `${__dirname}/config.json` }); ;// caminho do arquivo de configuração
nconf.file(nconf.get("conf"));
const app = express();
app.use(morgan("dev"));
app.get("/api/version", (req, res) => res.status(200).send(pkg.version));
app.get("/ronaldo/luiz", (req, res) => res.status(200).send('esse é a rota do meu segundo sobrenome'));
app.get("/ronaldo/oliveira", (req, res) => res.status(200).send('esse é a rota do meu primeiro sobrenome'));

/*invoca imediatamente a função do módulo pasando o objeto de aplicativo express e 
configuração de pesquisa de Elastic.*/
require('./lib/search.js')(app, nconf.get('es'));

require('./lib/bundle.js')(app, nconf.get('es'));

// instrução do app express para escutar a porta no arquivo de configuração.
app.listen(nconf.get("port"), () => console.log("Ready."));

console.log('---------------TESTES---------------');
console.log('conf path -> ',nconf.get("conf"));
console.log('es.host -> ',nconf.get('es:host'));
console.log('es.port -> ',nconf.get('es:port'));

