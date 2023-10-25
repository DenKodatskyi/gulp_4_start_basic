/* VARIABLES ================================================= */
const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
let uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const gulpSvgSprite = require('gulp-svg-sprite');

/* FUNCTIONS ================================================ */
function scripts() {
  return src([
    'app/js/main.js',
    /* '!*.*' */
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
    .pipe(concat('style.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function images() {
  return src(['app/images/src/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images/dist'))
    .pipe(avif({ quality: 50 }))
    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images/dist'))
    .pipe(webp())
    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images/dist'))
    .pipe(imagemin())
    .pipe(dest('app/images/dist'))
}

function sprite() {
  return src('app/image/dist/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
          example: true
        }
      }
    }))
    .pipe(dest('app/images/dist'))
}

function watching() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    }
  })
  watch(['app/scss/style.scss'], styles)
  watch(['app/images/crs'], images)
  watch(['app/js/main.js'], scripts)
  watch(['app/*.html']).on('change', browserSync.reload)
}

function cleanDist() {
  return src('dist')
    .pipe(clean())
}

function building() {
  return src([
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/images/dist/*.*',
    'app/**/*.html',
  ], { base: 'app' })
    .pipe(dest('dist'))
}

/* MAIN ===================================================== */
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.sprite = sprite;
exports.watching = watching;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, images, watching);
