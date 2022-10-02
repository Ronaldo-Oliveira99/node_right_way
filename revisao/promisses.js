/*
1- Uma promessa é um objeto que encapsula esses dois resultados possíveis
(sucesso e falha) para uma operação.
Assim que a operação associada for concluida, a promisse será resolvida 
ou rejeitada. Anexa-se funções de retorono de chamada anonima(resolve, reject)
 */
const promise = new Promise((resolve, reject) => {
    // If successful:
    resolve(someSuccessValue);
    // Otherwise:
    reject(someErrorValue);
    });


//2- O valor será enviado para qualquer manipulador then() ou catch() 
promise.then(someSuccessValue => { /* Do something on success. */ });
promise.catch(someErrorValue => { /* Do something on failure. */ });