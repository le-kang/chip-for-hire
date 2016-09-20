var config = require('../config.json');
var client = require('twilio')(config.twilioAccountSID, config.twilioAuthToken);

module.exports.sendSMS = function(to, message) {
  client.messages.create({
    body: message,
    to: to,
    from: config.twilioNumber
  }, function(err) {
    if (err) {
      console.error('Could not send message');
      console.error(err);
    }
  });
};
