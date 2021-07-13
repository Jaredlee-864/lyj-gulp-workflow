const { src, dest, series, parallel, watch } = require("gulp");
const browserSync = require("browser-sync");
const cleanCss = require("gulp-clean-css");
const rename = require("gulp-rename");
const fs = require("fs");
const del = require("del");
const loadPlugins = require("gulp-load-plugins");
const sass = require("gulp-sass")(require("node-sass"));

/* exports.default = (done) => {
  src("src/*.html").pipe(dest("dist"));
  done(); // 表示任务完成
}; */

const data = {
  menus: [
    { name: "Home", icon: "aperture", link: "index.html" },
    { name: "Features", link: "features.html" },
    { name: "About", link: "about.html" },
    {
      name: "Contact",
      link: "#",
      children: [
        { name: "Twitter", link: "https://twitter.com/w_zce" },
        { name: "About", link: "https://weibo.com/zceme" },
        { name: "divider" },
        { name: "About", link: "https://github.com/zce" },
      ],
    },
  ],
  pkg: require("./package.json"),
  date: new Date(),
};

const plugins = loadPlugins();

const bs = browserSync.create();

const clean = () => {
  return del(["dist", "temp"]);
};

const style = () => {
  return src("src/assets/styles/*.scss", { base: "src" })
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};

const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(plugins.babel({ presets: ["@babel/preset-env"] }))
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};

const page = () => {
  return src("src/**/*.html", { base: "src" })
    .pipe(plugins.swig({ defaults: { cache: false }, data }))
    .pipe(dest("temp"));
};

const image = () => {
  return src("src/assets/images/**", { base: "src" }).pipe(plugins.imagemin()).pipe(dest("dist"));
};

const font = () => {
  return src("src/assets/fonts/**", { base: "src" }).pipe(plugins.imagemin()).pipe(dest("dist"));
};

const extra = () => {
  return src("publish/**", { base: "publish" }).pipe(dest("dist"));
};

const server = () => {
  watch("src/assets/styles/*.scss", style);
  watch("src/*.html", page);
  watch("src/assets/scripts/*.js", script);
  /* watch("src/assets/images/**", image);
  watch("src/assets/fonts/**", font);
  watch("publish/**", extra); */

  watch(["src/assets/images/**", "src/assets/fonts/**", "publish/**"], bs.reload);

  bs.init({
    notify: false, // 取消启动通知
    files: "temp/**",
    // port:3000,
    server: {
      baseDir: ["temp", "src", "publish"], // 从第一个依次去找对应的文件
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });
};

const useref = () => {
  return src("temp/*.html", { base: "temp" })
    .pipe(plugins.useref({ searchPath: ["temp", "."] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(
      plugins.if(
        /\.html$/,
        plugins.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
        })
      )
    )
    .pipe(dest("dist"));
};

const compile = parallel(style, script, page);

const build = series(clean, parallel(series(compile, useref), extra, image, font));

const develop = series(compile, server);
module.exports = {
  clean,
  build,
  develop,
};

/* const task1 = (done) => {
  setTimeout(() => {
    console.log("task1 working~");
    done();
  });
};

const task2 = (done) => {
  setTimeout(() => {
    console.log("task2 working~");
    done();
  });
};

const task3 = (done) => {
  setTimeout(() => {
    console.log("task3 working~");
    done();
  });
};

exports.foo = series(task1, task2, task3);

exports.bar = parallel(task1, task2, task3);

exports.callback = (done) => {
  console.log("callback task~");
  done();
};

exports.callback_error = (done) => {
  console.log("callback task~");
  done(new Error("task failed!"));
};

exports.promise = () => {
  console.log("promise task~");
  return Promise.resolve();
};

exports.promise_err = () => {
  console.log("promise_error task");
  return Promise.reject(new Error("promise task failed"));
};

const timer = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

exports.async = async () => {
  await timer(100);
  console.log("async task");
}; */

// 通过 stream 实现异步
/* exports.stream = () => {
  const readStream = fs.createReadStream("package.json");
  const writeStream = fs.createWriteStream("temp.txt");
  readStream.pipe(writeStream);
  return readStream;
}; */

// 模拟gulp通过流结束操作
/* exports.stream = (done) => {
  const readStream = fs.createReadStream("package.json");
  const writeStream = fs.createWriteStream("temp.txt");
  readStream.pipe(writeStream);
  readStream.on("end", () => {
    done();
  });
}; */
