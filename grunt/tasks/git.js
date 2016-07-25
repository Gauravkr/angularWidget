(function (module) {
    'use strict';

    module.exports = function(grunt) {

        var exec = require('child_process').exec,
            AsyncQueue = require('../support/async_queue');

        grunt.registerMultiTask('git', 'Execute a git command', function () {

            var done = this.async(),
                queue = new AsyncQueue(done),
                noop = function () {},

                replaceRegex,
                options = this.options({
                    git: null
                }),

                buildAsyncExecFn = function (command, callback, ignore) {

                    return function (next) {

                        grunt.log.writeln('git ' + command);

                        exec('git ' + command, function (err, stdout, stderr) {

                            if (err && !ignore) {
                                grunt.fail.fatal(stderr);
                            } else {
                                if (ignore && err) {
                                    grunt.log.writeln('Error ignored: ' + stderr);
                                }
                                grunt.log.ok(stdout);
                                callback(stdout);
                            }

                            next();

                        });

                    };

                };

            if (!Array.isArray(options.git)) {
                grunt.fail.fatal('git task: options.git must be an array');
            }

            for (var idx = 0; idx < options.git.length; idx++) {

                var command = options.git[idx],
                    callback = noop,
                    ignoreError;

                if (typeof command === 'object') {
                    command = options.git[idx].cmd;
                    callback = options.git[idx].callback || noop;
                    ignoreError = options.git[idx].ignoreError;
                }

                for (var optionKey in options) {
                    if (options.hasOwnProperty(optionKey) && optionKey !== 'git') {
                        replaceRegex = new RegExp('\\$' + optionKey + '\\b', 'g');
                        command = command.replace(replaceRegex, options[optionKey]);
                    }
                }

                queue.push(buildAsyncExecFn(command, callback, ignoreError));

            }

            queue.first();

        });

    };

}(module));
