const {
  ALMADALLAH_URL,
  ALMADALLAH_ELIGIBILITY_URL,
  WAIT_TIME,
  LOGIN_DOM_CHANGED,
  ELIGIBILITY_PAGE_DOM_CHANGED,
  EMIRATES_ID_SECTION_ERROR,
  EXTRACTING_ELIGIBILITY_ERROR,
  EXECUTION_ERROR,
  LOG_OUT_ERROR,
  ALMADA_USERNAME,
  ALMADA_PASSWORD,
} = require("./constants.js");

const { writeScreenshot } = require("../utility.js");

const { NoSuchElementError } = require("selenium-webdriver").error;

async function login(webdriver, logger, driver, username, password) {
  let loginStatus = false;

  try {
    // go to webpage
    await driver.get(ALMADALLAH_URL);

    // find username and password elements
    const usernameField = await driver.findElement(
      webdriver.By.id("ctl00_contDefaultMaster_rtbUserName")
    );

    const passwordField = await driver.findElement(
      webdriver.By.id("ctl00_contDefaultMaster_rtbPassword")
    );

    // set the password and username
    await usernameField.sendKeys(username);
    await passwordField.sendKeys(password);

    // find the login button and click it, wait for 10 seconds.
    /*await driver.executeScript("document.getElementById('ctl00_contDefaultMaster_rbLogin');");
        await driver.sleep(1 * 10000);*/
    const login_button = await driver.findElement(
      webdriver.By.id("ctl00_contDefaultMaster_rbLogin")
    );
    await driver.wait(login_button.click(), WAIT_TIME);

    loginStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(LOGIN_DOM_CHANGED);
    } /*else{
            logger.error(LOGIN_UNKNOWN_ERR);
        }*/
  }
  return loginStatus;
}

async function navigate_to_eligibility_page(webdriver, logger, driver) {
  let eligibilityStatus = false;

  try {
    // click on the member option in navbar
    await driver.executeScript(
      "document.querySelector(\"a[id='repAppMenus_ancMenu_0']\").click()"
    );

    // and navigate to a eligibility page
    await driver.get(ALMADALLAH_ELIGIBILITY_URL);

    eligibilityStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(ELIGIBILITY_PAGE_DOM_CHANGED);
    }
  }
  return eligibilityStatus;
}

async function fill_emirates_id_details(webdriver, logger, driver, emiratesId) {
  let emiratesIdStatus = false;

  try {
    // find text box that will take national ID
    const emirates_id = await driver.findElement(
      webdriver.By.id("ctl00_contDefaultMaster_rtbMemberCardNoOrEmiratesIDNo")
    );
    await emirates_id.sendKeys(emiratesId);

    // submit the form
    const submit_button = await driver.findElement(
      webdriver.By.id("ctl00_contDefaultMaster_rbtRegister")
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

async function logout(driver, logger) {
  try {
    //click on the signout button and exit
    await driver.executeScript(
      "document.querySelector(\"a[id='lbSignOut']\").click()"
    );
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(LOG_OUT_ERROR);
    } 
  }
}

async function extract_eligibility(webdriver, logger, driver) {
  // check if banner that appears when eligibity is there shows up or not
  // if not return false else true
  let status = false;
  
  try {
    await driver.wait(
      webdriver.until.elementLocated(
        webdriver.By.id("contDefaultMaster_rptMemberInfo_lblCardNo_0")
      ),
      WAIT_TIME
    );

    const elements = await driver.findElements(
      webdriver.By.id("contDefaultMaster_rptMemberInfo_lblCardNo_0")
    );

    if (elements.length > 0) {
      driver.takeScreenshot().then(function (data) {
        writeScreenshot(data, "almadallah_last_run");
      });
      status = true;
    }
    await logout(driver, logger)
  } catch (e) {
      logger.error(EXTRACTING_ELIGIBILITY_ERROR);
      await logout(driver, logger);
    } 
    return status;
  }

async function close(webdriver, driver)  {
  await driver.close();
  await driver.quit();
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
      logger,
      driver,
      ALMADA_USERNAME,
      ALMADA_PASSWORD
    );

    if (loginStatusResult == false) {
      throw "";
    }

    const eligibilityStatusResult = await navigate_to_eligibility_page(
      webdriver,
      logger,
      driver
    );

    if (eligibilityStatusResult == false) {
      throw "";
    }

    const emiratesIdStatusResult = await fill_emirates_id_details(
      webdriver,
      logger,
      driver,
      emiratesID
    );

    if (emiratesIdStatusResult == false) {
      throw "";
    }

    is_eligible = await extract_eligibility(webdriver, logger, driver);
    mainWindow.webContents.send("eligibility-check-result", {
      is_eligible: is_eligible,
      provider: "almadallah",
      screenshot: "View",
    });
  } catch (e) {
    logger.error(EXECUTION_ERROR);
    logger.error(e);
  }
}

module.exports.almadallah_execute = execute;
