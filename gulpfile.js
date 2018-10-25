const gulp = require('gulp');
const browserify = require('browserify');
const log = require('fancy-log');
const tap = require('gulp-tap');
const buffer = require('gulp-buffer');
const babelify = require('babelify');

gulp.task("build-test-src", () => {
    return gulp.src('./test/integration/pages/src/**/*.js', { read: false })
        .pipe(tap(function(file) {
            log('bundling ' + file.path);
            file.contents = browserify(file.path, { debug: false })
                                .transform(babelify)
                                .bundle();
        }))
        .pipe(gulp.dest('./test/integration/pages/assets'));
})

gulp.task('build-test-target-src', () => {
    return gulp.src('./src/**/*.js', { read: false })
        .pipe(tap(function(file) {
            file.contents = browserify(file.path, { debug: false })
                                .transform(babelify)
                                .bundle();
        }))
        .pipe(gulp.dest('./test/integration/pages/assets'));
})

gulp.task("build-test", gulp.series(gulp.parallel("build-test-src", "build-test-target-src")))
