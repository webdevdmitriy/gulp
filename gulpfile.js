const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const watch = require('gulp-watch')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')
const fileinclude = require('gulp-file-include')
const cleanCSS = require('gulp-clean-css')
const ftp = require('vinyl-ftp')
const gutil = require('gulp-util')

gulp.task('html', function (callback) {
	return gulp
		.src('./src/html/*.html')
		.pipe(
			plumber({
				errorHandler: notify.onError(function (err) {
					return {
						title: 'HTML include',
						sound: false,
						message: err.message
					}
				})
			})
		)
		.pipe(fileinclude({ prefix: '@@' }))
		.pipe(gulp.dest('./'))
	callback()
})

// Задача для старта сервера
gulp.task('server', function () {
	browserSync.init({
		server: {
			baseDir: './'
		}
	})
})

gulp.task('watch', function () {
	watch(['./index.html', './src/css/*.css', './src/js/*.js'], gulp.parallel(browserSync.reload))
	watch('./src/sass/*.sass', gulp.parallel('sass'))
	watch('./src/html/**/*.html', gulp.parallel('html'))
})

gulp.task('sass', function (callback) {
	return gulp
		.src('./src/sass/style.sass')
		.pipe(
			plumber({
				errorHandler: notify.onError(function (err) {
					return {
						title: 'Styles',
						sound: false,
						message: err.message
					}
				})
			})
		)
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(cleanCSS())
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 4 versions']
			})
		)
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./src/css/'))
	callback()
})

gulp.task('default', gulp.parallel('server', 'watch', 'sass', 'html'))

gulp.task('load', function () {
	var conn = ftp.create({
		host: '',
		user: '',
		password: '',
		parallel: 10,
		log: gutil.log
	})

	var globs = ['./src/**', 'index.html']

		.src(globs, { base: '.', buffer: false })
		.pipe(conn.newer('/www/plotnikovsite.ru/mysite/')) // only upload newer files
		.pipe(conn.dest('/www/plotnikovsite.ru/mysite/'))
})
