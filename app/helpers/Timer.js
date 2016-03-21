"use strict";

const _ = require("underscore");
const moment = require("moment");

class Timer {
  contructor() {
    let self = this;

    self.start = new Date().getTime();
    self.checkpoints = [];
  }
  startPoint() {
    this.start = new Date().getTime();
    this.checkpoints = [];
  }
  checkpoint() {
    let self = this;
    let time = new Date().getTime();

    this.checkpoints.push({
      time: time,
      diff: time - this.start,
      diffPrev: time - (_.last(self.checkpoints) || []).time || 0
    });
  }
  print() {
    let self = this;

    console.log(`Start time: ${moment(self.start).toISOString()}\nCheckpoints:`);

    _.each(self.checkpoints, (checkpoint, i) => {
      console.log(`\t${i})\t\t${moment(checkpoint.time).toISOString()}\t\t${checkpoint.diff} ms\t\t${checkpoint.diffPrev} ms`)
    });
  }
}

const Singleton = (() => {
  let instance;

  return {
    getInstance() {
      if (_.isUndefined(instance)) {
        instance = new Timer();
      }

      return instance;
    }
  }
})();

module.exports = Singleton;