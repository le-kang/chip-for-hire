var async = require('async');
var _ = require('lodash');
var moment = require('moment');
var mailgunClient = require('../../server/services/mailgunClient');
var twilioClient = require('../../server/services/twilioClient');

module.exports = function(Activity) {
  Activity.observe('after save', function(ctx, next) {
    if (ctx.isNewInstance) {
      var socket = Activity.app.io;
      var timeSlotId = ctx.instance.timeSlotId;
      var shopkeeperId = ctx.instance.shopkeeperId;
      socket.to('shopkeeper').emit('reserve:time slot', {
        timeSlotId: timeSlotId,
        shopkeeperId: shopkeeperId
      });
      async.parallel({
        timeSlot: function(cb) {
          Activity.app.models.TimeSlot.findById(timeSlotId, function(err, timeSlot){
            if (err) return cb(err);
            cb(null, timeSlot);
          });
        },
        shopkeeper: function(cb) {
          Activity.app.models.Shopkeeper.findById(shopkeeperId, function(err, shopkeeper){
            if (err) return cb(err);
            cb(null, shopkeeper);
          });
        }
      }, function(err, result) {
        if (err) return next(err);
        var activity = ctx.instance.toJSON();
        activity.timeSlot = result.timeSlot;
        activity.shopkeeper = result.shopkeeper;
        socket.to('admin').emit('add:activity', activity);

        var date = moment(result.timeSlot.date).format('DD/MM/YYYY');
        var hour = result.timeSlot.hour;
        var code = activity.id.toString().slice(-6);
        // send email with activation code
        var subject = 'Activation code for activity at ' + hour + ':00 on ' + date;
        var content = _.template(
          '<p>Dear <%- name %>:</p>' +
          '<p>The activation code for activity at <%- hour %>:00 on <%- date %> is: <b><%- code %></b></p>' +
          '<p>Kind Regards,</p>' +
          '<p><i>Chip</i></p>'
        )({
          name: result.shopkeeper.name,
          date: date,
          hour: hour,
          code: code
        });
        mailgunClient.sendMail(result.shopkeeper.email, subject, content);

        // send cancellation message if shopkeeper has mobile number in profile
        if (result.shopkeeper.mobileNumber) {
          var message = 'The activation code for activity at ' + hour + ':00 on ' + date + ' is: ' + code;
          var to = '+61' + result.shopkeeper.mobileNumber.slice(1);
          twilioClient.sendSMS(to, message);
        }
      });
    }
    next();
  });
};
