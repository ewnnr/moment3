//Objekt för att hämta in gulp-paket
const { src, dest, parallel, series, watch } = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');

//Objekt för att hämta sökvägar
const files = {
    htmlPath: "src/**/*.html",
    cssPath: "src/css/*.css",
    sassPath: "src/sass/*.scss",
    jsPath: "src/js/*.js",
    imagePath: "src/images/*"
}

//HTML-task, kopierar över alla html-filer till pub-katalogen
function copyHTML() {
    return src(files.htmlPath)
        .pipe(dest('pub'));
}

//Css/sass-task, slår ihop filerna till en och samma fil main.css,kompilerar sass till css, minifierar (tar bort kommentarer och radbrytningar), skapar sourcemap,skriver över till publiceringsmappen, livereload på css för att slippa uppdatera webbläsarfönstret manuellt. 

function cssTask() {
    return src(files.sassPath)
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(concat('main.css'))
        .pipe(cssnano())
        .pipe(dest('pub/css'))
        .pipe(browserSync.stream());
}

//JS-task, slår ihop filerna till en och samma main.jss, minifierar (tar bort kommentarer och radbrytningar), skriver över till publiceringsmappen.
function jsTask() {
    return src(files.jsPath)
        .pipe(concat('main.js'))
        .pipe(terser())
        .pipe(dest('pub/js'));
}

//Images-task, komprimerar bilder som ligger i bildmappen, skriver sedan över dem till publiceringsmappen för bilder. 
function imagesTask() {
    return (src(files.imagePath))
        .pipe(imagemin())
        .pipe(dest('pub/images'))
}

//Watch-task samt liveserver, letar efter förändringar i src-katalogen, blir det en förändring så skrivs den över till publiceringsmappen. 
function watchTask() {
    browserSync.init({
        server: "./pub"
    });

    watch([files.htmlPath, files.jsPath, files.imagePath, files.sassPath], parallel(copyHTML, cssTask, jsTask, imagesTask)).on('change', browserSync.reload);

}
//Kör alla tasks i en serie, dvs en efter en, watchtasken håller koll efter förändringar och kör tasksens parallelt
exports.default = series(
    parallel(copyHTML, cssTask, jsTask, imagesTask),
    watchTask);