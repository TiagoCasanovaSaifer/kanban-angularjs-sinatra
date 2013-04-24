// Karma configuration
// Generated on Wed Apr 03 2013 22:34:38 GMT-0300 (Hora oficial do Brasil)


// base path, that will be used to resolve files and exclude
basePath = '';


// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  "js/lib/jquery.min.js",
  "js/lib/jquery-ui.min.js",
  "js/lib/angular.min.js",
  "js/lib/angular-ui.js",
  "js/lib/angular-mock.js",
  "js/lib/dropbox.min.js",
  "js/application.js",
  "js/controllers.js",
  "js/services.js",
  "js/filters.js",
  "js/directives.js",
  {pattern: 'test/unit/*.js', watched: true, included: true, served: true}
];

preprocessors = {
  'js/application.js': 'coverage'
};

reporters = ['coverage'];

coverageReporter = {
  type : 'html',
  dir : 'coverage/'
}

// list of files to exclude
exclude = [
  
];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress', 'junit'];


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
