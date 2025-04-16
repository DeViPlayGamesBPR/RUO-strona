
let tableData = [];
let editIndex = -1;

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
  document.getElementById(tabId).style.display = "block";
  if (tabId === "home") updateStats();
}

function updateStats() {
  document.getElementById("liczba").textContent = tableData.length;
  document.getElementById("ostatni").textContent = tableData.length > 0 ? tableData[tableData.length - 1][0] : "Brak";
  document.getElementById("indeks").value = generateNextIndex();
}

function generateNextIndex() {
  if (tableData.length === 0) return "001";
  let last = parseInt(tableData[tableData.length - 1][0]);
  return String(last + 1).padStart(3, '0');
}

function loadData() {
  fetch("assets/data/dane.xlsx")
    .then(res => res.arrayBuffer())
    .then(ab => {
      const wb = XLSX.read(ab, { type: "array" });
      const ws = wb.Sheets["Słuchacze"];
      tableData = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);
      renderTable();
      updateStats();
    });
}

function renderTable() {
  const tbody = document.getElementById("tabelaSluchaczy");
  tbody.innerHTML = "";
  tableData.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td>
      <td><button onclick="openModal(${index})">✏️</button><button onclick="deleteRow(${index})">🗑</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function openModal(index) {
  editIndex = index;
  const row = tableData[index];
  document.getElementById("editIndeks").value = row[0];
  document.getElementById("editImie").value = row[1];
  document.getElementById("editNazwisko").value = row[2];
  document.getElementById("editTelefon").value = row[3];
  document.getElementById("editModal").style.display = "flex";
}

function zamknijModal() {
  document.getElementById("editModal").style.display = "none";
}

function zapiszEdycje() {
  const indeks = document.getElementById("editIndeks").value;
  const imie = document.getElementById("editImie").value;
  const nazw = document.getElementById("editNazwisko").value;
  const tel = document.getElementById("editTelefon").value;
  tableData[editIndex] = [indeks, imie, nazw, tel];
  zamknijModal();
  renderTable();
  updateStats();
  saveToXLSX("Edytowano słuchacza: " + imie + " " + nazw);
}

function deleteRow(index) {
  if (confirm("Czy na pewno usunąć słuchacza?")) {
    const nazw = tableData[index][2];
    tableData.splice(index, 1);
    renderTable();
    updateStats();
    saveToXLSX("Usunięto słuchacza: " + nazw);
  }
}

function dodajSluchacza() {
  const indeks = document.getElementById("indeks").value;
  const imie = document.getElementById("imie").value;
  const nazwisko = document.getElementById("nazwisko").value;
  const telefon = document.getElementById("telefon").value;
  if (indeks && imie && nazwisko && telefon) {
    tableData.push([indeks, imie, nazwisko, telefon]);
    renderTable();
    document.getElementById("formDodaj").reset();
    updateStats();
    saveToXLSX("Dodano słuchacza: " + imie + " " + nazwisko);
  }
}

function searchTable() {
  const val = document.getElementById("search").value.toLowerCase();
  document.querySelectorAll("#tabelaSluchaczy tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
  });
}

function saveToXLSX(logMessage) {
  const header = [["Indeks", "Imię", "Nazwisko", "Telefon"]];
  const data = header.concat(tableData);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Słuchacze");

  // Arkusz Logi
  const now = new Date().toLocaleString();
  const logSheet = XLSX.utils.aoa_to_sheet([["Czas", "Typ operacji", "Opis"], [now, "Akcja", logMessage]]);
  XLSX.utils.book_append_sheet(wb, logSheet, "Logi");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });

  // automatyczne pobieranie
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dane.xlsx";
  a.click();
}

window.onload = () => {
  loadData();
  showTab("home");
};
