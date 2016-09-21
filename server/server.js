var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var _ = require('lodash');

var app = module.exports = loopback();

if (process.env.NODE_ENV != 'production') {
  app.use(loopback.static(path.resolve('.tmp/serve')));
  app.use(loopback.static(path.resolve('client')));
} else {
  app.use(loopback.static(path.resolve('dist')));
}

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.io = require('socket.io')(app.start());
    require('socketio-auth')(app.io, {
      authenticate: function(socket, data, callback) {
        //get credentials sent by the client
        app.models.AccessToken.find({
          where:{
            and: [{ userId: data.userId }, { id: data.id }]
          }
        }, function(err, tokenDetail){
          if (err) throw err;
          if (tokenDetail.length) {
            // every user has a private room
            socket.join(data.userId);
            // join another private room according to the role of user
            if (data.role == 'Admin') {
              socket.join('admin');
            } else {
              socket.join('shopkeeper');
            }
            callback(null, true);
          } else {
            callback(null, false);
          }
        });
      }
    });
  }
});
