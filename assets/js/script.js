
let password = "RUORadzymin25";
let tableData = [];
let wycieczki = [];
let spotkania = [];

function checkLogin() {
  document.getElementById("login").style.display = "block";
  document.getElementById("app").style.display = "none";
}

function login() {
  const pass = document.getElementById("password").value;
  if (pass === password) {
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadData();
  } else {
    alert("Błędne hasło!");
  }
}

function showTab(id) {
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
  document.getElementById(id).style.display = "block";
  if (id === "home") updateHomeStats();
}

function updateHomeStats() {
  document.getElementById("liczba").innerText = tableData.length;
  const last = tableData.length > 0 ? tableData[tableData.length - 1][0] : "Brak";
  document.getElementById("ostatni").innerText = last;
  document.getElementById("indeks").value = generateNextIndex();
}

function generateNextIndex() {
  if (tableData.length === 0) return "001";
  let last = tableData[tableData.length - 1][0];
  let next = String(parseInt(last) + 1).padStart(3, '0');
  return next;
}

function loadData() {
  fetch("assets/data/dane.xlsx")
    .then(res => res.arrayBuffer())
    .then(ab => {
      const wb = XLSX.read(ab, { type: "array" });
      const sluchacze = XLSX.utils.sheet_to_json(wb.Sheets["Słuchacze"], { header: 1 }).slice(1);
      const wyc = XLSX.utils.sheet_to_json(wb.Sheets["Wycieczki"], { header: 1 }).slice(1);
      const spotk = XLSX.utils.sheet_to_json(wb.Sheets["Spotkania"], { header: 1 }).slice(1);
      tableData = sluchacze;
      wycieczki = wyc;
      spotkania = spotk;
      renderSluchacze();
      renderWycieczki();
      renderSpotkania();
      updateHomeStats();
    });
}

function renderSluchacze() {
  const tbody = document.getElementById("tabelaSluchaczy");
  tbody.innerHTML = "";
  tableData.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td>${row[3]}</td>
      <td>
        <button onclick="editRow(${i})">✏️</button>
        <button onclick="removeRow(${i})">❌</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function editRow(i) {
  const row = tableData[i];
  const imie = prompt("Imię:", row[1]);
  const nazw = prompt("Nazwisko:", row[2]);
  const tel = prompt("Telefon:", row[3]);
  if (imie && nazw && tel) {
    tableData[i] = [row[0], imie, nazw, tel];
    renderSluchacze();
  }
}

function removeRow(i) {
  if (confirm("Na pewno usunąć słuchacza?")) {
    tableData.splice(i, 1);
    renderSluchacze();
  }
}

function dodajSluchacza() {
  const indeks = document.getElementById("indeks").value;
  const imie = document.getElementById("imie").value;
  const nazwisko = document.getElementById("nazwisko").value;
  const telefon = document.getElementById("telefon").value;
  if (indeks && imie && nazwisko && telefon) {
    tableData.push([indeks, imie, nazwisko, telefon]);
    renderSluchacze();
    document.getElementById("formDodaj").reset();
    updateHomeStats();
  } else {
    alert("Uzupełnij wszystkie pola!");
  }
}

function searchTable() {
  const val = document.getElementById("search").value.toLowerCase();
  const rows = document.querySelectorAll("#tabelaSluchaczy tr");
  rows.forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
  });
}

function dodajWycieczke() {
  const miejsce = document.getElementById("miejsce").value;
  const data = document.getElementById("dataWycieczki").value;
  if (miejsce && data) {
    const id = "W" + (wycieczki.length + 1).toString().padStart(2, '0');
    wycieczki.push([id, miejsce, data]);
    renderWycieczki();
    document.getElementById("formWycieczki").reset();
  }
}

function renderWycieczki() {
  const div = document.getElementById("listaWycieczek");
  div.innerHTML = "";
  wycieczki.forEach(w => {
    div.innerHTML += `<p><b>${w[1]}</b> (${w[2]})</p>`;
  });
}

function dodajSpotkanie() {
  const data = document.getElementById("dataSpotkania").value;
  const tytul = document.getElementById("tytul").value;
  const opis = document.getElementById("opis").value;
  if (data && tytul && opis) {
    spotkania.push([data, tytul, opis]);
    renderSpotkania();
    document.getElementById("formSpotkania").reset();
  }
}

function renderSpotkania() {
  const div = document.getElementById("listaSpotkan");
  div.innerHTML = "";
  spotkania.forEach(s => {
    div.innerHTML += `<p><b>${s[0]} - ${s[1]}</b><br>${s[2]}</p>`;
  });
}

window.onbeforeunload = function () {
  if (!tableData.length) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Indeks", "Imię", "Nazwisko", "Telefon"]].concat(tableData)), "Słuchacze");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["ID", "Miejsce", "Data"]].concat(wycieczki)), "Wycieczki");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Data", "Tytuł", "Opis"]].concat(spotkania)), "Spotkania");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dane_zmienione.xlsx";
  a.click();
};
