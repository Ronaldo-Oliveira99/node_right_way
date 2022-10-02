/*
ASYNC AWAIT
Um dos novos recursos mais poderosos do Node.js 8 é a introdução de funções assíncronas. Parte da 
especificação de rascunho do ECMAScript 2017, as funções assíncronas permitem que você aproveite os 
benefícios do Promises para simplificar o fluxo de código enquanto estrutura seu código de maneira mais 
natural.
Um exemplo deve esclarecer. Considere esta função artificial que retorna um
A chave é que, diferentemente de uma função regular, que sempre é executada até a conclusão, uma 
função assíncrona pode ser suspensa intencionalmente no meio da execução para aguardar a resolução 
de uma promessa. Observe que isso não viola a máxima central
Promessa.
Valor booleano que indica se a promessa retornada deve ser resolvida
que o JavaScript é single-thread. Não é que algum outro código irá antecipar sua função assíncrona, mas 
sim que você opta por desbloquear o loop de eventos para aguardar uma promessa.
*/

const delay = (timeout = 0, success = true) => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(`RESOLVED after ${timeout} ms.`);
      } else {
        reject(`REJECTED after ${timeout} ms.`);
      }
    }, timeout);
  });
  return promise;
};

const useDelay = () => {
  delay(500, false)
    .then((msg) => console.log(msg)) // Logs "RESOLVED after 500 ms."
    .catch((err) => console.log(err)); // Never called.
};

// RESOLVENDO COM ASYNC AWAIT
const useDelay2 = async () => {
  try {
    // await-> supaende a execução até que a Promise seja liquidada.
    const msg = await delay(500, true);
    console.log(msg); // Logs "RESOLVED after 500 ms."

    
  } catch (err) {
    console.log(err); // Never called.
  }
};

//useDelay();
useDelay2();