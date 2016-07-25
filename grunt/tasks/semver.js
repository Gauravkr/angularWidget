(function (module) {
    'use strict';

    module.exports = function(grunt) {

        var exec = require('child_process').exec,
            AsyncQueue = require('../support/async_queue'),
            utils = {

                currentBranchRegex: /^\* (.+)$/,
                semverRegex: /^((?:[1-9][0-9]*|0)\.(?:[1-9][0-9]*|0)\.(?:[1-9][0-9]*|0))(?:-((?:(?:[0-9a-zA-Z]+-)*[0-9a-zA-Z]+)*))?(?:\+((?:(?:[0-9a-zA-Z]+\.)*[0-9a-zA-Z]+)*))?$/,
                preReleaseRegex: /^(?:(?:[0-9a-zA-Z]+-)*[0-9a-zA-Z]+)*$/,
                metadataRegex: /^(?:(?:[0-9a-zA-Z]+\.)*[0-9a-zA-Z]+)*$/,

                calcSemver: function (options) {

                    var semver = options.version;

                    if (utils.semverRegex.test(semver)) {
                        semver = semver.match(utils.semverRegex)[1];
                    }

                    if (options.preRelease) {
                        semver += '-' + options.preRelease;
                    }

                    if (options.metadata) {
                        semver += '+' + options.metadata.join('.');
                    }

                    return semver;

                },

                fetchOptionsWithToken: function (options, token) {

                    var result = [];

                    if (options.preRelease && options.preRelease.indexOf(token) >= 0) {
                        result.push('preRelease');
                    }

                    if (options.metadata) {

                        grunt.util.recurse(options.metadata, function (value) {
                            if (value.indexOf(token) >= 0) {
                                result.push('metadata');
                            }
                        });

                    }

                    return result;

                },

                replaceToken: function (option, regex, replacement) {

                    var result;

                    if (typeof option === "string") {

                        result = option.replace(regex, replacement);

                    } else if (Object.prototype.toString.call(option) === '[object Array]') {

                        result = [];

                        grunt.util.recurse(option, function (value) {
                            result.push(value.replace(regex, replacement));
                        });

                    }

                    return result;

                }

            };

        grunt.registerMultiTask('semver', 'Calculate Semver, Store in Config Object', function () {

            var that = this,
                done = that.async(),
                queue = new AsyncQueue(done),
                options = that.options({

                    buildDate: new Date(),
                    buildDateFormat: 'yyyymmddhhMM',

                    updateConfig: 'semanticVersion', // string or array

                    version: null,
                    preRelease: null,
                    metadata: null

                });

            queue.push(function (next) {

                var tokenizedOptions = utils.fetchOptionsWithToken(options, '$branch');

                if (tokenizedOptions.length < 1) {
                    next();
                } else {

                    exec('git branch', function (err, stdout, stderr) {

                        if (err) {
                            grunt.fatal('Could not retrieve $branch:\n  ' + stderr);
                        }

                        grunt.util.recurse(stdout.split('\n'), function (branch) {

                            branch = branch.trim();

                            if (utils.currentBranchRegex.test(branch)) {

                                grunt.util.recurse(tokenizedOptions, function (option) {
                                    options[option] = utils.replaceToken(options[option], /\$branch/g, branch.match(utils.currentBranchRegex)[1]);
                                });

                            }

                        });

                        next();

                    });

                }

            });

            queue.push(function (next) {

                var tokenizedOptions = utils.fetchOptionsWithToken(options, '$rev');

                if (tokenizedOptions.length < 1) {
                    next();
                } else {

                    exec('git rev-parse --short HEAD', function (err, stdout, stderr) {

                        if (err) {
                            grunt.fatal('Could not retrieve $rev:\n  ' + stderr);
                        }

                        grunt.util.recurse(tokenizedOptions, function (option) {
                            options[option] = utils.replaceToken(options[option], /\$rev/g, stdout.trim());
                        });

                        next();

                    });

                }

            });

            queue.push(function (next) {

                var tokenizedOptions = utils.fetchOptionsWithToken(options, '$buildDate'),
                    dateString = grunt.template.date(options.buildDate, options.buildDateFormat);

                if (tokenizedOptions.length < 1) {
                    next();
                } else {

                    grunt.util.recurse(tokenizedOptions, function (option) {
                        options[option] = utils.replaceToken(options[option], /\$buildDate/g, dateString);
                    });

                    next();

                }

            });

            queue.push(function (next) {

                var semver = utils.calcSemver(options);

                if (options.preRelease && !utils.preReleaseRegex.test(options.preRelease)) {
                    grunt.fail.fatal('semver:' + that.target + ' Invalid preRelease.\nSee http://semver.org/spec/v2.0.0.html for more information.');
                }

                if (options.metadata && options.metadata.length > 0 && !utils.metadataRegex.test(options.metadata.join('.'))) {
                    grunt.fail.fatal('semver:' + that.target + ' Invalid metadata.\nSee http://semver.org/spec/v2.0.0.html for more information.');
                }

                if (!utils.semverRegex.test(semver)) {
                    grunt.fail.fatal('semver:' + that.target + ' Invalid semver: ' + semver +'\nSee http://semver.org/spec/v2.0.0.html for more information.');
                }

                if (options.updateConfig) {

                    grunt.util.recurse(options.updateConfig, function (value) {

                        if (!grunt.config.get(value)) {
                            grunt.config.set(value, semver);
                            grunt.log.ok('Setting grunt.config.' + value + ' = ' + semver);
                        } else {
                            grunt.log.ok('grunt.config.' + value + ' is already set. Skipping...');
                        }

                    });

                }

                next();

            });

            queue.first();

        });

    };

}(module));
