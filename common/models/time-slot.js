var moment = require('moment')
var Mailgun = require('mailgun-js');

var mailgunAPIKey = 'key-7262acd35127e222f70149804722aeca';
var mailgunDomain = 'sandbox8acf16db81ee444db3f6ec8f75c637ee.mailgun.org';

module.exports = function(TimeSlot) {
  TimeSlot.cancelReservation = function(id, reason, cb) {
    TimeSlot.findById(id, {
      include: {
        relation: 'activity',
        scope: {
          include: 'shopkeeper'
        }
      }
    }, function(err, timeSlot) {
      if (err) return cb(err);
      if (timeSlot.activity) {
        var shopkeeper = timeSlot.toJSON().activity.shopkeeper;
        timeSlot.activity.destroy(function(err) {
          if (err) return cb(err);
          timeSlot.destroy(function(err) {
            if (err) return cb(err);
            cb(null, true);
          });
          var mailgun = new Mailgun({
            apiKey: mailgunAPIKey,
            domain: mailgunDomain
          });
          var mailData = {
            to: shopkeeper.email,
            from: 'chip@email.com',
            subject:
              'Your activity at ' +
              timeSlot.hour + ':00 on ' +
              moment(timeSlot.date).format('DD/MM/YYYY') +
              ' has been cancelled',
            html:
              '<p>Dear ' + shopkeeper.name + ':</p>' +
              '<p>I am sorry to inform you that your activity at <b>' +
              timeSlot.hour + ':00 on ' +
              moment(timeSlot.date).format('DD/MM/YYYY') +
              '</b> has been cancelled due to following reason:</p>' +
              '<p><em>' + reason + '</em></p>' +
              '<p>I apologise for any inconvenience that may have caused, ' +
              'and appreciate your understanding.</p>' +
              '<p>Kind Regards,</p><p><i>Chip</i></p>'
          };
          mailgun.messages().send(mailData);
        });
      } else {
        timeSlot.destroy(function(err) {
          if (err) return cb(err);
          cb(null, true);
        });
      }
    });
  };

  TimeSlot.remoteMethod(
    'cancelReservation',
    {
      description: 'Cancel an activity reservation by admin',
      accepts: [
        { arg: 'id', type: 'string' },
        { arg: 'reason', type: 'string' }
      ],
      returns: { arg: 'success', type: 'boolean' },
      http: { verb: 'post' }
    }
  )
};
