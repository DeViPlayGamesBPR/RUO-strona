
let tableData = [];
function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
  document.getElementById(tabId).style.display = "block";
  if (tabId === "home") updateStats();
}
function updateStats() {
  document.getElementById("liczba").textContent = tableData.length;
  document.getElementById("ostatni").textContent = tableData.length > 0 ? tableData[tableData.length - 1][0] : "-";
  document.getElementById("indeks").value = generateNextIndex();
}
function generateNextIndex() {
  if (tableData.length === 0) return "001";
  const last = parseInt(tableData[tableData.length - 1][0]);
  return String(last + 1).padStart(3, '0');
}
function dodajSluchacza() {
  const indeks = document.getElementById("indeks").value;
  const imie = document.getElementById("imie").value;
  const nazwisko = document.getElementById("nazwisko").value;
  const telefon = document.getElementById("telefon").value;
  tableData.push([indeks, imie, nazwisko, telefon]);
  renderTable();
  document.getElementById("formDodaj").reset();
  updateStats();
}
function renderTable() {
  const tbody = document.getElementById("tabelaSluchaczy");
  tbody.innerHTML = "";
  tableData.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td></td>`;
    tbody.appendChild(tr);
  });
}
function searchTable() {
  const val = document.getElementById("search").value.toLowerCase();
  document.querySelectorAll("#tabelaSluchaczy tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
  });
}
window.onload = () => {
  showTab("home");
};
