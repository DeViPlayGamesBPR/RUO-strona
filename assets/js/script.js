let correctPassword = "RUORadzymin25";
let apiUrl = "https://api.github.com/repos/DeViPlayGamesBPR/RUO-strona/contents/assets/data/dane.xlsx";
let token = "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";
let tableData = [];

function showLogin() {
  document.getElementById("login").style.display = "block";
  document.getElementById("app").style.display = "none";
}

function showApp() {
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";
  fetchXlsx();
}

function checkPassword() {
  const input = document.getElementById("password").value;
  if (input === correctPassword) {
    showApp();
  } else {
    alert("Nieprawidłowe hasło");
  }
}

async function fetchXlsx() {
  const response = await fetch("assets/data/dane.xlsx");
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  tableData = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1);
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("tableListeners");
  tbody.innerHTML = "";
  tableData.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td contenteditable="true">${row[0] || ""}</td>
      <td contenteditable="true">${row[1] || ""}</td>
      <td contenteditable="true">${row[2] || ""}</td>
      <td contenteditable="true">${row[3] || ""}</td>
      <td><button onclick="removeRow(${index})">🗑</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function addRow() {
  tableData.push(["", "", "", ""]);
  renderTable();
}

function removeRow(index) {
  tableData.splice(index, 1);
  renderTable();
}

async function saveTable() {
  const rows = Array.from(document.querySelectorAll("#tableListeners tr")).map(row =>
    Array.from(row.querySelectorAll("td")).slice(0, 4).map(td => td.textContent.trim())
  );
  const header = [["Indeks", "Imię", "Nazwisko", "Telefon"]];
  const ws = XLSX.utils.aoa_to_sheet(header.concat(rows));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Słuchacze");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  const base64 = arrayBufferToBase64(wbout);

  const shaResp = await fetch(apiUrl, {
    headers: {
      Authorization: "token " + token,
      Accept: "application/vnd.github.v3+json"
    }
  });
  const shaData = await shaResp.json();
  const sha = shaData.sha;

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: "token " + token,
      Accept: "application/vnd.github.v3+json"
    },
    body: JSON.stringify({
      message: "Aktualizacja danych słuchaczy",
      content: base64,
      sha: sha
    })
  });

  if (response.ok) {
    alert("Plik został zapisany w repozytorium!");
  } else {
    alert("Błąd zapisu: " + response.statusText);
  }
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
