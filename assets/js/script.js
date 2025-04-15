
let CLIENT_ID = '438515316731-2g5u0c77so5r3dm2rvv74etn6ss9naad.apps.googleusercontent.com';
let API_KEY = 'AIzaSyDFx3b-J1JBXONjIBP5j81oGvs65wrhBXc';
let DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
let SCOPES = 'https://www.googleapis.com/auth/drive.file';
let tokenClient;
let gapiInited = false;
let gisInited = false;
let fileId = null;

function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  document.getElementById(tab).style.display = "block";
}

function gapiLoaded() {
  gapi.load('client:picker', initializeGapiClient);
}

function initializeGapiClient() {
  gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS,
  }).then(() => {
    gapiInited = true;
    maybeEnableButtons();
  });
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', 
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById("auth-status").textContent = "Możesz się zalogować";
  }
}

function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    document.getElementById("login-section").style.display = "none";
    document.getElementById("picker-section").style.display = "block";
  };
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

function handleSignoutClick() {
  google.accounts.oauth2.revoke(tokenClient.access_token);
  location.reload();
}

function createPicker() {
  const view = new google.picker.View(google.picker.ViewId.DOCS);
  view.setMimeTypes("text/csv");
  const picker = new google.picker.PickerBuilder()
    .enableFeature(google.picker.Feature.NAV_HIDDEN)
    .setOAuthToken(gapi.auth.getToken().access_token)
    .addView(view)
    .setCallback(pickerCallback)
    .build();
  picker.setVisible(true);
}
