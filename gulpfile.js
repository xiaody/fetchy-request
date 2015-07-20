/*jshint unused:true*/
'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    jscsReporter = require('gulp-jscs-stylish'),
    noop = function () {};

gulp.task('jshint', function () {
    gulp.src(['./**/*.js', '!./node_modules/**'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', function () {
    gulp.src(['./**/*.js', '!./node_modules/**'])
        .pipe(jscs())
        .pipe(jscsReporter());
});

gulp.task('default', ['jshint', 'jscs'], noop);
