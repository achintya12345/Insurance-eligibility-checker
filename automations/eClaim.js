const {
  ECLAIM_URL,
  ECLAIM_ELIGIBILITY_PAGE_URL,
  WAIT_TIME,
  LOGIN_DOM_CHANGED,
  POP_UP_DOM_CHANGED,
  NAVIGATE_TO_ELIGIBILITY_ERROR,
  EMIRATES_ID_SECTION_ERROR,
  EXTRACTING_ELIGIBILITY_ERROR,
  EXECUTION_ERROR,
  LOG_OUT_ERROR,
  ECLAIM_USERNAME,
  ECLAIM_PASSWORD,
} = require("./constants.js");

const { writeScreenshot } = require("../utility.js");
const { NoSuchElementError } = require("selenium-webdriver");

async function login(webdriver, driver, username, password, logger) {
  let loginStatus = false;

  try {
    // go to webpage
    await driver.get(ECLAIM_URL);

    // find username and password elements
    const usernameField = await driver.findElement(
      webdriver.By.id(
        "ContentPlaceHolder1_LoginWithCaptcha1_loginBox_Login1_UserName"
      )
    );
    const passwordField = await driver.findElement(
      webdriver.By.id(
        "ContentPlaceHolder1_LoginWithCaptcha1_loginBox_Login1_Password"
      )
    );

    // TODO check if element was found or not

    // set the password and username
    await usernameField.sendKeys(username);
    await passwordField.sendKeys(password);

    // find the login button and click it, wait for 10 seconds.
    const login_button = await driver.findElement(
      webdriver.By.id(
        "ContentPlaceHolder1_LoginWithCaptcha1_loginBox_Login1_LoginButton"
      )
    );
    await driver.wait(login_button.click(), WAIT_TIME);

    loginStatus = true;
  } catch (e) {
    logger.error(LOGIN_DOM_CHANGED);
    logger.error(e);
  }
  return loginStatus;
}

async function close_the_pop_up(webdriver, driver, logger) {
  let closeThePopUpStatus = false;

  try {
    // if login was successful then DOM will show an pop-up
    await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id("breadcrumbs_Panel4")),
      WAIT_TIME
    );

    // close the pop-up by clicking update later button
    await driver.executeScript(
      "document.querySelector(\"input[id='breadcrumbs_Button1']\").click()"
    );

    closeThePopUpStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(POP_UP_DOM_CHANGED);
    }
  }
  return closeThePopUpStatus;
}

async function navigate_to_eligibility_page(webdriver, driver, logger) {
  let eligibilityStatus = false;

  try {
    // navigate to a eligibility page
    await driver.get(ECLAIM_ELIGIBILITY_PAGE_URL);

    eligibilityStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(NAVIGATE_TO_ELIGIBILITY_ERROR);
    }
  }
  return eligibilityStatus;
}

async function fill_emirates_id_details(webdriver, driver, emiratesId, logger) {
  let emiratesIdStatus = false;

  try {
    // if navigation was successful then DOM will have an element with ID main_section
    await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id("main_section")),
      WAIT_TIME
    );

    //select emirates ID option from drop down menu
    driver.executeScript(
      "document.getElementById('ContentPlaceHolder1_ddlTypes').value = 2"
    );

    //find text box that will take national ID
    const emirates_id = await driver.findElement(
      webdriver.By.id("ContentPlaceHolder1_txtMemberInfoByEmirateId")
    );
    await emirates_id.sendKeys(emiratesId);

    // submit the form
    const submit_button = await driver.findElement(
      webdriver.By.id("ContentPlaceHolder1_Button1")
    );
    await submit_button.click();

    emiratesIdStatus = true;
  } catch (e) {
    logger.error(EMIRATES_ID_SECTION_ERROR);
  }
  return emiratesIdStatus;
}

async function logout(driver, logger) {
  try {
    let response = await driver.executeScript("element = document.getElementById('LoginView1_LoginStatus1'); element.click();")    
  } catch (e) {
      logger.error(LOG_OUT_ERROR);
  }
}

async function extract_eligibility(webdriver, driver, logger) {
  // check if table that appears when eligibity is there shows up or not
  // if not return false else true
  let status = false;
  
  try {
    await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id("ContentPlaceHolder1_gv2")),
      WAIT_TIME
    );
    const elements = await driver.findElements(
      webdriver.By.id("ContentPlaceHolder1_gv2")
    );
    if (elements.length > 0) {
      // filename should be eClaim_last_run.png
      driver.takeScreenshot().then(function (data) {
        writeScreenshot(data, "eClaim_last_run");
      });
      status = true;
    }
    await logout(driver, logger);
  } catch (e) {
    logger.error(EXTRACTING_ELIGIBILITY_ERROR);
    await logout(driver, logger);
  } 
  return status;
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
      ECLAIM_USERNAME,
      ECLAIM_PASSWORD,
      logger
    );
    if (loginStatusResult == false) {
      throw "";
    }
    const popUpStatusResult = await close_the_pop_up(webdriver, driver, logger);

    if (popUpStatusResult == false) {
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

    const emiratesIdStatusResult = await fill_emirates_id_details(
      webdriver,
      driver,
      emiratesID,
      logger
    );
    if (emiratesIdStatusResult == false) {
      throw "";
    }

    let is_eligible = await extract_eligibility(webdriver, driver, logger);
    mainWindow.webContents.send("eligibility-check-result", {
      is_eligible: is_eligible,
      provider: "eClaim",
      screenshot: "View",
    });
  } catch (e) {
    logger.error(EXECUTION_ERROR);
    logger.error(e);
  }
}

module.exports.eclaim_execute = execute;
