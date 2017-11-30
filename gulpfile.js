const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const template = require('gulp-template');
const glob = require('glob');
const cheerio = require('cheerio');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const saveLicense = require('uglify-save-license');
const gulpif = require('gulp-if');
const fs = require('fs');
const path = require('path');
const through = require('through2');
const open = require('gulp-open');
const argv = require('yargs').argv;

gulp.task('js', () => {
  return gulp.src([
      './src/hc-sticky.js',
      './src/hc-sticky.helpers.js',
      './node_modules/eventie/eventie.js'
    ])

    .pipe(babel({
      plugins: [
        'check-es2015-constants',
        'transform-es2015-arrow-functions',
        'transform-es2015-block-scoped-functions',
        'transform-es2015-block-scoping',
      ]
    }))

    .pipe(gulpif((file) => {
      // preserve license comment only on main js
      return file.relative === 'hc-sticky.js';
    }, argv.dev ? through.obj() : uglify({
      output: {
        comments: saveLicense
      }
    })))

    .pipe(gulpif((file) => {
      return file.relative !== 'hc-sticky.js';
    }, argv.dev ? through.obj() : uglify()))

    .pipe(concat('hc-sticky.js', {
      newLine: ''
    }))

    .pipe(gulp.dest('./dist'));
});

/* Demo */

const demo_dest = './demo/build';

gulp.task('demo-sass', () => {
  return gulp.src(['./demo/src/*.scss'])
    .pipe(sass({
      'outputStyle': argv.dev ? 'development' : 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(demo_dest));
});

gulp.task('demo-html', () => {
  const demos = glob.sync('./demo/src/*.html') || [];

  demos.forEach((item, i) => {
    if (path.basename(item) === 'index.html') {
      delete demos[i];
    }
  });

  return gulp.src(demos)
    .pipe(template({
      style_path: 'demos.css',
      sticky_path: '../../dist/hc-sticky.js'
    }))
    .pipe(gulp.dest(demo_dest));
});

const compile = (openHtml) => {
  openHtml = openHtml || false;

  const demos = glob.sync('./demo/src/*.html') || [];
  let demos_content = '';

  demos.forEach((item) => {
    const filepath = item;
    const filename = path.basename(item);

    if (filename === 'index.html') {
      return;
    }

    const $ = cheerio.load(fs.readFileSync(filepath));
    const title = $('title').text();
    const desc = $('meta[name="description"]').attr('content').replace(/\*(.*?)\*/g, str => {
      return `<strong>${str.substring(1, str.length - 1)}</strong>`;
    }).replace(/`(.*?)`/g, str => {
      return `<code>${str.substring(1, str.length - 1)}</code>`;
    });

    demos_content += `<li>
      <input type="checkbox" checked>
      <i></i>
      <h2>${title}</h2>
      <p>${desc}</p>
      <p><a href="./${filename}" target="_blank">Launch Demo</a></p>
    </li>`;
  });

  const template_options = {
    style_path: 'style.css',
    demos: `<ul>${demos_content}</ul>`
  };

  if (openHtml) {
    return gulp.src('./demo/src/index.html')
      .pipe(template(template_options))
      .pipe(gulp.dest(demo_dest))
      .pipe(open());
  }
  else {
    return gulp.src('./demo/src/index.html')
      .pipe(template(template_options))
      .pipe(gulp.dest(demo_dest));
  }
};

gulp.task('open-html', () => {
  compile(true);
});

gulp.task('main-html', () => {
  compile(false);
});

/* Gulp Tasks */

gulp.task('default', ['js', 'demo-sass', 'demo-html', 'open-html']);

gulp.task('dist', ['js']);

gulp.task('watch', ['js', 'demo-sass', 'demo-html', 'open-html'], () => {
  gulp.watch(['./src/*.js'], ['js']);
  gulp.watch(['./**/*.scss'], ['demo-sass']);
  gulp.watch(['./**/*.html'], ['demo-html', 'main-html']);
});
