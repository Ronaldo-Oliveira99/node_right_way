/**
 * Provides API endpoints for working with book bundles.
 */
"use strict";
const rp = require("request-promise");
module.exports = (app, es) => {
  const url = `http://${es.host}:${es.port}/${es.bundles_index}/bundle`;

  /**
   * Create a new bundle with the specified name.
   * curl -X POST http://<host>:<port>/api/bundle?name=<name>
   * curl -s -X POST localhost:60702/api/bundle?name=light%20reading | jq '.'
   */
  app.post("/api/bundle", (req, res) => {
    const bundle = {
      name: req.query.name || "",
      books: [],
    };
    rp.post({ url, body: bundle, json: true })
      .then((esResBody) => res.status(201).json(esResBody))
      .catch(({ error }) => res.status(error.status || 502).json(error));
  });

  

  /**
   * Retrieve a given bundle.
   * curl http://<host>:<port>/api/bundle/<id>
   * curl -s localhost:60702/api/bundle/no-such-bundle | jq '.'  -> index inexistente
   * curl -s localhost:9200/b4/bundle/$BUNDLE_ID | jq '.'  -> direto no elasticsearch
   * curl -s localhost:60702/api/bundle/$BUNDLE_ID | jq '.' -> rota pelo express
   * 
   * declarar uma variável de ambiente no terminal para auxiliar nas rotas
   * BUNDLE_ID = AYOUllCV_0gE4Hq63alk  ->  echo $BUNDLE_ID
   * 
   *  curl -s localhost:9200/b4/bundle/_search?size=1000 | jq '.' busca todos ids
   */
  app.get("/api/bundle/:id", async (req, res) => {
    const options = {
      url: `${url}/${req.params.id}`,
      json: true,
    };
    try {
      // para lidar com os modos de sucesso e falha da solicita ção do ElasticSearch.
      // Emitimos a própria solicitação do elasticsearch com a expressão await rp(options)
      // await faz com que a função assincrona seja suspensa enquanto aguarda a solicitação de promessa.
      const esResBody = await rp(options);
      res.status(200).json(esResBody);
    } catch (esResErr) {
      res.status(esResErr.statusCode || 502).json(esResErr.error);
    }
  });

  //----------------------TESTES------------------------------------------------
  app.get("/api/bundle_teste", async (req, res) => {
    const options = {
      url: `${url}`,
      json: true,
    };
    try {
      //const esResBody = await rp(options);
      res.status(200).json('esResBody');
     
    } catch (err) {
      res.status(statusCode || 502).json(err);
    }
  });
//----------------------TESTES-----------------------------------------------


  /**
   * BAD IMPLEMENTATION! async Express handler without a try/catch block.
   * TESTE DE USO DE FUNÇÃO ASSINCRONA SEM TRY CATCH
   * curl -v localhost:60702/api/bundle2/no-such-bundle
   *

   */
  app.get("/api/bundle2/:id", async (req, res) => {
    const options = {
      url: `${url}/${req.params.id}`,
      json: true,
    };
    const esResBody = await rp(options);
    res.status(200).json(esResBody);
  });

  /**
   *  Defina o nome do pacote especificado com o nome especificado.
   * curl -X PUT http://<host>:<port>/api/bundle/<id>/name/<name>
   * curl -s -X PUT localhost:60702/api/bundle/$BUNDLE_ID/name/foo | jq '.'
   * curl -s localhost:60702/api/bundle/$BUNDLE_ID | jq '._source'
   */
  app.put("/api/bundle/:id/name/:name", async (req, res) => {
    // Url baseada no id fornecido
    const bundleUrl = `${url}/${req.params.id}`;

    // solicitações e tratamento de respostas elasticsearch
    try {
      const bundle = (await rp({ url: bundleUrl, json: true }))._source;
      // assim que tivermos o objeto, sobrescrevemos com o valor do paramentro
      bundle.name = req.params.name;
      const esResBody = await rp.put({
        url: bundleUrl,
        body: bundle,
        json: true,
      });
      res.status(200).json(esResBody);
    } catch (esResErr) {
      res.status(esResErr.statusCode || 502).json(esResErr.error);
    }
  });

  /**
   *  Coloca um livro em um pacote pelo seu id.
   * curl -X PUT http://<host>:<port>/api/bundle/<id>/book/<pgid>
   * curl -s -X PUT localhost:60702/api/bundle/$BUNDLE_ID/book/pg132 | jq '.'
   */
  app.put("/api/bundle/:id/book/:pgid", async (req, res) => {
    const bundleUrl = `${url}/${req.params.id}`;
    const bookUrl =
      `http://${es.host}:${es.port}` +
      `/${es.books_index}/book/${req.params.pgid}`;
    try {
      /**
       * Requisição para o pacote(bundle) e livros(book) em paralelo.
       * Promisse.all pega um array de promises, um objeto iteravel contendo promises
       * o valor retornado de promise.all sera a matriz com valores passados na mesma ordem
       */

      const [bundleRes, bookRes] = await Promise.all([
        rp({ url: bundleUrl, json: true }),
        rp({ url: bookUrl, json: true }),
      ]);

      // Extraia informações do pacote e do livro das respostas.
      const { _source: bundle, _version: version } = bundleRes;
      const { _source: book } = bookRes;

      const idx = bundle.books.findIndex((book) => book.id === req.params.pgid);
      if (idx === -1) {
        bundle.books.push({
          id: req.params.pgid,
          title: book.title,
        });
      }
      // Coloca o pacote atualizado de volta no índice do pacote.
      const esResBody = await rp.put({
        url: bundleUrl,
        qs: { version },
        body: bundle,
        json: true,
      });
      res.status(200).json(esResBody);
    } catch (esResErr) {
      res.status(esResErr.statusCode || 502).json(esResErr.error);
    }
  });

  //-- EXERCICIOS --
  /**
   *  Excluir um pacote completamente.
   * curl -X DELETE http://<host>:<port>/api/bundle/<id>
   * curl -s -X DELETE localhost:60702/api/bundle/$BUNDLE_ID/name/foo | jq '.'
   * curl -s -X DELETE localhost:60702/api/bundle/$BUNDLE_ID | jq '._source'
   */
  app.delete("/api/bundle/:id", async (req, res) => {
    // 1- Determine o URL do pacote com base no objeto de configuração (es) e na parâmetros de solicitação.
    // 2- Use await com uma chamada para rp() para suspender até que a exclusão seja concluída.
    // 3- Envolva sua chamada await em um bloco try/catch para lidar com quaisquer erros.
    //Dica: use o método rp.delete() para enviar uma solicitação HTTP DELETE ao Elasticsearch.

    const options = {
      url: `${url}/${req.params.id}`,
      json: true,
    };

    try {
      const esResBody = await rp.delete(options);
      res.status(202).json(esResBody);
    } catch (esResErr) {
      res.status(esResErr.statusCode || 502).json(esResErr.error);
    }
  });

  /**
   * Remova um livro de um pacote.
   * curl -X DELETE http://<host>:<port>/api/bundle/<id>/book/<pgid>
   * curl -s -X DELETE localhost:60702/api/bundle/$BUNDLE_ID/book/pg132 | jq '.'
   */
  //app.delete("/api/bundle/:id/book/:pgid", async (req, res) => {
    app.delete("/api/bundle/:id/book/:pgid", async (req, res) => {
    const bundleUrl = `${url}/${req.params.id}`;

    try {
      // 1- Use await com rp() para recuperar o objeto bundle do Elasticsearch. •
      // 2- Encontre o índice do livro na lista bundle.books .
      // 3- Remova o livro da lista. (Dica: use Array.splice().)
      // 4- COLOQUE(PUT) o objeto bundle atualizado de volta no índice Elasticsearch, novamente com await e rp().
    
        const bundleRes = await rp({ url: bundleUrl, json: true });
        const { _source: bundle, _version: version } = bundleRes;

        const idx = bundle.books.findIndex((book) => book.id === req.params.pgid);
        if (idx !== -1) {
          bundle.books.splice({
            id: req.params.pgid,
          });
        }
        const esResBody = await rp.put({
          url: bundleUrl,
          qs: { version },
          body: bundle,
          json: true,
        });
        res.status(202).send({esResBody});

    
    }  catch (esResErr) {
      res.status(esResErr.statusCode || 502).json(esResErr.error);
    }
  });
};
