var async = require('async');
var _ = require('lodash');
var moment = require('moment');
var mailgunClient = require('../../server/services/mailgunClient');
var twilioClient = require('../../server/services/twilioClient');

module.exports = function(Activity) {
  Activity.current = null;

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
        var code = timeSlotId.toString().slice(-6);
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

  Activity.start = function(code, key, cb) {
    if (key != Activity.app.get("endPointToken")) {
      var err = new Error('denied!');
      err.statusCode = 401;
      return cb(err);
    }
    Activity.app.models.TimeSlot.find({
      where: {
        date: moment().startOf('day').valueOf()
      },
      include: {
        relation: 'activity',
        scope: {
          include: [
            {
              relation: 'shopkeeper',
              scope: {
                fields: ['name', 'logo', 'description']
              }
            },
            {
              relation: 'product',
              scope: {
                fields: ['name', 'images', 'description']
              }
            },
            {
              relation: 'survey',
              scope: {
                fields: ['surveyItems'],
                include: {
                  relation: 'surveyItems',
                  scope: {
                    order: 'order ASC'
                  }
                }
              }
            }
          ]
        }
      }
    }, function(err, timeSlots) {
      if (err) return cb(err);
      var timeSlot = _.find(timeSlots, function(t) {
        return t.id.toString().slice(-6) == code.toLowerCase();
      });
      if (timeSlot && timeSlot.activity && !timeSlot.activity.started) {
        var activity = timeSlot.toJSON().activity;
        Activity.current = activity;
        var socket = Activity.app.io;
        socket.to(Activity.current.shopkeeperId).emit('start:activity', Activity.current.id);
        Activity.findById(activity.id, function(err, instance) {
          instance.updateAttribute('started', true, function(err) {
            if (err) return cb(err);
            cb(null, activity);
          })
        });
      } else {
        var err = new Error('Invalid code!');
        err.statusCode = 400;
        cb(err);
      }
    });
  };

  Activity.addSurveyResult = function(id, result, key, cb) {
    if (Activity.current && id != Activity.current.id || key != Activity.app.get("endPointToken")) {
      var err = new Error('denied!');
      err.statusCode = 401;
      return cb(err);
    }
    Activity.findById(id, function(err, activity) {
      if (!Activity.current.surveyResults) Activity.current.surveyResults = [];
      Activity.current.surveyResults.push(result);
      activity.updateAttribute('surveyResults', Activity.current.surveyResults, function(err) {
        if (err) return cb(err);
        cb(null, true);
      });
    });
  };

  Activity.end = function(id, key, cb) {
    if (Activity.current && id != Activity.current.id || key != Activity.app.get("endPointToken")) {
      var err = new Error('denied!');
      err.statusCode = 401;
      return cb(err);
    }
    var socket = Activity.app.io;
    socket.to(Activity.current.shopkeeperId).emit('end:activity', {
      id: Activity.current.id,
      surveyResults: Activity.current.surveyResults
    });
    Activity.current = null;
    Activity.findById(id, function(err, activity) {
      activity.updateAttribute('ended', true, function(err) {
        if (err) return cb(err);
        cb(null, true)
      })
    });
  };

  Activity.remoteMethod(
    'start',
    {
      description: 'Kick off an activity by activation code',
      accepts: [
        { arg: 'code', type: 'string' },
        { arg: 'key', type: 'string' }
      ],
      returns: { arg: 'activity', type: 'object' },
      http: { verb: 'post' }
    }
  );

  Activity.remoteMethod(
    'addSurveyResult',
    {
      description: 'Add survey results for current activity',
      accepts: [
        { arg: 'id', type: 'string' },
        { arg: 'result', type: 'array' },
        { arg: 'key', type: 'string' }
      ],
      returns: { arg: 'success', type: 'boolean' },
      http: { verb: 'post' }
    }
  );

  Activity.remoteMethod(
    'end',
    {
      description: 'End an current activity',
      accepts: [
        { arg: 'id', type: 'string' },
        { arg: 'key', type: 'string' }
      ],
      returns: { arg: 'success', type: 'boolean' },
      http: { verb: 'post' }
    }
  );
};
