'use strict';
const { Transform } = require('stream');
const filesize = require('filesize');
const gzipSize = require('gzip-size');
const log = require('fancy-log');

module.exports = (options = {}, callback) => {
  function formatSize(size) {
    if (options.bytes) {
      return size += ' B';
    } else {
      return filesize(size, options);
    }
  }

  function getSize(file) {
    const info = {
      filename: file.relative,
      toString: () => info.sizeString
    };

    info.size = info.sizeString = formatSize(file.contents.length);
    info.gzip = formatSize(gzipSize.sync(file.contents));

    if (options.gzip) {
      info.sizeString += ` (gzipped: ${info.gzip})`;
    }

    if (callback instanceof Function) {
      callback(info);
    } else {
      log(`${file.relative}: ${info}`);
    }
  }

  return new Transform({
    objectMode: true,
    transform: function(file, encoding, transformCallback) {
      if (file.isStream() || file.isBuffer()) {
        getSize(file);
      }

      return transformCallback(null, file);
    }
  });
};
