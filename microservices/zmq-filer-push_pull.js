"use strict";
const cluster = require("cluster");
const zmq = require("zeromq");

const numWorkers = 30;

if (cluster.isMaster) {
  const pusher = zmq.socket("push").bind("tcp://127.0.0.1:60401");
  const puller = zmq.socket("pull").bindSync("tcp://127.0.0.1:60402");

//   for (let i = 0; i < numWorkers; i++) {
//     pusher.send(
//       JSON.stringify({
//         details: `Details about job ${i}.`,
//       })
//     );
//   }

  puller.on("message", (data) => {
    const job = JSON.parse(data.toString());
    // Do the work described in the job.
  });
}
