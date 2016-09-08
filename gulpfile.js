'use strict';

var gulp = require('gulp');
var wiredep = require('wiredep').stream;
var saveLicense = require('uglify-save-license');
var lazypipe = require('lazypipe');
var mainBowerFiles = require('main-bower-files');
var del = require('del');
//////////////////////////////////////////////////////////
// Gulp Plugins
//////////////////////////////////////////////////////////
var angularFilesort = require('gulp-angular-filesort');
var angularTemplatecache = require('gulp-angular-templatecache');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var eslint = require('gulp-eslint');
var filter = require('gulp-filter');
var flatten = require('gulp-flatten');
var htmlmin = require('gulp-htmlmin');
var gulpif = require('gulp-if');
var inject = require('gulp-inject');
var ngAnnotate = require('gulp-ng-annotate');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var sass = require('gulp-sass');
var size = require('gulp-size');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var gutil = require('gulp-util');
//////////////////////////////////////////////////////////



/**
 * Scripts Task
 */
gulp.task('scripts',  function() {
  return buildScripts();
});

/**
 * Styles Task
 */
gulp.task('styles', function() {
  return buildStyles();
});

/**
 * Inject Task
 */
gulp.task('inject', ['scripts', 'styles'], function() {
  var injectStyles = gulp.src('.tmp/serve/app/**/*.css', { read: false });

  var injectScripts = gulp.src([
    'client/app/**/*.module.js',
    'client/app/**/*.js',
    '!client/app/**/*.spec.js',
    '!client/app/**/*.mock.js'
  ])
    .pipe(angularFilesort()).on('error', errorHandler('AngularFilesort'));

  var injectOptions = {
    ignorePath: ['client', '.tmp/serve'],
    addRootSlash: false
  };

  return gulp.src('client/*.html')
    .pipe(inject(injectStyles, injectOptions))
    .pipe(inject(injectScripts, injectOptions))
    .pipe(wiredep())
    .pipe(gulp.dest('.tmp/serve/'));
});

/**
 * Templates Task
 */
gulp.task('templates', function() {
  return gulp.src('client/app/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(angularTemplatecache('templates.js', {
      module: 'chipForHire',
      root: 'app'
    }))
    .pipe(gulp.dest('.tmp/serve/app'));
});

/**
 * HTML Task
 */
gulp.task('html', ['inject', 'templates'], function() {
  var injectTemplates = gulp.src('.tmp/serve/app/templates.js', { read: false });
  var injectOptions = {
    starttag: '<!-- inject: templates -->',
    ignorePath: '.tmp/serve',
    addRootSlash: false
  };

  return gulp.src('.tmp/serve/*.html')
    .pipe(inject(injectTemplates, injectOptions))
    .pipe(useref({}, lazypipe().pipe(sourcemaps.init)))
    .pipe(gulpif('**/*.{js,css}', rev()))
    .pipe(gulpif('**/*.js', ngAnnotate()))
    .pipe(gulpif('**/*.js', uglify({ preserveComments: saveLicense }))).on('error', errorHandler('Uglify'))
    .pipe(gulpif('**/*.css', cleanCSS({ processImport: false })))
    .pipe(sourcemaps.write('maps'))
    .pipe(revReplace())
    .pipe(gulpif('*.html', htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest('dist/'))
    .pipe(size({ title: 'dist/', showFiles: true }));
});

/**
 * Fonts Task
 */
gulp.task('fonts', function() {
  return gulp.src(mainBowerFiles())
    .pipe(filter('**/*.{oft,eot,svg,ttf,woff,woff2}'))
    .pipe(flatten())
    .pipe(gulp.dest('dist/fonts/'));
});

/**
 * Other Task
 */
gulp.task('other', function() {
  var fileFilter = filter(function(file) {
    return file.stat.isFile();
  });

  return gulp.src(['client/**/*', '!client/bower_components/**/*', '!client/**/*.{html,css,js,scss}'])
    .pipe(fileFilter)
    .pipe(gulp.dest('dist/'))
});

/**
 * Watch Task
 */
gulp.task('watch', ['inject'], function() {
  gulp.watch(['client/*.html', 'client/app/**/*.js', 'client/app/**/*.scss', 'bower.json'], ['inject']);
});

/**
 * Serve Task
 */
gulp.task('serve', ['watch'], function() {
  gulp.start('nodemon');
});

/**
 * Build Task
 */
gulp.task('build', ['html', 'fonts', 'other']);

/**
 * Clean Task
 */
gulp.task('clean', function() {
  return del(['.tmp/', 'dist/']);
});


/**
 * Node Monitor Task
 */
gulp.task('nodemon', function() {
  return nodemon({
    script: 'server/server.js',
    watch: ['server/**/*', 'common/**/*']
  });
});

/**
 * Default Task
 */
gulp.task('default', ['clean'], function() {
  gulp.start('build');
});



/**
 * Reusable Functions
 */
function errorHandler(title) {
  return function(err) {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
}

function buildScripts() {
  return gulp.src('client/app/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(size());
}

function buildStyles() {
  var injectFiles = gulp.src([
    'client/app/**/*.scss',
    '!client/app/app.scss'
  ], { read: false });

  var injectOptions = {
    transform: function(filePath) {
      filePath = filePath.replace('client/app/', '');
      return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };

  return gulp.src('client/app/app.scss')
    .pipe(inject(injectFiles, injectOptions))
    .pipe(wiredep())
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' })).on('error', errorHandler('Sass'))
    .pipe(autoprefixer()).on('error', errorHandler('Autoprefixer'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.tmp/serve/app'));
}
