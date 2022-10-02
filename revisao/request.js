const request = require("request");

request.get("http://www.google.com", function (error, response, body) {

    if(error){
        response.statusCode(502).json({
            error:'bad gatway',
            reason: error.statusCode
        });
        return;
    }
    if(response.statusCode !==200){
        response.statusCode
    }
  console.error("error:", error); // Print the error if one occurred
  console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
  console.log("body:", body); // Print the HTML for the Google homepage.
});
