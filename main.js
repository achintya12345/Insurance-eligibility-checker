const winston = require("winston");
const { format } = require("logform");

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { AutomationMain } = require("./automation_main.js");
const { PARALLEL_AUTOMATION_COUNT } = require("./automations/constants.js");

logger = winston.createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [new winston.transports.File({ filename: "logfile.log" })],
});

async function checkEligibility(func, emiratesId, phoneNumber) {
  app.automationMain.start(emiratesId, phoneNumber);
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 800,
    minHeight: 800,
    minWidth: 400,
    maxHeight: 800,
    maxWidth: 400,
    icon: __dirname + "/assets/images/aster_icon.icon",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools when debugging
  // mainWindow.webContents.openDevTools();

  return mainWindow;
}

app.whenReady().then(() => {
  ipcMain.handle("isEligible", checkEligibility);

  mainWindow = createWindow();
  app.mainWindow = mainWindow;

  const automationMain = new AutomationMain(
    PARALLEL_AUTOMATION_COUNT,
    logger,
    mainWindow
  );
  app.automationMain = automationMain;

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', (event) => {
  app.automationMain.close()
  for (let instance of app.automationMain.instances) {
    instance.get("https://google.com")
    instance.quit()
    instance.close()
    delete instance
  }
  delete app.automationMain;
})

app.on("window-all-closed", function () {
  // delete app.automationMain
  app.quit();
});

