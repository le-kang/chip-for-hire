var _ = require('lodash');
var moment = require('moment');
var mailgunClient = require('../../server/services/mailgunClient');
var twilioClient = require('../../server/services/twilioClient');

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
          sendEmail(shopkeeper, timeSlot, reason);
          sendSMS(shopkeeper, timeSlot);
        });
      } else {
        timeSlot.destroy(function(err) {
          if (err) return cb(err);
          cb(null, true);
        });
      }
    });
  };

  function sendEmail(shopkeeper, timeSlot, reason) {
    var date = moment(timeSlot.date).format('DD/MM/YYYY');
    var hour = timeSlot.hour;
    var subject = 'Your activity at ' + hour + ':00 on ' + date + ' has been cancelled';
    var mailTemplate = _.template(
      '<p>Dear <%- name %>:</p>' +
      '<p>I am sorry to inform you that your activity at ' +
      '<b><%- hour %>:00 on <%- date %></b> ' +
      'has been cancelled due to following reason: </p>' +
      '<p><em><%- reason %></em></p>' +
      '<p>I apologise for any inconvenience that may have caused and appreciate your understanding.</p>' +
      '<p>Kind Regards,</p>' +
      '<p><i>Chip</i></p>'
    );
    var content = mailTemplate({
      name: shopkeeper.name,
      date: date,
      hour: hour,
      reason: reason
    });
    mailgunClient.sendMail(shopkeeper.email, subject, content);
  }

  function sendSMS(shopkeeper, timeSlot) {
    if (shopkeeper.mobileNumber) {
      var date = moment(timeSlot.date).format('DD/MM/YYYY');
      var hour = timeSlot.hour;
      var message = 'Sorry to inform your that your activity at ' + hour + ':00 on ' + date + ' has been cancelled. Please refer to the Email for more details.';
      var to = '+61' + shopkeeper.mobileNumber.slice(1);
      twilioClient.sendSMS(to, message);
    }
  }

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
