const { src, dest, parallel, series, watch } = require('gulp');
const glob = require('glob');
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
const bump = require('gulp-bump');
const replace = require('gulp-replace');
const argv = require('yargs').argv;

const compileJs = () => {
  return src([
      './src/hc-sticky.js',
      './src/hc-sticky.helpers.js'
    ])
    .pipe(concat('hc-sticky.js'))
    .pipe(babel(
      {
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              loose: true,
              exclude: ['transform-typeof-symbol']
            }
          ]
        ]
      }
    ))
    .pipe(argv.dev ? through.obj() : uglify({
      output: {
        comments: saveLicense
      }
    }))
    .pipe(dest('./docs/')) // demo
    .pipe(dest('./dist'));
};

const compileDemo = () => {
  return src(['./docs/*.scss'])
    .pipe(sass({
      'outputStyle': argv.dev ? 'development' : 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(dest('./docs/'));
};

const compileDemoBrowserify = () => {
  return src(['./docs/browserify.src.js'])
    .pipe(browserify({
      insertGlobals: true
    }))
    .pipe(babel(
      {
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              loose: true,
              exclude: ['transform-typeof-symbol']
            }
          ]
        ]
      }
    ))
    .pipe(argv.dev ? through.obj() : uglify())
    .pipe(rename('browserify.dist.js'))
    .pipe(dest('./docs/'));
};

const bumpPackage = () => {
  return src('./*.json')
    .pipe(bump(argv.ver && argv.ver.indexOf('.') > -1 ? {version: argv.ver} : {type: argv.ver || 'patch'}))
    .pipe(dest('./'));
};

const bumpJs = () => {
  const package = require('./package.json');

  return src(['./src/*.js'])
    .pipe(replace(/ \* Version: ([\d\.]+)/g, () => {
      return ` * Version: ${package.version}`;
    }))
    .pipe(dest('./src/'))
};

const defaultTask = parallel(compileJs, compileDemo, compileDemoBrowserify);

const watchFiles = () => {
  const watch_js = glob.sync('./src/*.js');
  const watch_demo = glob.sync('./docs/*.scss');

  watch(watch_js, parallel(compileJs, compileDemoBrowserify));
  watch(watch_demo, compileDemo);
};

module.exports.default = defaultTask;
module.exports.watch = series(defaultTask, watchFiles);
module.exports.bump = series(bumpPackage, bumpJs, compileJs);