comandos: 

O Project Gutenberg produz pacotes de download de catálogos que contêm arquivos 
Resource Description Framework (RDF) para cada um de seus mais de 53.000 livros. (RDF 
é um formato baseado em XML.) A versão compactada bz2 do arquivo de catálogo tem cerca 
de 40 MB. Totalmente extraído, contém pouco mais de 1 GB de arquivos RDF.
 
baixar or arquivos de dados brutos do projeto Gutenberg:
$ curl -O http://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2
$ tar -xvjf rdf-files.tar.bz2

Isso criará um diretório de cache que contém todos os arquivos RDF. Cada ficheiro RDF tem 
o nome do seu ID do Project Gutenberg e contém os metadados sobre um livro. Por exemplo, 
o livro número 132 é a tradução de Lionel Giles de 1910 de The Art of War, de Sunzi.

** O arquivo rdf-files.tar.bz2 baixará na pasta download, e ficara vazia nesta pasta. 
deve ser substituido do download para esta pasta. contem 56M .

** Após rodar o comando -$ tar -xvjf rdf-files.tar.bz2-, vai ser criado o 
arquivo -bulk_pg.ldj- com 17M 

comandos: (na pasta database)
node rdf-to-json.js ../data/cache/epub/11/pg11.rdf


page 149