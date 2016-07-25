(function (module) {
    'use strict';

    module.exports = function(grunt) {

        var fs = require('fs'),
            path = require('path'),
            crypto = require('crypto'),
            utils = {

                hash: function (filepath, algorithm, encoding) {

                    var hash = crypto.createHash(algorithm);

                    hash.update(grunt.file.read(filepath));

                    return hash.digest(encoding);

                }

            };

        grunt.registerMultiTask('hash-filenames', 'Generate content hash and add to filename for cache busting', function() {

            var that = this,
                options = this.options({
                algorithm: 'md5',
                length: 8
            });

            that.files.forEach(function (file) {

                file.src.forEach(function(src) {

                    var hash = utils.hash(src, options.algorithm, 'hex'),
                        hashSuffix = hash.slice(0, options.length),
                        fileName = path.basename(src),
                        baseFileName = fileName.replace(/^(.+?)\..+$/, '$1'),
                        fileExt = fileName.replace(/^.+?\.(.+)$/, '$1'),
                        hashedFileName = [baseFileName, hashSuffix, fileExt].join('.'),
                        dest = path.resolve(path.dirname(src), hashedFileName);

                    grunt.verbose.ok().ok(hash);
                    fs.renameSync(src, dest);
                    grunt.log.write(src + ' ').ok(hashedFileName);

                });

            });

        });

    };

}(module));