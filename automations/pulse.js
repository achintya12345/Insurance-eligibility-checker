const {
  PULSE_URL,
  PULSE_ELIGIBILITY_URL,
  WAIT_TIME,
  LOGIN_DOM_CHANGED,
  ELIGIBILITY_PAGE_DOM_CHANGED,
  ELIGIBILITY_TAB_DOM_CHANGED,
  EMIRATES_ID_SECTION_ERROR,
  EXTRACTING_ELIGIBILITY_ERROR,
  EXECUTION_ERROR,
  PULSE_USERNAME,
  PULSE_PASSWORD,
} = require("./constants.js");

const { NoSuchElementError } = require("selenium-webdriver").error;
const { writeScreenshot } = require("../utility.js");

async function login(webdriver, driver, logger, username, password) {
  let loginStatus = false;

  try {
    // go to webpage
    await driver.get(PULSE_URL);

    // find username and password elements
    const usernameField = await driver.findElement(
      webdriver.By.id("txtUserName")
    );
    const passwordField = await driver.findElement(
      webdriver.By.id("txtPassword")
    );

    // set the password and username
    await usernameField.sendKeys(username);
    await passwordField.sendKeys(password);

    // find the login button and click it, wait for 10 seconds.
    await driver.executeScript(
      "document.getElementById('btnLogin').scrollIntoView();"
    );
    /*await driver.sleep(1 * 10000);*/
    const login_button = await driver.findElement(webdriver.By.id("btnLogin"));
    await driver.wait(login_button.click(), WAIT_TIME);

    loginStatus = true;
  } catch (e) {
    logger.error(LOGIN_DOM_CHANGED);
  }
  return loginStatus;
}

async function navigate_to_eligibility_page(webdriver, driver, logger) {
  let eligibilityStatus = false;

  try {
    // if login was successful then DOM will have an element with side-menu
    await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id("side-menu")),
      WAIT_TIME
    );

    // navigate to a eligibility page
    await driver.get(PULSE_ELIGIBILITY_URL);

    eligibilityStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(ELIGIBILITY_PAGE_DOM_CHANGED);
    }
  }
  return eligibilityStatus;
}

async function click_on_eligbility_tab(webdriver, driver, logger) {
  let eligibilityTabStatus = false;

  try {
    // find tab and switch to it
    activate_tab = driver.findElement(
      webdriver.By.xpath("//label[@href= '#tab-3']")
    );
    await activate_tab.click();

    eligibilityTabStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(ELIGIBILITY_TAB_DOM_CHANGED);
    }
  }
  return eligibilityTabStatus;
}

async function fill_emirates_id_details(webdriver, driver, logger, emiratesId) {
  let emiratesIdStatus = false;

  try {
    // find text box that will take national ID
    const emirates_id = await driver.findElement(
      webdriver.By.id("txtIDTypeValue")
    );
    await emirates_id.sendKeys(emiratesId);

    // run pure javascript to select option from select
    // 2 is out-patient
    driver.executeScript(
      "document.getElementById('ctl00_ContentPlaceHolderBody_cmbType').value = 2"
    );

    // submit the form
    const submit_button = await driver.findElement(
      webdriver.By.id("btnCheckEligibilityorSearchbyPolicy")
    );
    await submit_button.click();

    emiratesIdStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(EMIRATES_ID_SECTION_ERROR);
    }
  }
  return emiratesIdStatus;
}

async function extract_eligibility(webdriver, driver, logger) {
  // check if banner that appears when eligibity is there shows up or not
  // if not return false else true
  let status = false;

  try {
    await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id("lblResultMessage1")),
      WAIT_TIME
    );

    const elements = await driver.findElements(
      webdriver.By.id("lblResultMessage1")
    );
    if (elements.length > 0) {
      driver.takeScreenshot().then(function (data) {
        writeScreenshot(data, "pulse_last_run");
      });
      status = true;
    }
    await logout(driver, logger);
  } catch (e) {
    logger.error(EXTRACTING_ELIGIBILITY_ERROR);
    await logout(driver, logger);
  }
}

async function execute(
  webdriver,
  logger,
  driver,
  mainWindow,
  emiratesID,
  phoneNumber
) {
  try {
    const loginStatusResult = await login(
      webdriver,
      driver,
      logger,
      PULSE_USERNAME,
      PULSE_PASSWORD
    );

    if (loginStatusResult == false) {
      throw "";
    }

    const eligibilityStatusResult = await navigate_to_eligibility_page(
      webdriver,
      driver,
      logger
    );

    if (eligibilityStatusResult == false) {
      throw "";
    }

    const eligibilityTabResult = await click_on_eligbility_tab(
      webdriver,
      driver,
      logger
    );

    if (eligibilityTabResult == false) {
      throw "";
    }

    const emiratesIdStatusResult = await fill_emirates_id_details(
      webdriver,
      driver,
      logger,
      emiratesID
    );

    if (emiratesIdStatusResult == false) {
      throw "";
    }

    let is_eligible = await extract_eligibility(webdriver, driver, logger);
    mainWindow.webContents.send("eligibility-check-result", {
      is_eligible: is_eligible,
      provider: "pulse",
      screenshot: "View",
    });
  } catch (e) {
    logger.error(EXECUTION_ERROR);
  }
}

module.exports.pulse_execute = execute;
