"use strict";

/**
 * Helper script that performs mongodb tooling operations
 */

const spawn = require("child_process").spawn;
const path = require("path");
const Promise = require("bluebird");
const _ = require("underscore");
const moment = require("moment");
const ArgumentsParser = require("./common/ArgumentsParser");

class Mongo extends ArgumentsParser {
  constructor(app, argsCfg, options) {
    super(argsCfg, options);

    let self = this;

    self.app = app;
  }

  /**
   * Get directory path to the latest saved database dump
   * @returns {Promise}
   */
  getDumpDirLatest() {
    let backupDir = path.join(
      this.app.config.dir.root,
      this.app.config.dir.backup.db.mongo,
      this.app.config.database_mongo.name
    );
    let latestDumpDir = "";

    return this.app.Util.Fs.scanDir(backupDir, (filepath, basename) => {
      if (_.isEmpty(latestDumpDir)) {
        latestDumpDir = basename;
      } else if (latestDumpDir < basename){
        latestDumpDir = basename;
      }
    }).then(() => {
      return latestDumpDir
        ? path.join(backupDir, latestDumpDir)
        : undefined
    });
  }

  /**
   * Get directory path to save database dump into
   * @returns {String}
   */
  getDumpDir() {
    return path.join(
      this.app.config.dir.root,
      this.app.config.dir.backup.db.mongo,
      this.app.config.database_mongo.name,
      moment().format("YYYYMMDD_HHmmss")
    );
  }
  execute(args) {
    let self = this;

    return Promise.resolve().then(() => {
      // promise of child process
      let innerPromise = Promise.resolve();
      let parsed = super.parse(args);

      if (parsed.help) {
        // display help information
        console.log("Options:");
        console.log("--help\t\tprint help information");
        console.log(`--dump\t\tcreate dump and save into ${self.app.config.dir.backup.db.mongo}`);
        console.log(`--restore\t\trestore dumped data into database`);
      } else if (parsed.dump) {
        // perform data dump
        let command = "mongodump";
        let dir = self.getDumpDir();
        let args = ["--db", self.app.config.database_mongo.name, "--out", dir, "--verbose"];

        console.log(`Executing "${command} ${args.join(" ")}"...`);

        let mongodump = spawn(command, args);

        // execute child process inside a promise
        innerPromise = new Promise((fulfill, reject) => {
          mongodump.stdout.on("data", (data) => {
            console.log(`\t${data.toString("utf8")}`);
          });

          mongodump.stderr.on("data", (data) => {
            console.log(`\t${data.toString("utf8")}`);
          });

          mongodump.on("close", (code) => {
            if (!code) {
              console.log(`Dump was saved under the directory ${dir}`);
              fulfill();
            } else {
              console.log(`An error occurred inside child process "${command}". Exit code is ${code}`)
              reject();
            }
          });
        });
      } else if (!_.isEmpty(parsed.restore)) {
        // perform data restore
        innerPromise = self
          .getDumpDirLatest()
          .then((dir) => {
            if (_.isEmpty(dir)) {
              // no backup exists
              return Promise.reject(new Error("There are no backups"));
            } else {
              // restore database from a dump
              let command = "mongorestore";
              let args = ["--dir", dir, "--verbose"];

              console.log(`Executing "${command} ${args.join(" ")}"...`);

              let mongorestore = spawn(command, args);

              return new Promise((fulfill, reject) => {
                mongorestore.stdout.on("data", (data) => {
                  console.log(`\t${data.toString("utf8")}`);
                });

                mongorestore.stderr.on("data", (data) => {
                  console.log(`\t${data.toString("utf8")}`);
                });

                mongorestore.on("close", (code) => {
                  if (!code) {
                    console.log(`Dump was restored from the directory ${dir}`);
                    fulfill();
                  } else {
                    console.log(`An error occurred inside child process "${command}". Exit code is ${code}`)
                    reject();
                  }
                });
              });
            }
          })
      } else {
        // no action was specified
        self.notify(Mongo.ACTION.NO_ACTION);
      }

      return innerPromise;
    });
  }
}

/** Extended available parse actions */
Mongo.ACTION = _.extend({}, ArgumentsParser.ACTION, {
  NO_ACTION: "NO_ACTION"
});

module.exports = (app, args, callback) => {
  let mongoArgsCfg = {
    help: {},
    dump: {},
    restore: {
      type: ArgumentsParser.TYPE.VALUED,
      defValue: "latest",
      values: ["latest", /./]
    }
  };
  let mongo = new Mongo(app, mongoArgsCfg);

  mongo.addListener(Mongo.ACTION.NOT_RECOGNIZED, (arg) => {
    console.log(`Argument "--${arg}" is not recognized. It is skipped.`);
  });

  mongo.addListener(Mongo.ACTION.NOT_VALID, (arg, value) => {
    console.log(`Argument's value "--${arg}:${value}" is not valid. Argument is skipped.`);
  });

  mongo.addListener(Mongo.ACTION.NO_ACTION, () => {
    console.log("No action was specified.");
  });

  return mongo
    .execute(args)
    .then(() => {
      return callback();
    })
    .catch((err) => {
      return callback(err);
    });
};