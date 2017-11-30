var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// HLS endpoint
var fs = require('fs');
var rawM3u8;
var parsedM3u8;

const liveHandler = function() {
  var from, to;
  liveM3u8 = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:18\n#EXT-X-MEDIA-SEQUENCE:${liveSeq}\n`;
  from = liveSeq;
  to = (liveSeq + 3) >= parsedM3u8.segments.length ? 0 : liveSeq + 3;
  for (var i = from; i < to; i++) {
    var ts = parsedM3u8.segments[i];
    liveM3u8 += `#EXTINF:${ts.duration},` + `\n${ts.uri}\n`;
  }
  liveSeq += 1;
  if (liveSeq >= parsedM3u8.segments.length) {
    liveSeq = 0;
  }
  // console.log(liveM3u8);
};

const eventHandler = function() {
  var from, to;
  eventM3u8 = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:18\n#EXT-X-MEDIA-SEQUENCE:${eventSeq}\n`;
  from = 0;
  to = (eventSeq + 3) >= parsedM3u8.segments.length ? 0 : eventSeq + 3;
  for (var i = from; i < to; i++) {
    var ts = parsedM3u8.segments[i];
    eventM3u8 += `#EXTINF:${ts.duration},` + `\n${ts.uri}\n`;
    if (i == parsedM3u8.segments.length - 1) {
      eventM3u8 += '#EXT-X-ENDLIST';
    }
  }
  eventSeq += 1;
  if (eventSeq >= parsedM3u8.segments.length) {
    eventSeq = 0;
  }
  // console.log(eventM3u8);
};

fs.readFile(path.join(__dirname, '../public/1280x720/BigBuckBunny_1280x720.m3u8'), 'utf8', function(err, rawM3u8) {
    var m3u8Parser = require('m3u8-parser');
    var parser = new m3u8Parser.Parser();

    parser.push(rawM3u8);
    parser.end();
    parsedM3u8 = parser.manifest;
    liveHandler();
    setInterval(liveHandler, 10000);
    eventHandler();
    setInterval(eventHandler, 10000);
});

var liveSeq = 0;
var liveM3u8 = '';
var eventSeq = 0;
var eventM3u8 = '';

// Set CORS header
router.use(function(req, res, next) {
  var allowOrigin;
  if (req.header('Origin')) {
    allowOrigin = req.header('Origin');
  } else {
    allowOrigin = '*';
  }
  res.header('Access-Control-Allow-Origin', 'http://dev.hk01.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
})

router.get('/video.m3u8', function(req, res, next) {
  // res.send(rawM3u8);
  data = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2962000,NAME="High",CODECS="avc1.66.30",RESOLUTION=1280x720
BigBuckBunny_1280x720.m3u8`;
  res.send(data);
});

router.get('/live.m3u8', function(req, res, next) {
  data = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2962000,NAME="High",CODECS="avc1.66.30",RESOLUTION=1280x720
chunklist_live.m3u8`;
  res.send(data);
});

router.get('/chunklist_live.m3u8', function(req, res, next) {
  res.send(liveM3u8);
});

router.get('/event.m3u8', function(req, res, next) {
  data = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2962000,NAME="High",CODECS="avc1.66.30",RESOLUTION=1280x720
chunklist_event.m3u8`;
  res.send(data);
});

router.get('/chunklist_event.m3u8', function(req, res, next) {
  res.send(eventM3u8);
});

router.get(/(.+)/, function(req, res, next) {
  var filepath = path.join(__dirname, '../public/1280x720/' + req.params[0]);
  res.sendFile(filepath);
});


module.exports = router;
