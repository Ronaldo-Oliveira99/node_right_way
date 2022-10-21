'use strict';
// cherio recebe dados em xml e tranforma em json
const cheerio = require('cheerio');

module.exports = rdf => {
    const $ = cheerio.load(rdf);
    const book = {};
    //Unario plus (+) converte o resultado como um número.
    book.id = +$('pgterms\\:ebook').attr('rdf:about').replace('ebooks/','');

    // necessita escapar o (:) com uma barra invertida , e escapar tbm a propria barra invertida. \\:
    // ex: <pgterms:ebook>
    book.title = $('dcterms\\:title').text();

    book.authors = $('pgterms\\:agent pgterms\\:name')
    .toArray().map(elem => $(elem).text());

    book.subjects = $('[rdf\\:resource$="/LCSH"]')
    .parent().find('rdf\\:value')
    .toArray().map(elem => $(elem).text());

    book.lcc = $('[rdf\\:resource$="/LCC"]')
    .parent().find('rdf\\:value')
    .toArray().map(elem => $(elem).text());

    // book.subjects = $('pgterms\\:agent pgterms\\:name')
    // .toArray().map(elem => $(elem).text());

    return book;
    };
    