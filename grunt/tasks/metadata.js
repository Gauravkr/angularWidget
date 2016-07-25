(function (module) {
    'use strict';

    module.exports = function (grunt) {

        grunt.registerMultiTask('metadata', 'Create a file that contains miscellaneous metadata in either .properties or .json format.', function () {

            var that = this,
                fileExtensionRegex = /^.+\.(.+)$/,
                options = this.options({
                    metadata: null
                });

            that.files.forEach(function (filePath) {

                var filename = filePath.dest.toString();

                grunt.file.write(filename, (function () {

                    var metadata = options.metadata,
                        key,
                        result = "",
                        fileExtension = filename.match(fileExtensionRegex)[1];

                    if (fileExtension === "properties") {

                        for (key in metadata) {
                            if (metadata.hasOwnProperty(key)) {
                                result += key + "=" + metadata[key] + "\n";
                            }
                        }

                    } else if (fileExtension === "json") {
                        result = JSON.stringify(metadata);
                    }

                    grunt.log.ok('Writing ' + filename + '...');
                    grunt.log.writeln('---------------------------------------------');
                    grunt.log.writeln(result);

                    return result;

                }()));

            });

        });

    };

}(module));
