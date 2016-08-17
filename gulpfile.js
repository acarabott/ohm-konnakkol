var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var connect = require('gulp-connect');

gulp.task('babel', function() {
  return gulp.src(['src/*.js'])
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
    .pipe(gulp.dest('dst'))
    .pipe(connect.reload());
});

gulp.task('connect', function() {
  connect.server({ livereload: true });
});

gulp.task('watchjs', function() {
  gulp.watch(['src/*.js', 'assets/*.ohm'], ['babel']);
});

gulp.task('default', ['watchjs', 'connect']);
