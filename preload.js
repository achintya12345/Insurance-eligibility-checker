/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { contextBridge, ipcRenderer } = require("electron");
PARALLEL_AUTOMATION_COUNT = 3;
var counter = 0;

function toggle_enable(inputBoxId) {
  var elem = document.getElementById(inputBoxId);
  elem.disabled = !elem.disabled;
}

function toggle_display(id) {
  var element = document.getElementById(id);
  if (element.style.display === "none") {
    console.log("now show")
    element.style.display = "";
  } else {
    console.log("now none")
    element.style.display = "none";
  }
}

function increment_counter() {
  // get counter and add 1 
  // if counter == total_provider hide the span for loading and below three
  // get counter and set it to 0
  counter += 1;
  if (counter == PARALLEL_AUTOMATION_COUNT)  {
    toggle_enable("emirates-id");
    toggle_enable("phone-no");
    toggle_enable("check_btn");
    toggle_display("loadingsign")
    counter = 0;
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  isEligible: (emiratesId, phoneNumber) =>
    ipcRenderer.invoke("isEligible", emiratesId, phoneNumber),
});

function addTableRow(provider, status, view) {
  // get the tbody element with ID "results-tbody"
  const tbody = document.getElementById("results-tbody");

  // create a new row element
  const row = document.createElement("tr");

  // create three new cell elements and set their text content to the arguments
  const providerCell = document.createElement("td");
  providerCell.textContent = provider;
  const statusCell = document.createElement("td");
  statusCell.textContent = status;
  const viewCell = document.createElement("td");
  viewCell.textContent = view;

  // add the three cells to the new row
  row.appendChild(providerCell);
  row.appendChild(statusCell);
  row.appendChild(viewCell);

  // add the new row to the tbody
  tbody.appendChild(row);
}

window.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.on("eligibility-check-result", (_event, value) => {
    addTableRow(value["provider"], value["is_eligible"], value["screenshot"]);
    increment_counter();
  });
});

