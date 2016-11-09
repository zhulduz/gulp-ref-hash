var through     = require('through2');
var _           = require('underscore');
var gutil       = require('gulp-util');
var crypto      = require('crypto');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-ref-hash';

function randomHash() {
  return crypto.randomBytes(8).toString('hex');
}

function hashifyLine(path, fileName, assetType) {
  var fileName = fileName + '_' +randomHash();
  var url = [path, fileName, '.', assetType].join('');
  return '<!-- build:' + assetType + ' ' + url + ' -->';
}

module.exports = function(options) {
  var matches, assetType;

  options = _.extend({
    paths: {
      js: '/static/js/',
      css: '/static/css/',
    },
  }, options);


  return through.obj(function(file, enc, callback) {

    if (file.isNull()) return callback();

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-ref-hash', 'Streaming not supported.'));
      return callback();
    }

    var contents = file.contents.toString().split('\n').map(function (line) {
      if (matches = line.match(/<!--\s*build:(\w+)(?:\(([^\)]+)\))?\s*((.+)\/([^\/]+))?\s*-->/)) {
        extension = matches[1];
        name = _.first(_.last(matches).split("."))
        line = hashifyLine(options.paths[extension], name, extension);
      }
      return line;
    }).join('\n');

    file.contents = new Buffer(contents);
    this.push(file);
    return callback();

  });
};
