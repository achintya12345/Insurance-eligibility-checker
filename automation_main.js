const { almadallah_execute } = require("./automations/almadallah.js");
const { daman_execute } = require("./automations/daman.js");
const { eclaim_execute } = require("./automations/eClaim.js");
const { sukoon_execute } = require("./automations/sukoon.js");
const { pulse_execute } = require("./automations/pulse.js");

const chromedriver = require("chromedriver");
const chrome = require("selenium-webdriver/chrome");
const options = new chrome.Options().addArguments("--headless");

const webdriver = require("selenium-webdriver");

class AutomationMain {
  constructor(numInstances, logger, mainWindow) {
    this.instances = [];
    this.logger = logger;
    this.mainWindow = mainWindow;
    this.numInstances = numInstances;
    // this.providers = [almadallah_execute, daman_execute, sukoon_execute, pulse_execute];
    this.providers = [almadallah_execute, sukoon_execute, eclaim_execute];

    for (let i = 0; i < numInstances; i++) {
      var instance = new webdriver.Builder()
        .forBrowser("chrome")
        //.setChromeOptions(options)
        .build();
      this.instances.push(instance);
    }
  }

  async check_eclaim(emiratesID, logger, mainWindow) {
    /* sequential check to see if eClaim has the data or not?. */
    /* run automation only if eClaim doesn't have the insurance data */
    try {
      const instance = new webdriver.Builder().forBrowser("chrome").build();
      await eclaim_execute(
        webdriver,
        logger,
        instance,
        mainWindow,
        emiratesID,
        ""
      );
      await instance.quit();
      return true;
    } catch (error) {
      logger.error("An error occurred in check_eclaim:", error);
    }
    return false;
  }

  async start(emiratesId, phoneNumber) {
    let no_of_instances = this.numInstances;
    for (var i = 0; i < no_of_instances; ++i) {
      this.providers[i](
        webdriver,
        this.logger,
        this.instances[i],
        this.mainWindow,
        emiratesId,
        phoneNumber
      );
    }
  }

  async start(emiratesId, phoneNumber) {
    let no_of_instances = this.numInstances;
    for (var i = 0; i < no_of_instances; ++i) {
      this.providers[i](
        webdriver,
        this.logger,
        this.instances[i],
        this.mainWindow,
        emiratesId,
        phoneNumber
      );
    }
  }

  async close() {
    let no_of_instances = this.numInstances;
    for (var i = 0; i < no_of_instances; ++i) {
      await this.instances[i].close();
      await this.instances[i].quit();
    }
  }

  async checkInactiveInstances() {
    const inactiveInstances = [];
    for (const instance of this.instances) {
      try {
        await instance.getCurrentUrl();
      } catch (error) {
        if (
          error.name === "NoSuchSessionError" ||
          error.name === "NullPointerException"
        ) {
          inactiveInstances.push(instance);
        } else {
          throw error;
        }
      }
    }
    return inactiveInstances;
  }

  closeAll() {
    Promise.all(this.instances.map((instance) => instance.quit()));
  }
}

module.exports.AutomationMain = AutomationMain;
