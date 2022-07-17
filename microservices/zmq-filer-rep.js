"use strict";
const fs = require("fs");
const zmq = require("zeromq");
// Socket to reply to client requests.
const responder = zmq.socket("rep");
// Handle incoming requests.
responder.on("message", (data) => {
  // Parse the incoming message.
  const request = JSON.parse(data);
  console.log(`Received request to get: ${request.path}`);
  // Read the file and reply with content.
  fs.readFile(request.path, (err, content) => {
    console.log("Sending response content.");
    if(!err){
      responder.send(
        JSON.stringify({
          content: content.toString(),
          timestamp: Date.now(),
          pid: process.pid
        })
      );

    }else{
      responder.send(
        JSON.stringify({
          code: err.code, 
          timestamp: Date.now(),                           
          pid: process.pid,
          sobre: 'Deu erro'
        })
      );
    }
  });
});
// Listen on TCP port 60401.
responder.bind("tcp://127.0.0.1:60401", (err) => {
  console.log("Listening for zmq requesters...");
});
// Close the responder when the Node process ends.
process
// .on("SIGINT", () => {

//   console.log("Shutting down...");
//   responder.close();
// }) 
.on('uncaughtException', err => {
  console.error(err.code, 'Uncaught Exception thrown - teste erro');
  process.exit(2);
});
