(function (module) {
    'use strict';

    module.exports = function (grunt) {

        var exec = require('child_process').exec;

        grunt.registerTask('git-revision', 'Retrieve Git Revision, Store in Config Object', function () {

            var that = this,
                done = that.async(),
                options = that.options({
                    updateConfig: 'gitRevision'
                });

            exec('git rev-parse --short HEAD', function (err, stdout, stderr) {

                var rev = stdout.trim();

                if (err) {
                    grunt.fatal('Could not execute git rev-parse:\n  ' + stderr);
                }

                grunt.util.recurse(options.updateConfig, function (value) {
                    grunt.config.set(value, rev);
                    grunt.log.ok('Setting grunt.config.' + value + ' = ' + rev);
                });

                done();

            });

        });

    };

}(module));