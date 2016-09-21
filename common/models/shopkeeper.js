var fs = require('fs');
var path = require('path');

module.exports = function(Shopkeeper) {
  Shopkeeper.observe('after save', function(ctx, next) {
    if (ctx.isNewInstance) {
      fs.mkdirSync(path.join(__dirname, '../', '../', 'storage/' + ctx.instance.id));
    }
    next();
  });

  Shopkeeper.uploadLogo = function(ctx, id, cb) {
    ctx.req.params.container = id;
    var Container = Shopkeeper.app.models.Container;
    Container.upload(ctx.req, ctx.result, function(err, fileObj) {
      if (err) return cb(err);
      var fileInfo = fileObj.files.file[0];
      Shopkeeper.findById(id, function(err, shopkeeper) {
        if (err) return cb(err);
        shopkeeper.updateAttribute('logo', fileInfo.name, function(err) {
          if (err) return cb(err);
          cb(null, fileInfo.name);
        })
      });
    });
  };

  Shopkeeper.cancelActivity = function(id, activityId, cb) {
    Shopkeeper.findById(id, {
      include: {
        relation: 'activities',
        scope: {
          where: { id: activityId },
          include: 'timeSlot'
        }
      }
    }, function(err, shopkeeper) {
      var activity = shopkeeper.toJSON().activities[0];
      if (activity) {
        var timeSlot = activity.timeSlot;
        Shopkeeper.app.models.Activity.destroyById(activity.id, function(err) {
          if (err) return cb(err);
          cb(null, true);
          var socket = Shopkeeper.app.io;
          socket.to('shopkeeper').emit('free:time slot', {
            timeSlot: timeSlot,
            shopkeeperId: shopkeeper.id
          });
          socket.to('admin').emit('cancel:activity', activity);
        })
      } else {
        cb(null, false);
      }
    });
  };

  Shopkeeper.remoteMethod(
    'uploadLogo',
    {
      description: 'Upload a shop logo',
      accepts: [
        { arg: 'ctx', type: 'object', http: { source: 'context' } },
        { arg: 'id', type: 'string' }
      ],
      returns: { arg: 'logo', type: 'string' },
      http: { verb: 'post' }
    }
  );

  Shopkeeper.remoteMethod(
    'cancelActivity',
    {
      description: 'Cancel an activity reservation by the owner',
      accepts: [
        { arg: 'id', type: 'string' },
        { arg: 'activityId', type: 'string' }
      ],
      returns: { arg: 'success', type: 'boolean' },
      http: { verb: 'post' }
    }
  );
};
