/*
Required Dependencies
node-fetch@2.6.1
form-data@3.0.0
*/

const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async function(context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse()

  let formData = new FormData();
  formData.append('text', event.Body || 'Hello World!');

  fetch("https://ipfs.infura.io:5001/api/v0/add?pin=true",
    {
      body: formData,
      method: "post"
    }).then(data => {
      return data.json()
    }).then(data => {
      twiml.message(`Your IPFS Hash: ${data.Hash}\n IPFS Link: http://ipfs.io/ipfs/${data.Hash}`)
      return callback(null, twiml)
    });
};
