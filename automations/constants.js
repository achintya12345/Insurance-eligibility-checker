const DAMAN_URL = "https://www.damanhealth.ae/en";
const LOGIN_DOM_CHANGED = ' login page - DOM has changed.';
const ELIGIBILITY_PAGE_DOM_CHANGED = ' eligibility page - DOM has changed.';
const EMIRATES_ID_SECTION_ERROR = ' emirates ID section - DOM has changed.';
const EXTRACTING_ELIGIBILITY_ERROR = 'extracting eligibility program - DOM has changed or screenshot program error.';
const EXECUTION_ERROR = ' overall execution - chrome browser build() not working or execution failed.';
const LOGIN_UNKNOWN_ERR = ' login - Unknown error.';
const LOG_OUT_ERROR = 'logout - error';

const PULSE_URL = "https://pulse-uae.tatsh.com/Login2.aspx?token=AQ==";
const PULSE_ELIGIBILITY_URL = "https://pulse-uae.tatsh.com/EligibilityChecking2.aspx";
const ELIGIBILITY_TAB_DOM_CHANGED = ' eligibility tab3 - DOM has changed.';

const SUKOON_URL = "https://par.sukoon.com/eAuth/PR.aspx";
const REQUEST_CONFIRM = ' confirmation request - DOM has changed';
const FIRST_LINK_ERROR = ' Selecting the first link in the table has error';

const ALMADALLAH_URL = "https://www.almadallah.ae/provider/MemberInfo.aspx";
const ALMADALLAH_ELIGIBILITY_URL = "https://www.almadallah.ae/provider/MemberInfo.aspx";

const ECLAIM_URL = "https://www.eclaimlink.ae/Default.aspx";
const ECLAIM_ELIGIBILITY_PAGE_URL = "https://www.eclaimlink.ae/misc/SearchMember.aspx";
const POP_UP_DOM_CHANGED = ' popup page - DOM has changed';
const NAVIGATE_TO_ELIGIBILITY_ERROR = ' navigation to eligibility page has error';

const PARALLEL_AUTOMATION_COUNT = 3
const WAIT_TIME = 100000

/* 
ALL PASSWORD WILL BE REMOVED AS ONE COMMON 
FOR ALL PORTALS WILL BE PROVIDED 
*/

const ECLAIM_USERNAME = "ASTER SHAAB"
const ECLAIM_PASSWORD = "asterdmh"

const ALMADA_USERNAME = "aweer"
const ALMADA_PASSWORD = "aweer123"

const DAMAN_USERNAME = "ASTERAWEER"
const DAMAN_PASSWORD = "Aster@123"

const SUKOON_PASSWORD = "Aster@123"
const SUKOON_USERNAME = "dubailandaster"
const SUKOON_LICENSE = "DHA-F-7867194"

const PULSE_USERNAME = "insurance_dmmckd"
const PULSE_PASSWORD = "Aster@2024"

module.exports = {DAMAN_URL, 
    LOGIN_DOM_CHANGED,
    ELIGIBILITY_PAGE_DOM_CHANGED,
    EMIRATES_ID_SECTION_ERROR,
    EXTRACTING_ELIGIBILITY_ERROR,
    EXECUTION_ERROR,
    LOGIN_UNKNOWN_ERR,
    PULSE_URL,
    PULSE_ELIGIBILITY_URL,
    ELIGIBILITY_TAB_DOM_CHANGED,
    SUKOON_URL,
    REQUEST_CONFIRM,
    FIRST_LINK_ERROR,
    ALMADALLAH_URL,
    ALMADALLAH_ELIGIBILITY_URL,
    ECLAIM_URL,
    ECLAIM_ELIGIBILITY_PAGE_URL,
    POP_UP_DOM_CHANGED,
    NAVIGATE_TO_ELIGIBILITY_ERROR,
    LOG_OUT_ERROR,
    PARALLEL_AUTOMATION_COUNT,
    ECLAIM_USERNAME,
    ECLAIM_PASSWORD,
    ALMADA_USERNAME,
    ALMADA_PASSWORD,
    DAMAN_USERNAME,
    DAMAN_PASSWORD,
    SUKOON_PASSWORD,
    SUKOON_USERNAME,
    SUKOON_LICENSE,
    WAIT_TIME
};