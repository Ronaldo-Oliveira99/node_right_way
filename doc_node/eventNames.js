/* Retorna uma matriz listando os eventos para os quais o emissor registrou ouvintes. 
Os valores na matriz são strings ou símbolos. */

const EventEmitter = require('events');
const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('foo', () => {});
myEE.on('bar', () => {});


const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
console.log(myEE.getMaxListeners());
console.log(myEE.listenerCount('foo'));

//-----------------------------------------------
const ee = new EventEmitter();
function pong() {
    console.log('pong');
  }
  
  ee.on('ping', pong);
  ee.once('ping', pong);
  ee.removeListener('ping', pong);
  
  ee.emit('ping');
  ee.emit('ping');

//--------------------------------------

const { getEventListeners, EventEmitter } = require('events');

{
  const ee = new EventEmitter();
  const listener = () => console.log('Events are fun');
  ee.on('foo', listener);
  getEventListeners(ee, 'foo'); // [listener]
}
{
  const et = new EventTarget();
  const listener = () => console.log('Events are fun');
  et.addEventListener('foo', listener);
  getEventListeners(et, 'foo'); // [listener]
}