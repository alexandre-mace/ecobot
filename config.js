const accountId = process.env.ACCOUNT_ID;
const accountName = process.env.ACCOUNT_NAME;
const appMode = process.env.APP_MODE;
const appModeAuto = 'AUTO'
const appModeManual = 'MANUAL'
const testing = process.env.TESTING

export {
    appMode,
    accountId,
    accountName,
    appModeAuto,
    appModeManual,
    testing
}