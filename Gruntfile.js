module.exports = function( grunt ) {

  grunt.loadNpmTasks( "grunt-contrib-concat" );
  grunt.loadNpmTasks( "grunt-qunit-junit" );
  grunt.loadNpmTasks( "grunt-contrib-qunit" );
  grunt.loadNpmTasks( "grunt-closurecompiler" );
  grunt.loadNpmTasks( "grunt-closure-compiler" );

  grunt.initConfig({
    qunit_junit: {
      options: {
        dest: "build/test-results/"
      }
    },

    qunit: {
      qunit: [
      "test/*.html",
      ]
    },

    concat: {
      'build/combined.js': [
        'libs/prefs.js',
        'src/retargeting.js'
      ]
    },

    'closure-compiler': {
      frontend: {
        closurePath: 'closure-compiler',
        js: ['libs/prefs.js', 'src/retargeting.js'],
        jsOutputFile: 'build/r.js',
        options: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          output_wrapper: "(function(){%output%})();",
          define: ['"AMOAD_RTG_URL=\'p.amoad.com/\'"'],
        }
      }
    },
  });

  grunt.registerTask("minify", ["closure-compiler"]);
  grunt.registerTask("testing", ["qunit_junit", "qunit"]);

  grunt.registerTask( "build-git", function( sha ) {
    function processor( content ) {
      var tagline = " - A JavaScript Unit Testing Framework";
      return content.replace( tagline, "-" + sha + " " + grunt.template.today("isoDate") + tagline );
    }
    grunt.file.copy( "qunit/qunit.css", "dist/qunit-git.css", {
      process: processor
    });
    grunt.file.copy( "qunit/qunit.js", "dist/qunit-git.js", {
      process: processor
    });
  });

  grunt.registerTask( "testswarm", function( commit, configFile ) {
    var testswarm = require( "testswarm" ),
    config = grunt.file.readJSON( configFile ).qunit,
    runs = {},
    done = this.async();
    ["index", "async", "setTimeout"].forEach(function (suite) {
      runs[suite] = config.testUrl + commit + "/test/" + suite + ".html";
    });
    testswarm.createClient( {
      url: config.swarmUrl,
      pollInterval: 10000,
      timeout: 1000 * 60 * 30
    } )
    .addReporter( testswarm.reporters.cli )
    .auth( {
      id: config.authUsername,
      token: config.authToken
    } )
    .addjob(
      {
      name: "QUnit commit #<a href='https://github.com/jquery/qunit/commit/" + commit + "'>" + commit.substr( 0, 10 ) + "</a>",
      runs: runs,
      browserSets: config.browserSets
      }, function( err, passed ) {
        if ( err ) {
        grunt.log.error( err );
      }
    done( passed );
    }
    );
  });
  grunt.registerTask("default", ["qunit"]);
};
