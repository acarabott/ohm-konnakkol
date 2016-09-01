var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var connect = require('gulp-connect');
var htmlreplace = require('gulp-html-replace');

function babelFactory (src, dst) {
  return function() {
    return gulp.src(src)
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['es2015']
      }))
      .on('error', function(error) {
        console.log('error!');
        console.log(error.message);
        this.emit('end');
      })
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dst))
      .pipe(connect.reload());
  }
}

function buildFactory (dst) {
  return function() {
    gulp.src(['node_modules/ohm-js/dist/ohm.js'])
      .pipe(gulp.dest(dst + '/scripts'));

    gulp.src(['dst/*.js'])
      .pipe(gulp.dest(dst + '/scripts'));

    gulp.src(['assets/**/*'])
      .pipe(gulp.dest(dst + '/assets'));
  };
}

// ohm-konnakkol
gulp.task('babel', babelFactory(['src/*.js'], 'dst'));

gulp.task('connect', function() {
  connect.server({ livereload: true });
});

gulp.task('watchjs', function() {
  gulp.watch(['index.html', 'src/*.js', 'assets/*.ohm'], ['babel']);
});

// chrome extension
gulp.task('chrome-build', ['babel'], buildFactory('chrome/extension'));

gulp.task('chrome-babel',
  babelFactory(['chrome/src/*.js'], 'chrome/extension/scripts'));

gulp.task('chrome-watch', ['connect'], function() {
  gulp.watch(['index.html', 'src/*.js', 'assets/*.ohm', 'chrome/src/*.js'],
    ['babel', 'chrome-build', 'chrome-babel']);
});

gulp.task('web-build', ['babel'], function() {
  var dst = '/Volumes/Data/Users/arthurc/Sites/arthurcarabott.com/konnakkol';
  // var dst = 'web';

  buildFactory(dst)();

  gulp.src(['index.html'])
    .pipe(htmlreplace({
      js: [
        'scripts/ohm.js',
        'scripts/audio.js',
        'scripts/konnakkol.js',
        'scripts/konnakkol-editor.js',
        'scripts/app.js'
      ]
    }))
    .pipe(gulp.dest(dst));
});

// default
gulp.task('default', ['watchjs', 'connect']);
