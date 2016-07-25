(function (module) {
    'use strict';

    module.exports = function(grunt) {

        var exec = require('child_process').exec,
            AsyncQueue = require('../support/async_queue');

        grunt.registerMultiTask('tag', 'Add a git tag and push it', function () {

            var done = this.async(),
                queue = new AsyncQueue(done),
                options = this.options({

                    tag: null,
                    message: null,
                    pushTo: 'origin'

                });

            queue.push(function (next) {

                grunt.log.ok('Applying tag: ' + options.tag + ' ...');

                exec('git tag -a ' + options.tag + ' -m "' + options.message + '"', function (err, stdout, stderr) {

                    if (err) {
                        grunt.fail.fatal('Could not tag');
                    }

                    next();

                });

            });

            queue.push(function (next) {

                grunt.log.ok('Pushing tags to ' + options.pushTo + '...');

                exec('git push ' + options.pushTo + ' --tags', function (err, stdout, stderr) {

                    if (err) {
                        grunt.fail.fatal('Could not push tags.');
                    }

                    next();

                });

            });

            queue.first();

        });

    };

}(module));