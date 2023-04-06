const {
  DAMAN_URL,
  WAIT_TIME,
  LOGIN_DOM_CHANGED,
  ELIGIBILITY_PAGE_DOM_CHANGED,
  EMIRATES_ID_SECTION_ERROR,
  EXTRACTING_ELIGIBILITY_ERROR,
  EXECUTION_ERROR,
  LOG_OUT_ERROR,
  DAMAN_PASSWORD,
  DAMAN_USERNAME,
} = require("./constants.js");

var fs = require("fs");
const { writeScreenshot } = require("../utility.js");

const { NoSuchElementError } = require("selenium-webdriver").error;

async function login(webdriver, driver, logger, username, password) {
  let loginStatus = false;

  try {
    console.log("Inside the try block of login");
    // go to webpage
    await driver.get(DAMAN_URL);

    //click on the sign-in button
    const signInButton = await driver.findElement(
      webdriver.By.xpath('//*[@id="navbar"]/div/div/div/ul[2]/li[1]/a')
    );
    await signInButton.click();

    // find username and password elements
    const usernameField = await driver.findElement(
      webdriver.By.id("j_username")
    );
    const passwordField = await driver.findElement(
      webdriver.By.id("j_password")
    );
    console.log("After finding the username and password fields");
    // set the password and username
    await usernameField.sendKeys(username);
    await passwordField.sendKeys(password);
    console.log("After sending the username and password field");

    // find the login button and click it.
    const loginButton = await driver.findElement(
      webdriver.By.xpath('//*[@id="form-sign-in"]/div/div/div[5]/div/button')
    );
    await loginButton.click();

    loginStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(LOGIN_DOM_CHANGED);
    }
  }
  return loginStatus;
}

async function navigate_to_eligibility_page(webdriver, driver, logger) {
  let eligibilityStatus = false;

  try {
    // if login was successful then DOM will have an element with class name "inside-content-boxes"
    await driver.wait(
      webdriver.until.elementLocated(
        webdriver.By.className("inside-content-boxes")
      ),
      WAIT_TIME
    );

    //select the emirates ID radio button
    const radioButton = await driver.findElement(
      webdriver.By.xpath(
        '//*[@id="mv_form"]/div/div[1]/section/div/div[2]/label/input'
      )
    );
    await radioButton.click();

    eligibilityStatus = true;
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(ELIGIBILITY_PAGE_DOM_CHANGED);
    }
  }
  return eligibilityStatus;
}

async function fill_emirates_id_details(webdriver, driver, logger, emiratesId) {
  let emiratesIdStatus = false;

  try {
    //code to slice the emirates ID and enter in the respective fields
    const birth_year = emiratesId.substring(4, 8);
    const random_seven_digit = emiratesId.substring(9, 16);
    const check_digit = emiratesId.substring(17);

    const birth_year_section = await driver.findElement(
      webdriver.By.id("eid2")
    );
    await birth_year_section.sendKeys(birth_year);

    const random_seven_digit_section = await driver.findElement(
      webdriver.By.id("eid3")
    );
    await random_seven_digit_section.sendKeys(random_seven_digit);

    const check_digit_section = await driver.findElement(
      webdriver.By.id("eid4")
    );
    await check_digit_section.sendKeys(check_digit);

    // submit the form
    const submit_button = await driver.findElement(
      webdriver.By.id("mv_search")
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
      "document.querySelector(\"a[href='redirectToLogout.action']\").click()"
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
      webdriver.until.elementLocated(webdriver.By.className("cardcontent")),
      WAIT_TIME
    );

    const elements = await driver.findElements(
      webdriver.By.className("cardcontent")
    );

    if (elements.length > 0) {
      driver.takeScreenshot().then(function (data) {
        writeScreenshot(data, "daman_last_run");
      });
      status = true;
    }
    await logout(driver, logger);
  } catch (e) {
    logger.error(EXTRACTING_ELIGIBILITY_ERROR);
    await logout(driver);
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
      DAMAN_USERNAME,
      DAMAN_PASSWORD
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

    const emiratesIdStatusResult = await fill_emirates_id_details(
      webdriver,
      driver,
      logger,
      emiratesID
    );

    if (emiratesIdStatusResult == false) {
      throw "";
    }

    is_eligible = await extract_eligibility(webdriver, driver, logger);
    mainWindow.webContents.send("eligibility-check-result", {
      is_eligible: is_eligible,
      provider: "daman",
      screenshot: "View",
    });
  } catch (e) {
    if (e instanceof NoSuchElementError) {
      logger.error(EXECUTION_ERROR);
    }
  } 
}

module.exports.daman_execute = execute;
