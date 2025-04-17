
let githubToken = "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";
let githubApiUrl = "https://api.github.com/repos/DeViPlayGamesBPR/RUO-strona/contents/assets/data/dane.xlsx";

async function saveTestToGitHub() {
  const header = [["Indeks", "Imię", "Nazwisko", "Telefon"]];
  const tableData = [["001", "Testowy", "Użytkownik", "123456789"]];
  const data = header.concat(tableData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Słuchacze");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  const base64 = await toBase64(wbout);
  const sha = await fetch(githubApiUrl, {
    headers: {
      Authorization: "token " + githubToken,
      Accept: "application/vnd.github.v3+json"
    }
  }).then(r => r.json()).then(d => d.sha);

  const payload = {
    message: "[Test] Sync dane.xlsx",
    content: base64,
    sha: sha
  };

  fetch(githubApiUrl, {
    method: "PUT",
    headers: {
      Authorization: "token " + githubToken,
      Accept: "application/vnd.github.v3+json"
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => console.log("✅ GitHub response:", data))
  .catch(err => console.error("❌ GitHub error:", err));
}

function toBase64(buffer) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result.split(",")[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(new Blob([buffer]));
  });
}
