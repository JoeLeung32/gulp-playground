var {src, dest, series, watch} = require('gulp');
var babel = require('gulp-babel');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify-es').default;
var stripDebug = require('gulp-strip-debug');

var namespace = 'shg';
var destinations = [
  './dist',
];
var jsList = [
  './js/*.js',
];

sass.compiler = require('node-sass');

function jsWatchTask() {
  watch(jsList, jsBuildTask);
}

function scssWatchTask() {
  watch('./scss/**/*.scss', scssBuildTask);
}

function jsBuildTask() {
  var pipeLine;
  pipeLine = src(jsList);
  pipeLine = pipeLine.pipe(concat(`${namespace}.js`));
  pipeLine = pipeLine.pipe(
    babel({
      presets: ['@babel/env'],
    }),
  );
  if (process.env.NODE_ENV === 'production') {
    pipeLine = pipeLine.pipe(stripDebug());
  }
  pipeLine = pipeLine.pipe(uglify());
  pipeLine = pipeLine.pipe(rename(`${namespace}.min.js`));
  destinations.forEach(function (d) {
    pipeLine = pipeLine.pipe(dest(d));
  });
  return pipeLine;
}

function scssBuildTask() {
  var pipeLine;
  pipeLine = src(['./scss/main.scss']);
  if (process.env.NODE_ENV === 'development') {
    pipeLine = pipeLine.pipe(sass().on('error', sass.logError));
  }
  if (process.env.NODE_ENV === 'production') {
    pipeLine = pipeLine.pipe(
        sass({outputStyle: 'compressed'}).on('error', sass.logError),
    );
  }
  pipeLine = pipeLine.pipe(rename(`${namespace}.min.css`));
  destinations.forEach(function (d) {
    pipeLine = pipeLine.pipe(dest(d));
  });
  return pipeLine;
}

exports.default = series(
  scssBuildTask,
  jsBuildTask,
  scssWatchTask,
  jsWatchTask,
);

exports.buildCss = series(scssBuildTask, scssWatchTask);
exports.buildJs = series(jsBuildTask, jsWatchTask);
