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
};
