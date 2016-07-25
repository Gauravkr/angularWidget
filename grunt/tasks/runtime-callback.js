(function (module) {
    'use strict';

    module.exports = function (grunt) {

        /**
         * This task exists to provide a mechanism to update various task configurations at runtime.
         */
        grunt.registerMultiTask('runtime-callback', 'Execute a callback at runtime', function() {

            var options = this.options({
                callback: function () {}
            });

            options.callback();

            grunt.log.ok('Callback executed successfully.');

        });

    };

}(module));