
let CLIENT_ID = '438515316731-2g5u0c77so5r3dm2rvv74etn6ss9naad.apps.googleusercontent.com';
let API_KEY = 'AIzaSyDFx3b-J1JBXONjIBP5j81oGvs65wrhBXc';
let DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
let SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let fileId = null;
let originalData = [];

function initAll() {
  gapi.load('client:picker', () => {
    gapiLoaded();
    gisLoaded();
  });
}

function gapiLoaded() {
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
  if (!tokenClient) {
    alert("Jeszcze się nie załadował klient Google. Spróbuj za chwilę.");
    return;
  }

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
  const view = new google.picker.DocsView()
    .setIncludeFolders(true)
    .setMimeTypes("text/csv")
    .setSelectFolderEnabled(false);

  const picker = new google.picker.PickerBuilder()
    .enableFeature(google.picker.Feature.NAV_HIDDEN)
    .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
    .setOAuthToken(gapi.auth.getToken().access_token)
    .addView(view)
    .setCallback(pickerCallback)
    .build();
  picker.setVisible(true);
}

function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    fileId = data.docs[0].id;
    fetchCsvFromDrive(fileId);
  }
}

function fetchCsvFromDrive(fileId) {
  gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media'
  }).then(response => {
    parseCsv(response.body);
  }).catch(err => {
    console.error("Błąd pobierania pliku:", err);
    alert("Nie udało się pobrać pliku. Upewnij się, że masz dostęp i spróbuj ponownie.");
  });
}

function parseCsv(data) {
  const rows = data.trim().split("\n").map(r => r.split(","));
  originalData = rows;
  const tbody = document.querySelector("#tableListeners tbody");
  tbody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById("app-section").style.display = "block";
  document.getElementById("picker-section").style.display = "none";
  document.getElementById("count-listeners").textContent = rows.length;
}

function exportTableToCsv() {
  const rows = Array.from(document.querySelectorAll("#tableListeners tbody tr"));
  return rows.map(row => {
    const cols = Array.from(row.querySelectorAll("td")).map(td => td.textContent);
    return cols.join(",");
  }).join("\n");
}

window.onbeforeunload = function () {
  const confirmLeave = confirm("Czy chcesz zapisać zmiany?");
  if (confirmLeave && fileId) {
    const csvContent = exportTableToCsv();
    const blob = new Blob([csvContent], { type: 'text/csv' });

    const reader = new FileReader();
    reader.onload = function () {
      const token = gapi.auth.getToken().access_token;
      fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'text/csv'
        },
        body: reader.result
      }).then(response => {
        if (!response.ok) {
          console.error("Błąd zapisu:", response.statusText);
        }
      });
    };
    reader.readAsText(blob);
  }
};

window.onload = () => {
  initAll();
};
