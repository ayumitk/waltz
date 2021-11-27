let preprocessor = "sass";

import pkg from "gulp";
const { src, dest, parallel, series, watch } = pkg;

import browserSync from "browser-sync";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import sassglob from "gulp-sass-glob";
const sass = gulpSass(dartSass);
import postCss from "gulp-postcss";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";
import imagemin from "gulp-imagemin";
import changed from "gulp-changed";
import concat from "gulp-concat";
import ejs from "gulp-ejs";
import rename from "gulp-rename";

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "./docs",
    },
    open: "external",
    host: "192.168.0.20",
  });
}

function styles() {
  return src([`./src/${preprocessor}/*.*`, `!./src/${preprocessor}/_*.*`])
    .pipe(eval(`${preprocessor}glob`)())
    .pipe(eval(preprocessor)({ "include css": true }))
    .pipe(
      postCss([
        autoprefixer({ grid: "true" }),
        cssnano({
          preset: ["default", { discardComments: { removeAll: true } }],
        }),
      ])
    )
    .pipe(concat("style.min.css"))
    .pipe(dest("./docs/css"))
    .pipe(browserSync.stream());
}

function images() {
  return src(["./src/images/**/*"])
    .pipe(changed("./docs/images"))
    .pipe(imagemin())
    .pipe(dest("./docs/images"))
    .pipe(browserSync.stream());
}

function buildhtml() {
  return src(["./src/ejs/**/*.ejs", "!" + "./src/ejs/**/_*.ejs"])
    .pipe(ejs({}, {}, { ext: ".html" }))
    .pipe(rename({ extname: ".html" }))
    .pipe(dest("./docs"))
    .pipe(browserSync.stream());
}

function startwatch() {
  watch(`./src/${preprocessor}/**/*`, { usePolling: true }, styles);
  watch("./src/images/**/*", { usePolling: true }, images);
  watch("./src/ejs/**/*", { usePolling: true }, buildhtml);
  watch("./docs/**/*", { usePolling: true }).on("change", browserSync.reload);
}

export { styles, images, buildhtml };
export default series(
  styles,
  images,
  buildhtml,
  parallel(browsersync, startwatch)
);
