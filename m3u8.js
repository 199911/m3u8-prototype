var fs = require('fs');

fs.readFile('./public/1280x720/BigBuckBunny_1280x720.m3u8', 'utf8', function(err, contents) {
    console.log(contents);
    var m3u8Parser = require('m3u8-parser');
    var parser = new m3u8Parser.Parser();

    parser.push(contents);
    parser.end();

    var parsedManifest = parser.manifest;
    console.log(parsedManifest.segments);
});

console.log('after calling readFile');
