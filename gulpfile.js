/* eslint-disable no-console */
const gulp = require('gulp');
const babel = require('gulp-babel');
const pump = require('pump');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

/**
 * Dist Task
 * ---------
 * Creates dist version of the script.
 */
gulp.task('dist', gulp.series(cb => {
  pump([
      gulp.src('./src/*.js'),
      babel({
        plugins: [
          ['@babel/plugin-transform-modules-umd', {
            'globals': {
              'd3-array':      'd3',
              'd3-ease':       'd3',
              'd3-scale':      'd3',
              'd3-selection':  'd3',
              'd3-shape':      'd3',
              'd3-transition': 'd3'
            }
          }]
        ],
        presets: ['@babel/preset-env']
      }),
      gulp.dest('dist'),
//      uglify(),
      rename({ extname: '.min.js' }),
      gulp.dest('dist')
    ],
    cb
  );
}));

/**
 * Default Task
 * ------------
 * Creates a watcher to watch file changes.
 */
gulp.task('default', gulp.series('dist', () => {
  gulp.watch('./src/*.js', gulp.series('dist'))
    .on('change', (event) => {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
}));
