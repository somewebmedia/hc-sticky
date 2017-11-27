const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const template = require('gulp-template');
const glob = require('glob');
const cheerio = require('cheerio');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
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
    .pipe(concat('hc-sticky.js'))
    .pipe(babel({
      plugins: [
        'check-es2015-constants',
        'transform-es2015-arrow-functions',
        'transform-es2015-block-scoped-functions',
        'transform-es2015-block-scoping',
      ]
    }))
    .pipe(argv.dev ? through.obj() : uglify())
    .pipe(gulp.dest('./dist'));
});

/* Demos */

const demos_dest = './demos/compiled';

gulp.task('demos-sass', () => {
  return gulp.src(['./demos/src/*.scss'])
    .pipe(sass({
      'outputStyle': argv.dev ? 'development' : 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(demos_dest));
});

gulp.task('demos-html', () => {
  const demos = glob.sync('./demos/src/*.html') || [];

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
    .pipe(gulp.dest(demos_dest));
});

const compile = (openHtml) => {
  openHtml = openHtml || false;

  const demos = glob.sync('./demos/src/*.html') || [];
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
    return gulp.src('./demos/src/index.html')
      .pipe(template(template_options))
      .pipe(gulp.dest(demos_dest))
      .pipe(open());
  }
  else {
    return gulp.src('./demos/src/index.html')
      .pipe(template(template_options))
      .pipe(gulp.dest(demos_dest));
  }
};

gulp.task('open-html', () => {
  compile(true);
});

gulp.task('main-html', () => {
  compile(false);
});

gulp.task('watch', ['js', 'demos-sass', 'demos-html', 'open-html'], () => {
  gulp.watch(['./src/*.js'], ['js']);
  gulp.watch(['./**/*.scss'], ['demos-sass']);
  gulp.watch(['./**/*.html'], ['demos-html', 'main-html']);
});

gulp.task('default', ['js', 'demos-sass', 'demos-html', 'open-html']);
