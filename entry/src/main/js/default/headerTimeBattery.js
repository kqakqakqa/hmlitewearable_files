console.info("headerTimeBattery.js onImport");

let onUpdate;
let hours, minutes;
let interval;

const _this = {
  subscribe: (onUpdateFn) => {
    onUpdate = onUpdateFn;
    clearInterval(interval);
    update();
    interval = setInterval(update, 1000);
  },
  time: "--:--",
  battery: "--%",
};

function update() {
  $app.getImports().battery.getStatus({
    success(status) {
      _this.time = getTimeStr(new Date());
      _this.battery = Math.round(status.level * 100) + "%";
    },
    complete: onUpdate,
  });
}

function getTimeStr(date) {
  hours = padNum(date.getHours());
  minutes = padNum(date.getMinutes());
  return hours + ":" + minutes;
}

function padNum(n) { return n < 10 ? "0" + n : n; }

export default _this;