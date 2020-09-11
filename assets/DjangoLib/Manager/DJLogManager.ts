export class LogManager {
  managerName: string;

  constructor() {}

  isLog: boolean = true;

  log(...param) {
    if (!this.isLog) {
      return;
    }
    var backLog = console.log || window["log"];
    backLog.call(
      LogManager,
      "%s%s" + cc.js.formatStr.apply(cc, arguments),
      this._getDateString(),
      this._stack()
    );
  }

  info(...param) {
    if (!this.isLog) {
      return;
    }
    var backLog = console.log || cc.log || window["log"];
    backLog.call(
      LogManager,
      "%c%s%s:" + cc.js.formatStr.apply(cc, arguments),
      "color:#3385FF;",
      this._getDateString(),
      this._stack()
    );
  }

  log2(...param) {
    if (!this.isLog) {
      return;
    }
    var backLog = console.log || window["log"];
    backLog.call(
      LogManager,
      "%c%s%s:" + cc.js.formatStr.apply(cc, arguments),
      "color:#EED2EE;",
      this._getDateString(),
      this._stack()
    );
  }

  info2(...param) {
    if (!this.isLog) {
      return;
    }
    var backLog = console.log || window["log"];
    backLog.call(
      LogManager,
      "%c%s%s:" + cc.js.formatStr.apply(cc, arguments),
      "color:#4EC393;",
      this._getDateString(),
      this._stack()
    );
  }

  info3(...param) {
    if (!this.isLog) {
      return;
    }
    var backLog = console.log || window["log"];
    backLog.call(
      LogManager,
      "%c%s%s:" + cc.js.formatStr.apply(cc, arguments),
      "color:#9B30FF;",
      this._getDateString(),
      this._stack()
    );
  }

  warn(...param) {
    if (!this.isLog) {
      return;
    }
    var backLog = console.log || window["log"];
    backLog.call(
      LogManager,
      "%c%s%s:" + cc.js.formatStr.apply(cc, arguments),
      "color:#ee7700;",
      this._getDateString(),
      this._stack()
    );
  }

  error(...param) {
    if (!this.isLog) {
      return;
    }
    var backLog = cc.log || console.log || window["log"];
    backLog.call(
      LogManager,
      "%c%s%s:" + cc.js.formatStr.apply(cc, arguments),
      "color:red",
      this._getDateString()
    );
  }

  _stack() {
    var e = new Error();
    var lines = e.stack.split("\n");
    lines.shift();
    var result = [];
    lines.forEach(line => {
      line = line.substring(7);
      var lineBreak = line.split(" ");
      if (lineBreak.length < 2) {
        result.push(lineBreak[0]);
      } else {
        result.push({ [lineBreak[0]]: lineBreak[1] });
      }
    });
    var list = [];
    let result_idx = -1;
    for (var i = 0; i < result.length; i++) {
      for (var a in result[i]) {
        var l = a.split(".");
        if (l[0] !== "LogManager") {
          result_idx = i;
          break;
        }
      }
      if (result_idx >= 0) {
        break;
      }
    }
    let result_list = Object["keys"](result[2])[0].split("/");
    return result_list[result_list.length - 1];
  }

  _getDateString(): string {
    var d = new Date();
    var str = d.getHours() + "";
    var timeStr = "";
    timeStr += (str.length === 1 ? "0" + str : str) + ":";

    str = d.getMinutes() + "";
    timeStr += (str.length === 1 ? "0" + str : str) + ":";

    str = d.getSeconds() + "";
    timeStr += (str.length === 1 ? "0" + str : str) + ".";

    str = d.getMilliseconds() + "";
    if (str.length === 1) str = "00" + str;
    if (str.length === 2) str = "0" + str;
    timeStr += str;

    timeStr = "[" + timeStr + "]";

    return timeStr;
  }
}
