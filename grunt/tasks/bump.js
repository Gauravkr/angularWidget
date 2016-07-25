/**
 * TODO: Document, Cleanup
 */
(function (module) {
    'use strict';

    module.exports = function(grunt) {

        var exec = require('child_process').exec,
            utils = {

                semverRegex: /^((?:[1-9][0-9]*|0)\.(?:[1-9][0-9]*|0)\.(?:[1-9][0-9]*|0))(?:-((?:(?:[0-9a-zA-Z]+-)*[0-9a-zA-Z]+)*))?(?:\+((?:(?:[0-9a-zA-Z]+\.)*[0-9a-zA-Z]+)*))?$/,
                versionRegex: /^([1-9][0-9]*|0)\.([1-9][0-9]*|0)\.([1-9][0-9]*|0)$/,

                calcSemver: function (version, preRelease, metadata) {

                    var semver = version;

                    if (preRelease) {
                        semver += '-' + preRelease;
                    }

                    if (metadata) {
                        semver += '+' + metadata.join('.');
                    }

                    return semver;

                },

                bumpSemver: function (bumpType, currentVersion, preRelease, metadata) {

                    var version,
                        major,
                        minor,
                        patch;

                    if (!utils.semverRegex.test(currentVersion)) {
                        grunt.fail.fatal('options.currentVersion: ' + currentVersion + ' is an invalid semantic version.');
                    }

                    version = currentVersion.match(utils.semverRegex)[1];

                    major = parseInt(version.match(utils.versionRegex)[1], 10);
                    minor = parseInt(version.match(utils.versionRegex)[2], 10);
                    patch = parseInt(version.match(utils.versionRegex)[3], 10);

                    switch (bumpType) {
                        case "major":
                            major++;
                            minor = 0;
                            patch = 0;
                            break;
                        case "minor":
                            minor++;
                            patch = 0;
                            break;
                        case "patch":
                            patch++;
                            break;
                    }

                    version = [major, minor, patch].join('.');

                    return utils.calcSemver(version, preRelease, metadata);

                }

            };

        grunt.registerTask('bump', 'Increment the version, commit, tag and push.', function (bumpType) {

            if (!bumpType) {
                grunt.fail.fatal('versionType required for bump');
            }

            var done = this.async(),
                options = this.options({

                    dest: 'dist',

                    preRelease: null,
                    metadata: null,

                    currentVersion: grunt.file.readJSON('package.json').version,

                    pushTo: 'origin',
                    commitPrefix: 'Bumping Version: ',
                    update: ['package.json=pkg']

                }),

                bumpedSemver = utils.bumpSemver(bumpType, options.currentVersion, options.preRelease, options.metadata),
                filesToUpdate = '';


            grunt.util.recurse(options.update, function (value) {

                var fileConfig = value.split('='),
                    file = fileConfig[0],
                    config = fileConfig[1],
                    json = grunt.file.readJSON(file);

                json.version = bumpedSemver;
                filesToUpdate += file + ' ';

                grunt.file.write(file, JSON.stringify(json, null, '  '));

                if (config) {
                    grunt.config.set(config, json);
                }

            });

            filesToUpdate = filesToUpdate.trim();

            exec('git add ' + filesToUpdate, function (err, stdout, stderr) {

                if (err) {
                    grunt.fatal('Could not add files:\n  ' + stderr);
                }

                grunt.log.ok('Adding ' + filesToUpdate);

                exec('git commit -m "' + options.commitPrefix + bumpedSemver + '"', function (err, stdout, stderr) {

                    if (err) {
                        grunt.fatal('Commit failed:\n  ' + stderr);
                    }

                    grunt.log.ok('Committing ' + filesToUpdate);

                    exec('git push ' + options.pushTo, function (err, stdout, stderr) {

                        if (err) {
                            grunt.fatal('Can not push to ' + options.pushTo + ':\n  ' + stderr);
                        }

                        grunt.log.ok('Pushed to ' + options.pushTo);

                        done();

                    });

                });

            });

        });

    };

}(module));
