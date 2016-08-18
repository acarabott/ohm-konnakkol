var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var connect = require('gulp-connect');

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

// ohm-konnakol
gulp.task('babel', babelFactory(['src/*.js'], 'dst'));

gulp.task('connect', function() {
  connect.server({ livereload: true });
});

gulp.task('watchjs', function() {
  gulp.watch(['index.html', 'src/*.js', 'assets/*.ohm'], ['babel']);
});

// chrome extension
gulp.task('chrome-build', ['babel'], function() {
  gulp.src(['node_modules/ohm-js/dist/ohm.js'])
    .pipe(gulp.dest('chrome/extension/scripts'));

  gulp.src(['dst/*.js'])
    .pipe(gulp.dest('chrome/extension/scripts'));

  gulp.src(['assets/**/*'])
    .pipe(gulp.dest('chrome/extension/assets'));
});

gulp.task('chrome-babel',
  babelFactory(['chrome/src/*.js'], 'chrome/extension/scripts'));

gulp.task('chrome-watch', ['connect'], function() {
  gulp.watch(['index.html', 'src/*.js', 'assets/*.ohm'],
    ['babel', 'chrome-build', 'chrome-babel']);

  gulp.watch(['chrome/src/*.js'], ['chrome-build', 'chrome-babel']);
});

// default
gulp.task('default', ['watchjs', 'connect']);
