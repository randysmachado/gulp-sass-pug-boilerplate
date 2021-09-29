const { src, dest, watch, series, parallel } = require("gulp");
const pug = require("gulp-pug");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const babel = require("gulp-babel");
const terser = require("gulp-terser");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const browsersync = require("browser-sync").create();

// Pug taks
function pugTask() {
  return src("src/html/index.pug").pipe(pug()).pipe(dest("."));
}

// Sass task
function scssTask() {
  return src("src/scss/style.scss", { sourcemaps: true })
    .pipe(sass())
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: ["last 2 version"],
          cascade: false,
        }),
        cssnano(),
      ])
    )
    .pipe(rename("style.min.css"))
    .pipe(dest("dist/css"));
}

// JavaScript task
function jsTask() {
  return src("src/js/lib/**/*.js", { sourcemaps: true })
    .pipe(concat("script.js"))
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(terser({ compress: true }))
    .pipe(uglify())
    .pipe(rename("script.min.js"))
    .pipe(dest("dist/js"));
}

// Browsersync task
function browsersyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: ".",
    },
  });
  cb();
}

function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch task
function watchTask() {
  watch("*.html", browsersyncReload);
  watch(
    ["src/scss/**/*.scss", "src/js/**/*.js", "src/html/**/*.pug"],
    series(scssTask, jsTask, pugTask, browsersyncReload)
  );
}

// Default Gulp task
exports.default = series(
  parallel(scssTask, pugTask, jsTask),
  browsersyncServe,
  watchTask
);
