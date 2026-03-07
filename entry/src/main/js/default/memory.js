console.info("memory.js onImport");

const _this = {
  init,
  save,
};

const defaults = {
  paths: [],
  position: 0,

  viewTextHistory: [],

  theme: "纯黑",
  bgColor: "#000",
  textColor: "#fff",
  fontSize: "30px",
  autoPagerSpeed: 5,

  scriptWarningFinished: false,
};

function init(onDone) {
  const keys = Object.keys(defaults);

  function next() {
    if (keys.length === 0) {
      return onDone && onDone(_this);
    }
    const key = keys.shift();
    load(key, next);
  }

  next();
}

function load(key, then) {
  $app.getImports().file.readText({
    uri: `internal://app/kvstore/${key}`,
    fail: (data, code) => {
      console.info(`file.readText ${key} not exist`);
      _this[key] = defaults[key];
    },
    success: d => {
      console.info(`file.readText ${key} success`);
      _this[key] = JSON.parse(d.text);
    },
    complete: () => {
      return then && then(_this[key]);
    },
  });
}

function save(key, then) {
  $app.getImports().file.writeText({
    uri: `internal://app/kvstore/${key}`,
    text: JSON.stringify(_this[key]),
    fail: (data, code) => {
      console.error(`file.writeText ${key} failed: ${code} ${data}`);
    },
    success: () => {
      console.info(`file.writeText ${key} success`);
    },
    complete: () => {
      return then && then(_this[key]);
    }
  });
}

export default _this;