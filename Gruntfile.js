module.exports = function (grunt) {
  'use strict';

  var pkg = grunt.file.readJSON('package.json'),
    locations = {

      // Destination directory for compiled output. Relative to Gruntfile.js.
      dest: 'dist',

      // Temporary work directory. Relative to Gruntfile.js.
      work: 'target',

      // Raw sources root. Assumes child folders such as /js, /css, /img, /fonts, etc. Relative to Gruntfile.js.
      srcRoot: 'src',

      // JS test root. Relative to Gruntfile.js.
      testRoot: 'test',

      // Bower root. Relative to Gruntfile.js.
      bowerRoot: grunt.file.readJSON('.bowerrc').directory,

      //requirejs path. note - Almond doesn't work with mainFrame player as it requires cookies-js which loads dynamically
      requirejs: '../bower_components/requirejs/require'

    },

    utils = {

      requirejs: {

        /**
         * Provides access to our application's RequireJS Config.
         */
        config: (function () {

          /**
           * Traverses config.baseUrl for module names, dynamically adds them to config.include eliminating the need
           * to manually add each module as they are created.
           */
          var decorateConfig = function (config) {

              config.include = [];

              grunt.file.recurse(locations.srcRoot + '/js', function (abspath, rootdir, subdir, filename) {
                config.include.push((subdir ? subdir + '/' : '') + filename.replace(/\.js$/, ''));
              });

              return config;

            },

          /* jshint evil: true */
            retrieveDecoratedConfig = new Function('require', 'return ' + grunt.file.read(locations.srcRoot + '/js/config.js'));
          /* jshint evil: false */

          /**
           * Passes a mocked require.config function as parameter that returns the RequireJS config object,
           * decorated with our dynamic includes.
           */
          return retrieveDecoratedConfig({
            config: function (config) {
              return decorateConfig(config);
            }
          });

        }())

      },

      copy: {

        /**
         * TODO: Document
         *
         * @returns {Array}
         */
        getSections: function () {

          if (!utils.copy.sections) {

            utils.copy.sections = [];

            grunt.util.recurse(grunt.config.get('htmlbuild.compile.options.sections'), function (value) {
              if (typeof value === "string") {
                utils.copy.sections.push(value.replace(locations.dest + '/', ''));
              }
            });

          }

          return utils.copy.sections;

        }

      },

      'string-replace': {

        /**
         * Dynamically collect the hash-rev file names into a grunt files object.
         *
         * This allows us to run string-replace on the already compiled sources output in the <locations.dest>
         * directory. This is important because we don't know at build time what the calculated hash values,
         * are, therefore we can't explicitly name the files here.
         */
        files: function () {

          var result = {};

          if (grunt.file.exists(locations.dest + '/')) {

            grunt.file.recurse(locations.dest + '/', function (abspath, rootdir, subdir, filename) {
              if (/\.(js|css|html)$/.test(filename)) { // only include js/css/html files
                var fqFilename = rootdir + (subdir ? subdir + '/' : '') + filename;
                result[fqFilename] = fqFilename;
              }
            });

          }

          return result;

        },

        /**
         * Dynamically build the replacements array.
         *
         * Traverses <locations.dest> and matches the original file names to the hash rev file names.
         * Then creates a regex pattern, and adds the result to the replacements array.
         */
        replacements: function () {

          var result = [];

          if (grunt.file.exists(locations.dest + '/')) {

            grunt.file.recurse(locations.dest + '/', function (abspath, rootdir, subdir, filename) {

              var fqFilename = (subdir ? subdir + '/' : '') + filename,
                rawFilenameRegex = /^(?:.+\/)*(.+)\.[0-9A-Fa-f]+\.(.+)$/,
                rawFilename,
                fqRawFilename,
                regexResult;

              if (rawFilenameRegex.test(fqFilename)) {

                regexResult = rawFilenameRegex.exec(fqFilename);
                rawFilename = [regexResult[1], regexResult[2]].join('.');
                fqRawFilename = (subdir ? subdir + '/' : '') + rawFilename;

                if (rawFilename) {
                  result.push({
                    pattern: new RegExp(fqRawFilename.replace(/\./, '\\.'), 'g'),
                    replacement: fqFilename
                  });
                }
                if (!!rawFilename.indexOf('third-party.min')) {
                  result.push({
                    pattern: /(url\()images/g,
                    replacement: '$1../img'
                  });
                }
              }

            });

          }

          return result;

        }

      },

      connect: {

        /**
         * TODO: Document
         */
        proxies: function () {

          var raw = grunt.file.read('proxies.json').toString(),
            removedComments = raw.replace(/((\/\/.*)|(\/\*[\w\W]*\*\/))/g, '');

          return JSON.parse(removedComments).proxies;

        },

        /**
         * TODO: Document
         */
        middleware: function (connect, options, middlewares) {
          middlewares.unshift(connect.compress());
          middlewares.unshift(require('grunt-connect-proxy/lib/utils').proxyRequest);
          return middlewares;
        }

      }

    };

  grunt.initConfig({

    buildDate: new Date(),

    pkg: pkg,
    locations: locations,

    // https://github.com/gruntjs/grunt-contrib-clean
    clean: {

      dest: [locations.dest],

      work: {
        src: [
          '<%= locations.work %>/**',
          '!<%= locations.work %>',
          '!<%= locations.work %>/reports',
          '!<%= locations.work %>/artifacts/**'
        ],
        filter: function (filepath) {
          return !(/reports\/plato/.test(filepath));
        }
      },

      plato: ['<%= locations.work %>/reports/plato/**'],

      artifacts: ['<%= locations.work %>/artifacts']

    },

    // https://github.com/rubenv/grunt-mkdir
    mkdir: {

      dest: {
        options: {
          create: ['<%= locations.dest %>']
        }
      },

      work: {
        options: {
          create: ['<%= locations.work %>']
        }
      }

    },

    // https://github.com/gruntjs/grunt-contrib-jshint
    jshint: {

      files: [
        'Gruntfile.js',
        '<%= locations.srcRoot %>/js/**/*.js',
        '<%= locations.testRoot %>/**/*.js'
      ],

      options: {
        reporter: require('jshint-stylish'),
        jshintrc: '.jshintrc'
      }

    },

    karma: {
      test: {
        // point all tasks to karma config file
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    // https://github.com/jsoverson/grunt-plato
    plato: {

      analyze: {

        options: {

          /**
           *  Reads the .jshintrc file. Comments are not supported by JSON.parse, so I must manually
           *  remove them. The regex below matches both inline and multi-line comments.
           */
          jshint: (function () {

            var raw = grunt.file.read('.jshintrc').toString(),
              removedComments = raw.replace(/((\/\/.*)|(\/\*[\w\W]*\*\/))/g, '');

            return JSON.parse(removedComments);

          }())

        },

        files: (function () {

          var outputDir = '<%= locations.work %>/reports/plato',
            filesObject = {};

          filesObject[outputDir] = [
            '<%= locations.srcRoot %>/js/**/*.js',
            '<%= locations.testRoot %>/js/**/*.js'
          ];

          return filesObject;

        }())

      }
    },

    // https://github.com/gruntjs/grunt-contrib-less
    less: {

      compileMain: {
        options: {
          cleancss: true,
          optimization: 1,
          strictUnits: true,
          modifyVars: {
            'icon-font-path': '"../fonts/"', // trailing slash is important!
            'fa-font-path': '"../fonts"'     // lack of trailing slash is important!
          }
        },

        files: (function () {

          var outputFile = '<%= locations.dest %>/css/<%= pkg.name %>.min.css',
            filesObject = {};

          filesObject[outputFile] = '<%= locations.srcRoot %>/less/main.less';

          return filesObject;

        }())
      },
      compileThirdParty: {
        options: {
          cleancss: true,
          optimization: 1,
          strictUnits: true,
          modifyVars: {
            'icon-font-path': '"../fonts/"', // trailing slash is important!
            'fa-font-path': '"../fonts"'     // lack of trailing slash is important!
          }
        },

        files: (function () {

          var outputFile = '<%= locations.dest %>/css/<%= pkg.name %>-third-party.min.css',
            filesObject = {};

          filesObject[outputFile] = '<%= locations.srcRoot %>/less/main-third-party.less';
          return filesObject;
        }())
      }

    },

    // https://github.com/gruntjs/grunt-contrib-requirejs
    requirejs: {

      compile: {

        // https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {

          mainConfigFile: '<%= locations.srcRoot %>/js/config.js',
          baseUrl: '<%= locations.srcRoot %>/js',
          name: '<%= locations.requirejs %>',
          paths: utils.requirejs.config.paths,
          shim: utils.requirejs.config.shim,
          include: utils.requirejs.config.include,
          insertRequire: ['main'],
          out: '<%= locations.dest %>/js/<%= pkg.name %>.min.js',
          fileExclusionRegExp: /^\./,
          optimize: 'uglify2',
          normalizeDirDefines: 'skip',
          findNestedDependencies: true,
          preserveLicenseComments: true,
          logLevel: 0,
          throwWhen: {
            optimize: true
          }

        }

      }

    },

    // https://github.com/gruntjs/grunt-contrib-copy
    copy: {

      html: {
        expand: true,
        cwd: '<%= locations.srcRoot %>/',
        src: ['**/*.html'],
        dest: '<%= locations.dest %>',
        filter: function (src) {

          var idx,
            sections = utils.copy.getSections(),
            inSectionList = false;

          for (idx = 0; idx < sections.length; idx++) {

            inSectionList = !inSectionList && src.indexOf(sections[idx]) >= 0;

            if (inSectionList) {
              break;
            }

          }

          return src.indexOf("bower_components") < 0 && !inSectionList;

        }
      },

      img: {
        expand: true,
        cwd: '<%= locations.srcRoot %>/img/',
        src: ['**/*.{png,gif,ico,jpg,svg}'],
        dest: '<%= locations.dest %>/img/'
      },

      'bootstrap-fonts': {
        expand: true,
        cwd: '<%= locations.bowerRoot %>/bootstrap/dist/fonts/',
        src: ['**/*.{otf,eot,svg,ttf,woff}'],
        dest: '<%= locations.dest %>/fonts/'
      },

      'font-awesome-fonts': {
        expand: true,
        cwd: '<%= locations.bowerRoot %>/font-awesome/fonts/',
        src: ['**/*.{otf,eot,svg,ttf,woff}'],
        dest: '<%= locations.dest %>/fonts/'
      },

      'fonts': {
        expand: true,
        cwd: '<%= locations.srcRoot %>/fonts/',
        src: ['**/*.{otf,eot,svg,ttf,woff}'],
        dest: '<%= locations.dest %>/fonts/'
      }

    },

    // https://github.com/spatools/grunt-html-build
    htmlbuild: {

      compile: {

        src: '<%= locations.srcRoot %>/index.html',
        dest: '<%= locations.dest %>/',

        options: {

          beautify: true,
          relative: true,

          scripts: {
            app: '<%= locations.dest %>/js/<%= pkg.name %>.min.js'
          },

          styles: {
            app: '<%= locations.dest %>/css/<%= pkg.name %>.min.css',
            thirdParty: '<%= locations.dest %>/css/<%= pkg.name %>-third-party.min.css'
          },

          sections: {

            header: '<%= locations.srcRoot %>/header.html',
            footer: '<%= locations.srcRoot %>/footer.html'

          }

        }

      }

    },

    // see: grunt/tasks/hash-filenames.js
    'hash-filenames': {

      options: {
        algorithm: 'md5',
        length: 8
      },

      assets: {

        files: [
          {
            src: [
              '<%= locations.dest %>/*.json',
              '<%= locations.dest %>/js/**/*.js',
              '<%= locations.dest %>/css/**/*.css',
              '<%= locations.dest %>/img/**/*.{jpg,jpeg,gif,png}',
              '<%= locations.dest %>/fonts/**/*.{eot,svg,ttf,woff,otf}'
            ]
          }
        ]

      }
    },

    // see: grunt/tasks/runtime-callback.js
    'runtime-callback': {

      'string-replace': {

        options: {

          callback: function () {

            var stringReplaceConfig = {

              compile: {

                files: utils['string-replace'].files(),

                options: {
                  replacements: utils['string-replace'].replacements()
                }

              }

            };

            /**
             * https://github.com/erickrdch/grunt-string-replace
             *
             * We have to configure string-replace at runtime because the target filenames aren't available
             * until after the execution of the 'rev' task.
             */
            grunt.config.set('string-replace', stringReplaceConfig);
            grunt.log.writeln("grunt.config.'string-replace' = " + JSON.stringify(stringReplaceConfig, function (key, value) {
                if (value instanceof RegExp) {
                  return value.toString();
                } else {
                  return value;
                }
              }, '  '));

          }

        }

      }

    },

    // https://github.com/gruntjs/grunt-contrib-compress
    compress: {

      gzip: {

        options: {
          mode: 'gzip',
          level: 9
        },

        files: [
          {
            expand: true,
            src: ['<%= locations.dest %>/js/**/*.js'],
            ext: '.js.gz',
            extDot: 'last'
          },
          {
            expand: true,
            src: ['<%= locations.dest %>/css/**/*.css'],
            ext: '.css.gz',
            extDot: 'last'
          },
          {
            expand: true,
            src: ['<%= locations.dest %>/**/*.html'],
            ext: '.html.gz',
            extDot: 'last'
          }
        ]

      },

      package: {

        options: {
          archive: '<%= locations.work %>/artifacts/<%= pkg.name %>-<%= semanticVersion %>.zip'
        },

        cwd: '<%= locations.dest %>',
        src: ['**'],
        expand: true

      }

    },

    // see: grunt/tasks/git.js
    git: {

      revision: {

        options: {

          git: [
            {
              cmd: 'rev-parse --short HEAD',
              callback: function (out) {
                var rev = out.trim();
                grunt.config.set('gitRevision', rev);
                grunt.log.writeln('Setting grunt.config.gitRevision = ' + rev);
              }
            }
          ]

        }

      },

      tag: {

        options: {

          tag: '<%= semanticVersion %>',
          message: 'Release: v<%= semanticVersion %>',

          git: [
            'tag -f -a "$tag" -m "$message"',
            'push origin --tags'
          ]

        }

      }

    },

    // see: grunt/tasks/metadata.js
    metadata: {

      versionProperties: {

        dest: ['<%= locations.dest %>/version.properties'],

        options: {

          metadata: {
            artifactId: '<%= pkg.name %>',
            version: '<%= semanticVersion %>'
          }

        }

      },

      metadataJson: {

        dest: ['<%= locations.dest %>/metadata.json'],

        options: {

          metadata: {
            artifactId: '<%= pkg.name %>',
            buildDate: '<%= buildDate %>',
            version: '<%= semanticVersion %>',
            rev: '<%= gitRevision %>',
            githubUri: '<%= pkg.repository.url %>'
          }

        }

      }

    },

    // see: grunt/tasks/semver.js
    semver: {

      options: {
        buildDate: '<%= buildDate %>'
      },

      preRelease: {
        options: {
          version: '<%= pkg.version %>',
          preRelease: '$branch',
          metadata: ['$buildDate', '$rev']
        }
      },

      release: {
        options: {
          version: '<%= pkg.version %>'
        }
      }

    },

    // https://github.com/gruntjs/grunt-contrib-connect
    connect: {

      dev: {

        options: {
          port: grunt.option('port') || 8000,
          protocol: 'http',
          hostname: '*',
          base: '<%= locations.srcRoot %>',
          keepalive: true,
          open: false,
          useAvailablePort: true,
          middleware: utils.connect.middleware

        },

        proxies: utils.connect.proxies()

      },

      prod: {

        options: {
          port: grunt.option('port') || 8000,
          protocol: 'http',
          hostname: '*',
          base: '<%= locations.dest %>',
          keepalive: true,
          open: false,
          useAvailablePort: true,
          middleware: utils.connect.middleware

        },

        proxies: utils.connect.proxies()

      }

    },


    // see: grunt/tasks/bump.js
    bump: {

      options: {

        dest: '<%= locations.dest %>',

        pushTo: 'origin',
        currentVersion: '<%= pkg.version %>'

      }

    }

  });

  require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '!grunt-template-*']});
  grunt.loadTasks('grunt/tasks');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('run', ['configureProxies:dev', 'connect:dev']);
  grunt.registerTask('run:prod', ['default', 'configureProxies:prod', 'connect:prod']);

  grunt.registerTask('test', ['clean:work', 'mkdir:work', 'jshint', 'karma']);
  grunt.registerTask('compile', [
    'clean:dest',
    'mkdir:dest',

    'less',
    'requirejs:compile',

    'copy',
    'htmlbuild:compile',

    'hash-filenames',
    'runtime-callback:string-replace',
    'string-replace:compile',

    'compress:gzip'
  ]);

  grunt.registerTask('package:preRelease', ['semver:preRelease', 'test', 'compile', 'metadata:versionProperties', 'compress:package']);
  grunt.registerTask('package:release', ['semver:release', 'test', 'compile', 'metadata:versionProperties', 'compress:package', 'git:tag']);

  grunt.registerTask('default', ['test', 'compile']);

};
