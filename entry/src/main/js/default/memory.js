console.info("memory.js onImport");

const _this = {
  init,
  save,
};

const defaults = {
  paths: [],
  position: 0,

  theme: "纯黑",
  bgColor: "#000",
  textColor: "#fff",
  fontSize: "30px",
  turnPageSpeed: 5,
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
  $app.getImports().storage.get({
    key: key,
    default: "",
    success: v => {
      if (v === "") {
        console.info("storage.get " + key + " not exist");
        _this[key] = defaults[key];
      } else {
        console.info("storage.get " + key + " success, value=" + v);
        const parsed = JSON.parse(v);
        _this[key] = parsed;
      }

      return then && then(_this[key]);
    },
  });
}

function save(key, then) {
  $app.getImports().storage.set({
    key: key,
    value: JSON.stringify(_this[key]),
    success: () => {
      console.info(`storage.set ${key} success`);
      if (then) return then(_this[key]);
    },
  });
}

export default _this;