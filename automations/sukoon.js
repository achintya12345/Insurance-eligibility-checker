const {
  SUKOON_URL,
  WAIT_TIME,
  LOGIN_DOM_CHANGED,
  EMIRATES_ID_SECTION_ERROR,
  REQUEST_CONFIRM,
  FIRST_LINK_ERROR,
  EXTRACTING_ELIGIBILITY_ERROR,
  EXECUTION_ERROR,
  LOG_OUT_ERROR,
  SUKOON_LICENSE,
  SUKOON_PASSWORD,
  SUKOON_USERNAME,
} = require("./constants.js");

const { writeScreenshot } = require("../utility.js");

const { NoSuchElementError } = require("selenium-webdriver").error;

async function login(webdriver, driver, logger, license, username, password) {
  let loginStatus = false;

  try {
    // go to webpage
    await driver.get(SUKOON_URL);

    // find License, username and password elements
    const licenseField = await driver.findElement(webdriver.By.id("License"));

    const usernameField = await driver.findElement(webdriver.By.id("Username"));

    const passwordField = await driver.findElement(webdriver.By.id("Password"));

    // set the license, username and password
    await licenseField.sendKeys(license);
    await usernameField.sendKeys(username);
    await passwordField.sendKeys(password);

    // find the login button and click it.
    await driver.executeScript("document.getElementById('Button1');");
    const login_button = await driver.findElement(webdriver.By.id("Button1"));
    await driver.wait(login_button.click(), WAIT_TIME);

    loginStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(LOGIN_DOM_CHANGED);
    }
  }
  return loginStatus;
}

async function fill_emirates_id_details(webdriver, driver, logger, emiratesId) {
  let emiratesIdStatus = false;

  try {
    // if login was successful then DOM will have an element with ID "mainDiv"
    await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id("mainDiv")),
      WAIT_TIME
    );

    //select the members ID input field
    const members_id = await driver.findElement(
      webdriver.By.id("autoc_Member")
    );

    //enter the members ID or emirates ID in this case
    await members_id.sendKeys(emiratesId);

    //click on the work related checkBox
    driver.findElement(webdriver.By.id("WorkRelated")).click();

    //from select element, select the option of 'Unknown Status, Without A Card'
    var selectElement = driver.findElement(webdriver.By.id("ddl_EmiratesId"));
    selectElement.click();
    selectElement.sendKeys("Unknown Status, Without A Card");
    selectElement.click();

    //click on the submit button
    const submit_button = await driver.findElement(
      webdriver.By.id("RequestAuthorization")
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

async function request_confirmation(webdriver, driver, logger) {
  let confirmationRequestStatus = false;

  try {
    //Find the submit button to confirm the request
    const requestConfirmationbutton = await driver.findElement(
      webdriver.By.id("requestConfirmed")
    );
    await requestConfirmationbutton.click();

    confirmationRequestStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(REQUEST_CONFIRM);
    }
  }
  return confirmationRequestStatus;
}

async function click_on_first_link(webdriver, driver, logger) {
  let firstLinkStatus = false;

  try {
    //wait for the new link to generate
    await driver.sleep(WAIT_TIME);

    //find the first link and click on it
    const firstRowFourthElement = await driver.findElement(
      webdriver.By.xpath("//table/tbody/tr[1]/td[5]/a[1]")
    );
    await firstRowFourthElement.click();

    firstLinkStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(FIRST_LINK_ERROR);
    }
  }
  return firstLinkStatus;
}

async function logout(driver, logger) {
  try {
    //click on the signout button and exit
    await driver.executeScript(
      "document.querySelector(\"a[id='HeadLoginStatus']\").click()"
    );
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(LOG_OUT_ERROR);
    }
  }
}

async function extract_eligibility(webdriver, driver, logger) {
  // check if banner that appears when eligibity is there shows up or not
  // if not return false else true
  let status = false;

  try {
    await driver.wait(
      webdriver.until.elementLocated(webdriver.By.id("transactionActions")),
      WAIT_TIME
    );

    const elements = await driver.findElements(
      webdriver.By.id("transactionActions")
    );

    if (elements.length > 0) {
      // filename should be sukoon_last_run.png
      driver.takeScreenshot().then(function (data) {
        writeScreenshot(data, "sukoon_last_run");
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
      logger,
      SUKOON_LICENSE,
      SUKOON_USERNAME,
      SUKOON_PASSWORD
    );

    if (loginStatusResult == false) {
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

    const confirmationRequestStatusResult = await request_confirmation(
      webdriver,
      driver,
      logger
    );

    if (confirmationRequestStatusResult == false) {
      throw "";
    }

    const firstLinkStatusResult = await click_on_first_link(
      webdriver,
      driver,
      logger
    );

    if (firstLinkStatusResult == false) {
      throw "";
    }

    is_eligible = await extract_eligibility(webdriver, driver, logger);
    mainWindow.webContents.send("eligibility-check-result", {
        is_eligible: is_eligible,
        provider: "sukoon",
        screenshot: "View",
      });
  
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(EXECUTION_ERROR);
    }
  } 
}

module.exports.sukoon_execute = execute;
