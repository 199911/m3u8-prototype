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
fs.readFile(path.join(__dirname, '../public/1280x720/BigBuckBunny_1280x720.m3u8'), 'utf8', function(err, rawM3u8) {
    var m3u8Parser = require('m3u8-parser');
    var parser = new m3u8Parser.Parser();

    parser.push(rawM3u8);
    parser.end();
    parsedM3u8 = parser.manifest;
    setInterval(
        function() {
            console.log('updated');
            liveM3u8 = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:18
#EXT-X-MEDIA-SEQUENCE:${seq}
`;
            console.log(parsedM3u8);
            for (var i = seq; i < seq + 3; i++) {
                var ts = parsedM3u8.segments[i];
                console.log(ts);
                liveM3u8 += `#EXTINF:${ts.duration},
${ts.uri}
`;
            }
            seq += 1;
        },
        10000
    );
});

var seq = 0;
var liveM3u8 = '';

router.get('/video.m3u8', function(req, res, next) {
  // res.send(rawM3u8);
  data = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2962000,NAME="High",CODECS="avc1.66.30",RESOLUTION=1280x720
BigBuckBunny_1280x720.m3u8`;
  res.header('Access-Control-Allow-Origin', 'http://dev.hk01.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.send(data);
});

router.get('/live.m3u8', function(req, res, next) {
    console.log(req.header);
  data = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2962000,NAME="High",CODECS="avc1.66.30",RESOLUTION=1280x720
chunklist_live.m3u8`;
  res.header('Access-Control-Allow-Origin', 'http://dev.hk01.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.send(data);
});

router.get('/chunklist_live.m3u8', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://dev.hk01.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.send(liveM3u8);
});

router.get(/(.+)/, function(req, res, next) {
  var filepath = path.join(__dirname, '../public/1280x720/' + req.params[0]);
  res.header('Access-Control-Allow-Origin', 'http://dev.hk01.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendFile(filepath);
});


module.exports = router;
