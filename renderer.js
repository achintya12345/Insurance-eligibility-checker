/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */


var PARALLEL_AUTOMATION_COUNT = 3

const check_btn = document.getElementById("check_btn");

check_btn.addEventListener("click", check_eligibility_clicked);


function validateUAEPhoneNumber() {
  phoneNumber = document.getElementById("phone-no").value;
  phoneNumber_msg = document.getElementById("phone-no-message");
  phoneNumber_msg.innerText = "";

  if (phoneNumber === undefined || phoneNumber === null || phoneNumber === "") {
    phoneNumber_msg.innerText = "Enter Phone Number";
    return false;
  } else if (phoneNumber.length <= 6 || phoneNumber.length > 13) {
    phoneNumber_msg.innerText = "Enter Valid Phone Number";
    return false;
  }

  // Remove any whitespace from the input
  phoneNumber = phoneNumber.replace(/\s/g, "");

  // Check if the input matches the pattern for UAE phone numbers
  if (!/^\+971\d{9}$/.test(phoneNumber)) {
    phoneNumber_msg.innerText = "Invalid Phone Number";
    return false;
  }

  // Check if the first digit after the country code is 5 or 6
  const secondDigit = parseInt(phoneNumber.charAt(4));
  if (secondDigit !== 5 && secondDigit !== 6) {
    phoneNumber_msg.innerText = "Invalid Phone Number";
    return false;
  }

  // All checks have passed, return true
  return true;
}

function validateNumberString(str) {
  const regex = /^[\d-]+$/;

  // Check if the string matches the pattern
  if (regex.test(str)) {
    return true;
  }

  // If the string does not match the pattern, return false
  return false;
}

function validateEmiratesId() {
  emiratesId = document.getElementById("emirates-id").value;
  // Remove any whitespace from the input
  emiratesId = emiratesId.replace(/\s/g, "");
  emiratesId_msg = document.getElementById("emirates-id-message");

  if (emiratesId === undefined || emiratesId === null || emiratesId === "") {
    emiratesId_msg.innerText = "Enter EmiratesID";
    return false;
  } else if (validateNumberString(emiratesId) == false) {
    emiratesId_msg.innerText =
      "Enter Valid EmiratesID. Only numbers and - allowed.";
    return false;
  } else if (emiratesId.length < 15 || emiratesId.length > 18) {
    emiratesId_msg.innerText = "Enter Valid EmiratesID.";
    return false;
  } else {
    emiratesId_msg.innerText = "";
  }

  return true;
}

function toggle_enable(inputBoxId) {
  var elem = document.getElementById(inputBoxId);
  elem.disabled = !elem.disabled;
}

function toggle_display(id) {
  var element = document.getElementById(id);
  if (element.style.display === "none") {
    element.style.display = "";
  } else {
    element.style.display = "none";
  }
}

function show_display(id) {
  var element = document.getElementById(id);
  element.style.display = "";
}

function clearSubElements(elementId) {
  var element = document.getElementById(elementId);
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
  }
}

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


async function check_eligibility_clicked() {
  if (validateEmiratesId() != true && validateUAEPhoneNumber() != true) {
    return;
  }
  // reset the UI state to start of execution
  
  toggle_enable("emirates-id");
  toggle_enable("phone-no");
  toggle_enable("check_btn");
  toggle_display("loadingsign")

  show_display("result_section");
  clearSubElements("results-tbody")

  emiratesId = document.getElementById("emirates-id").value;
  emiratesId = emiratesId.replace(/\s/g, "");
  phoneNumber = document.getElementById("phone-no").value;

  await window.electronAPI.isEligible(emiratesId, phoneNumber);
  return;
}

// check_btn.addEventListener("click", async () => {
//   // validate the inputs
// });
