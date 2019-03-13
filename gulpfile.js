const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const saveLicense = require('uglify-save-license');
const path = require('path');
const through = require('through2');
const browserify = require('gulp-browserify');
const rename = require('gulp-rename');
const argv = require('yargs').argv;

gulp.task('js', () => {
  return gulp.src([
      './src/hc-sticky.js',
      './src/hc-sticky.helpers.js'
    ])
    .pipe(babel(
      {
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false
            }
          ]
        ]
      }
    ))
    .pipe(concat('hc-sticky.js'))
    .pipe(argv.dev ? through.obj() : uglify({
      output: {
        comments: saveLicense
      }
    }))
    .pipe(gulp.dest('./docs/'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('demo', () => {
  return gulp.src(['./docs/*.scss'])
    .pipe(sass({
      'outputStyle': argv.dev ? 'development' : 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./docs/'));
});

gulp.task('demo-browserify', () => {
  return gulp.src(['./docs/browserify.src.js'])
    .pipe(browserify({
      insertGlobals: true
    }))
    .pipe(babel(
      {
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false
            }
          ]
        ]
      }
    ))
    .pipe(argv.dev ? through.obj() : uglify())
    .pipe(rename('browserify.dist.js'))
    .pipe(gulp.dest('./docs/'));
});

gulp.task('default', ['js', 'demo', 'demo-browserify'], () => {});

gulp.task('watch', ['js', 'demo'], () => {
  gulp.watch(['./src/*.js'], ['js', 'demo-browserify']);
  gulp.watch(['./docs/*.scss'], ['demo']);
});
