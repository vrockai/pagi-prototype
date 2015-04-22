'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');

var util = require('util');

var middleware = require('./proxy');

module.exports = function(options) {

  function browserSyncInit(baseDir, browser) {
    browser = browser === undefined ? 'default' : browser;

    var routes = null;
    if(baseDir === options.src || (util.isArray(baseDir) && baseDir.indexOf(options.src) !== -1)) {
      routes = {
        '/bower_components': 'bower_components'
      };
    }

    var server = {
      baseDir: baseDir,
      routes: routes
    };

    if(middleware.length > 0) {
      server.middleware = middleware;
    }

    browserSync.instance = browserSync.init({
      startPath: '/',
      server: server,
      browser: browser
    });
  }

  browserSync.use(browserSyncSpa({
    selector: '[ng-app]'// Only needed for angular apps
  }));

  gulp.task('serve', ['watch', 'nodemon'], function () {
    browserSyncInit([options.tmp + '/serve', options.src]);
  });

  gulp.task('serve:dist', ['build'], function () {
    browserSyncInit(options.dist);
  });

  gulp.task('serve:e2e', ['inject'], function () {
    browserSyncInit([options.tmp + '/serve', options.src], []);
  });

  gulp.task('serve:e2e-dist', ['build'], function () {
    browserSyncInit(options.dist, []);
  });

  gulp.task('nodemon', function(cb) {
    var nodemon = require('gulp-nodemon');

    // We use this `called` variable to make sure the callback is only executed once
    var called = false;
    return nodemon({
      script: 'src/rest/server.js',
      watch: ['src/rest/server.js']
    })
      .on('start', function onStart() {
        if (!called) {
          cb();
        }
        called = true;
      })
      .on('restart', function onRestart() {

        // Also reload the browsers after a slight delay
        setTimeout(function reload() {
          browserSync.reload({
            stream: false
          });
        }, 500);
      });
  });
};
