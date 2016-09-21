var _ = require('lodash');
var moment = require('moment');
var mailgunClient = require('../../server/services/mailgunClient');
var twilioClient = require('../../server/services/twilioClient');

module.exports = function(TimeSlot) {
  TimeSlot.observe('after save', function(ctx, next) {
    if (ctx.isNewInstance) {
      var socket = TimeSlot.app.io;
      socket.to('shopkeeper').emit('add:time slot', ctx.instance);
    }
    next();
  });

  TimeSlot.observe('before delete', function(ctx, next) {
    var socket = TimeSlot.app.io;
    socket.to('shopkeeper').emit('remove:time slot', ctx.where);
    next();
  });

  // for administrator to cancel a reservation from shopkeeper and remove the time slot
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

          var socket = TimeSlot.app.io;
          socket.to(shopkeeper.id).emit('cancel:reservation', timeSlot);

          var date = moment(timeSlot.date).format('DD/MM/YYYY');
          var hour = timeSlot.hour;

          // send cancellation email
          var subject = 'Your activity at ' + hour + ':00 on ' + date + ' has been cancelled';
          var content = _.template(
            '<p>Dear <%- name %>:</p>' +
            '<p>I am sorry to inform you that your activity at ' +
            '<b><%- hour %>:00 on <%- date %></b> ' +
            'has been cancelled due to following reason: </p>' +
            '<p><em><%- reason %></em></p>' +
            '<p>I apologise for any inconvenience that may have caused and appreciate your understanding.</p>' +
            '<p>Kind Regards,</p>' +
            '<p><i>Chip</i></p>'
          )({
            name: shopkeeper.name,
            date: date,
            hour: hour,
            reason: reason
          });
          mailgunClient.sendMail(shopkeeper.email, subject, content);

          // send cancellation message if shopkeeper has mobile number in profile
          if (shopkeeper.mobileNumber) {
            var message = 'Sorry to inform your that your activity at ' + hour + ':00 on ' + date
              + ' has been cancelled. An Email with more details has been sent to you.';
            var to = '+61' + shopkeeper.mobileNumber.slice(1);
            twilioClient.sendSMS(to, message);
          }
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
  );
};
