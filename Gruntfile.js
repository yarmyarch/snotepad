/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    // Task configuration.
    concat: {
      options: {
      },
      // js concat included in requirejs building instead.
      //~ dist: {
        //~ src: ['!src/js/require.js', 'src/js/*.js'],
        //~ dest: 'asset/js/app.js'
      //~ },
      css: {
        src: ['src/css/*.css'],
        dest: 'asset/css/app.css'
      }  
    },
    // uglify included in requirejs building.
    //~ uglify: {
      //~ general: {
        //~ src: 'asset/js/app.js',
        //~ dest: 'asset/js/app.js'
      //~ }
    //~ },
    cssmin: {
        general: {
          src: 'asset/css/app.css',
          dest: 'asset/css/app.css'
        }
    },
    jshint: {
      options: {
        boss: true,
        browser: true,
        curly: true,
        eqnull: true,
        freeze: true,
        immed: true,
        indent: true,
        lastsemic: true,
        latedef: true,
        multistr: true,
        newcap: true,
        noarg: true,
        nomen: true,
        sub: true,
        quotmark: true,
        undef: true,
        unused: true,
        white: true,
        globals: {
          jQuery: true,
          console: true,
          define: true,
          requirejs: true,
          alert: true
        },
        expr: {
          'Expected an assignment or function call and instead saw an expression.': true,
          'Expected a conditional expression and instead saw an assignment.': true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['src/**/*.js', '!src/js/require.js', '!src/js/lib/swiper.js']
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: 'src/js',
          mainConfigFile: 'src/js/requireConfig.js',
          out: 'asset/js/app.js',
          preserveLicenseComments: false,
          include: ['require.js', 'requireConfig.js'],
          name: 'app',
          uglify: {
            max_line_length: 10000
          }
        }
      },
      concat: {
        options: {
          baseUrl: 'src/js',
          mainConfigFile: 'src/js/requireConfig.js',
          out: 'asset/js/app.js',
          preserveLicenseComments: false,
          include: ['require.js', 'requireConfig.js'],
          name: 'app',
          optimize: 'none'
        }
      }
    },
    // No unit tests at the moment.
    //~ qunit: {
      //~ files: ['test/**/*.html']
    //~ },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-css');

  // Tasks.
  grunt.registerTask('default', ['jshint', 'requirejs:concat', 'concat', 'cssmin']);
  grunt.registerTask('go', ['jshint', 'requirejs:compile', 'concat', 'cssmin']);

};
