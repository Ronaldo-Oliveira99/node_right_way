"use strict";
const assert = require("assert");
const EventEmitter = require("events").EventEmitter;
const LDJClient = require("../lib/ldj-client.js");
describe("LDJClient", () => {
  let stream = null;
  let client = null;
  beforeEach(() => {
    stream = new EventEmitter();
    client = new LDJClient(stream);
  });

  it("should emit a message event from a single data event", (done) => {
    client.on("message", (message) => {
      assert.deepEqual(message, { foo: "bar" });
      done();
    });
    stream.emit("data", '{"foo":"bar"}\n');
  });

  it("should emit a message event from split data events", (done) => {
    client.on("message", (message) => {
      assert.deepEqual(message, { foo: "bar" });
      done();
    });
    stream.emit("data", '{"foo":');
    process.nextTick(() => stream.emit("data", '"bar"}\n'));
  });

  it("should emit a message event from split data events", (done) => {
    client.on("message", (message) => {
      assert.deepEqual(message, { foo: "bar" });
      done();
    });
    stream.emit("data", '{"foo":');
    process.nextTick(() => stream.emit("data", '"bar"}\n'));
  });


  it("should finish within 5 seconds", (done) => {
    client.on("message", (message) => {
      assert.deepEqual(message, { foo: "bar" });
      done();
    });

    stream.emit("data", '{"foo":');
    stream.emit("data", '"bar"}\n');

  }).timeout(5000);

  it("caso de eteste envio de um não json", (done) => {
    client.on("message", (message) => {
      assert.deepEqual(message, { foo: "bar" });
      done();
    });

    stream.emit("data", '{"foo":"bar"}');
 
  })

  it("caso com JSON e sem uma nova linha seguindopor um evento de fechamento", (done) => {
    client.on("message", (message) => {
      assert.deepEqual(message, { foo: "bar" });
      done();
    });

    stream.emit('data', '{"foo":"bar"}');
    stream.emit('close')
  })


  

  
});
