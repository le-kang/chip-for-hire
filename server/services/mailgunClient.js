var config = require('../config.json');
var client = require('mailgun-js')({ apiKey: config.mailgunAPIKey, domain: config.mailgunDomain });

module.exports.sendMail = function(to, subject, content) {
  client.messages().send({
    to: to,
    from: config.email,
    subject: subject,
    html: content
  }, function(err) {
    if (err) {
      console.log("Could not send email");
      console.log(err);
    }
  })
};
