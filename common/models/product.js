var fs = require('fs');
var path = require('path');
var _ = require('lodash');

module.exports = function(Product) {
  Product.observe('after save', function(ctx, next) {
    if (ctx.isNewInstance) {
      if (process.env.NODE_ENV != 'production') {
        fs.mkdir(path.join(__dirname, '../', '../', 'storage/' + ctx.instance.id), next);
      } else {
        Product.app.models.Container.createContainer({ name: ctx.instance.id }, next);
      }
    } else {
      next();
    }
  });

  Product.uploadImages = function(ctx, id, cb) {
    ctx.req.params.container = id;
    var Container = Product.app.models.Container;
    Container.upload(ctx.req, ctx.result, function(err, fileObj) {
      if (err) return cb(err);
      var newImages = [];
      _.forEach(fileObj.files, function(file) {
        newImages.push(file[0].name);
      });
      Product.findById(id, function(err, product) {
        if (err) return cb(err);
        var images = product.images || [];
        images = _.union(images, newImages);
        product.updateAttribute('images', images, function(err) {
          if (err) return cb(err);
          cb(null, images);
        })
      });
    });
  };

  Product.deleteImage = function (id, image, cb) {
    var Container = Product.app.models.Container;
    Product.findById(id, function(err, product) {
      if (err) return cb(err);
      var images = product.images || [];
      if (_.indexOf(images, image) != -1) {
        Container.removeFile(id, image, function(err) {
          if (err) return cb(err);
          _.remove(images, function(i) {
            return i == image;
          });
          product.updateAttribute('images', images, function(err) {
            if (err) return cb(err);
            cb(null, images);
          });
        });
      } else {
        cb(null, images);
      }
    });
  };

  Product.remoteMethod(
    'uploadImages',
    {
      description: 'Upload product images',
      accepts: [
        { arg: 'ctx', type: 'object', http: { source: 'context' } },
        { arg: 'id', type: 'string' }
      ],
      returns: { arg: 'images', type: '[string]' },
      http: { verb: 'post' }
    }
  );

  Product.remoteMethod(
    'deleteImage',
    {
      description: 'Delete a product image',
      accepts: [
        { arg: 'id', type: 'string' },
        { arg: 'image', type: 'string' }
      ],
      returns: { arg: 'images', type: '[string]' },
      http: { verb: 'post' }
    }
  );
};
