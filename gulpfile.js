const { src, dest, parallel, watch } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const changed = require("gulp-changed");
const imagemin = require("gulp-imagemin");
const rename = require("gulp-rename");
const ejs = require("gulp-ejs");
const browserSync = require("browser-sync").create();

const html = () => {
  return src(["src/ejs/**/*.ejs", "!" + "src/ejs/**/_*.ejs"])
    .pipe(ejs({}, {}, { ext: ".html" }))
    .pipe(rename({ extname: ".html" }))
    .pipe(dest("./docs"))
    .pipe(browserSync.stream());
};

const CSS = () => {
  return src("./src/sass/**/*.scss")
    .pipe(
      sass({
        outputStyle: "compressed",
      }).on("error", sass.logError)
    )
    .pipe(autoprefixer({ grid: true }))
    .pipe(dest("./docs/css"));
};

const image = () => {
  return src("./src/images/**/*.+(jpg|png|gif)")
    .pipe(changed("./docs/images"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
      ])
    )
    .pipe(dest("./docs/images"));
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./docs",
    },
    open: "external",
    host: "192.168.0.24",
  });
  watch("./src/sass/**/*.scss", CSS);
  watch("./src/images/**/*.+(jpg|png|gif)", image);
  watch("./src/ejs/**/*.ejs", html);
  watch("./docs/**/*").on("change", browserSync.reload);
};

exports.html = html;
exports.CSS = CSS;
exports.image = image;
exports.watchFiles = watchFiles;
exports.default = parallel(html, CSS, image, watchFiles);
