#!/usr/bin/env node

//UTILIZANDO FLUXO PARA CANALIZAR OS DADOS

'use strict';
require('fs').createReadStream(process.argv[2])
.pipe(process.stdout)