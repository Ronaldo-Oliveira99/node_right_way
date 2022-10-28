/**
 * Provides API endpoints for searching the books index.
 * Estabelecer a URL que será a chave para realizar pesquisas no índice de livros.
 */
"use strict";
const request = require("request");
const rp = require('request-promise');

module.exports = (app, es) => {
  const url = `http://${es.host}:${es.port}/${es.books_index}/book/_search`;

  /**
   * Search for books by matching a particular field value.
   * Example: /api/search/books/authors/Twain
   * $ curl -s localhost:60702/api/search/books/authors/Shakespeare | jq '.[].title'
   */
  app.get("/api/search/books/:field/:query", (req, res) => {
    
    // corpo para a solicitação elasticsearch
    const esReqBody = {
      size: 20, // limite de documentos.

      // ex: api/search/books/authors/Twain
      //query.match -> authors : Twain
      query: {
        match: {
          // computed property name -> [req.params.field]
          //:field
          [req.params.field]: req.params.query,
        },
      },
    };

    //objeto de requisição
    const options = ({ url, json: true, body: esReqBody });
   
    //1. solicitação para o elasticsearch 
    //2. (req, res => express), (esReq, esRes => elasticsearch)
    //3. objeto de opçoes, e callback para manipular as respostas
    request.get(options, (err, esRes, esResBody) => {
      
      //conexão falha do elasticsearch
      if (err) {
        res.status(502).json({ 
          error: "bad_gateway",
          reason: err.code,
        });
        return;
      }
      // algum codigo de erro do elasticsearch.
      // indice de livros nao pode ser criado.
      if (esRes.statusCode !== 200) { 
        res.status(esRes.statusCode).json(esResBody);
        return;
      }
      // se não houver erro m extraimos apenas o objeto _source
      res.status(200).json(esResBody.hits.hits.map(({ _source }) => _source));
    });
  });

  /**
   * Collect suggested terms for a given field based on a given query.
   * Example: /api/suggest/authors/lipman
   */
  app.get("/api/suggest/:field/:query", (req, res) => {
   
    const esReqBody = {
      size: 0,
      suggest: {
        suggestions: {
          text: req.params.query,
          term: {
            field: req.params.field,
            suggest_mode: "always",
          },
        },
      },
    };

    // request-promise
    rp({ url, json: true, body: esReqBody })
      .then((esResBody) => res.status(200).json(esResBody.suggest.suggestions))
      .catch(({ error }) => res.status(error.status || 502).json(error));
  });
};
