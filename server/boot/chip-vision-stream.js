var events = require('events');
var uuid = require('uuid');
var eventEmitter = new events.EventEmitter();
var streaming = false;
var streamToken = null;

module.exports = function(app) {
  app.post('/chip-vision-stream', function(req, res) {
    if (req.query.token != app.get('endPointToken')) {
      return res.status(400).json({ error: 'denied!' })
    }
    streaming = true;
    req.on('data', function(chunk) {
      eventEmitter.emit('streaming', chunk);
    });
    req.on('end', function() {
      eventEmitter.emit('end-streaming');
      streaming = false;
      streamToken = null;
      res.send('ok');
    })
  });

  app.get('/stream-token', function(req, res) {
    var activityId = req.query.activityId;
    if (streaming && activityId == app.models.Activity.current.id) {
      if (!streamToken) {
        streamToken = uuid.v4();
      }
      res.json({ streamToken: streamToken });
    } else {
      res.status(400).json({ error: 'denied' });
    }
  });

  app.get('/chip-vision-stream', function(req, res) {
    if (req.query.token != streamToken) {
      return res.status(400).json({ error: 'denied!' })
    }
    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace;boundary=boundarydonotcross',
      'Connection': 'close',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache, no-store, must-revalidate, pre-check=0, post-check=0, max-age=0'
    });

    eventEmitter.on('streaming', function(chunk) {
      res.write(chunk);
    });

    eventEmitter.on('end-streaming', function() {
      res.end();
    });
  })
};
