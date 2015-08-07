// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-07-01 using
// generator-karma 1.0.0

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/modernizr/modernizr.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-messages/angular-messages.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/spin.js/spin.js',
      'bower_components/angular-spinner/angular-spinner.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/fastclick/lib/fastclick.js',
      'bower_components/jquery.cookie/jquery.cookie.js',
      'bower_components/jquery-placeholder/jquery.placeholder.js',
      'bower_components/foundation/js/foundation.js',
      'bower_components/angular-foundation/mm-foundation-tpls.js',
      'bower_components/ua-parser-js/src/ua-parser.js',
      'bower_components/x2js/xml2json.min.js',
      'bower_components/angular-xml/angular-xml.js',
      'bower_components/underscore/underscore.js',
      'bower_components/cerealizer.js/dist/cerealizer.js',
      'bower_components/ladda-foundation-5/dist/ladda.js',
      'bower_components/trakt.js/dist/trakt.js',
      'bower_components/httpinvoke/httpinvoke-browser.js',
      'bower_components/plex.js/dist/global/when.js',
      'bower_components/plex.js/dist/global/plex.js',
      'bower_components/sifter/sifter.js',
      'bower_components/microplugin/src/microplugin.js',
      'bower_components/selectize/dist/js/selectize.js',
      'bower_components/angular-selectize2/dist/selectize.js',
      'bower_components/jquery-sortable/source/js/jquery-sortable.js',
      'bower_components/raven-js/dist/raven.js',
      'bower_components/angular-raven/angular-raven.js',
      'bower_components/JavaScript-MD5/js/md5.js',
      'bower_components/waypoints/lib/noframework.waypoints.min.js',
      'bower_components/SHA-1/sha1.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower

      'bower_components/angulartics/src/angulartics.js',
      'bower_components/angulartics/src/angulartics-ga.js',

      "app/scripts/**/*.js",
      "test/mock/**/*.js",
      "test/spec/**/*.js"
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine"
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
