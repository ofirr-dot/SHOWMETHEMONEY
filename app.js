const API_URL =
  "https://script.google.com/macros/s/AKfycbwkdPCUeSG9wZcCA7SczlRHwi2MXkqAoZCNlbgtbYoO43Vuk50ZK_G8RtVb-KsxvoDXKg/exec?mode=api";

function format(n) {
  return Number(n || 0).toLocaleString("he-IL", {
    maximumFractionDigits: 2,
  });
}

async function loadData() {
  const res = await fetch(API_URL);
  const data = await res.json();

  // --- נתונים מה‑API ---
  const usdRate     = data.usdRate || 0;
  const ibkrSummary = data.ibkr.summary || {};
  const ibkrPos     = data.ibkr.positions || [];
  const fair        = data.fair || [];
  const banks       = data.banks || [];
  const kids        = data.kids || [];
  const hishtalmut  = data.hishtalmut || {};

  // --- IBKR ---
  const ibkrValue  = Number(ibkrSummary.totalValueIls || 0);
  const ibkrProfit = Number(ibkrSummary.totalProfitIls || 0);

  // --- FAIR ---
  const fairValue = fair.reduce(
    (s, r) => s + Number(r["שווי נוכחי (₪)"] || 0),
    0
  );
  const fairProfit = fair.reduce(
    (s, r) => s + Number(r["רווח/הפסד (₪)"] || 0),
    0
  );

  // --- בנקים ---
  const banksValue = banks.reduce(
    (s, r) => s + Number(r["ערך בש״ח"] || 0),
    0
  );

  // --- חיסכון לכל ילד ---
  const kidsValue = kids.reduce(
    (s, r) => s + Number(r["שווי נוכחי (₪)"] || 0),
    0
  );
  const kidsProfit = kids.reduce(
    (s, r) =>
      s +
      (Number(r["שווי נוכחי (₪)"] || 0) -
        Number(r["הפקדות מצטברות (₪)"] || 0)),
    0
  );

  // --- קרן השתלמות ---
  const hishtValue  = Number(hishtalmut.value || 0);
  const hishtProfit = Number(hishtalmut.profit || 0);

  // --- סיכום כולל ---
  const totalValue =
    ibkrValue + fairValue + banksValue + kidsValue + hishtValue;

  const totalProfit =
    ibkrProfit + fairProfit + kidsProfit + hishtProfit;

  const totalYield =
    totalValue > 0 ? (totalProfit / (totalValue - totalProfit)) * 100 : 0;

  // --- הצגת נתונים ---
  document.getElementById("ibkrValue").innerText =
    "₪" + format(ibkrValue);
  document.getElementById("ibkrPercent").innerText =
    ((ibkrValue / totalValue) * 100).toFixed(1) + "%";

  document.getElementById("fairValue").innerText =
    "₪" + format(fairValue);
  document.getElementById("fairPercent").innerText =
    ((fairValue / totalValue) * 100).toFixed(1) + "%";

  document.getElementById("leumiValue").innerText =
    "₪" + format(banksValue);
  document.getElementById("leumiPercent").innerText =
    ((banksValue / totalValue) * 100).toFixed(1) + "%";

  document.getElementById("totalValue").innerText =
    "₪" + format(totalValue);

  document.getElementById("totalChangePct").innerText =
    (totalYield >= 0 ? "+" : "") + totalYield.toFixed(2) + "%";

  document.getElementById("totalChangeAbs").innerText =
    (totalProfit >= 0 ? "+" : "") + format(totalProfit) + "₪";

  document.getElementById("sumTotal").innerText =
    "₪" + format(totalValue);
  document.getElementById("sumUnrealized").innerText =
    "₪" + format(ibkrProfit);
  document.getElementById("sumRealized").innerText =
    "₪" + format(0);
  document.getElementById("sumPL").innerText =
    "₪" + format(totalProfit);

  // --- טבלת IBKR ---
  const tbody = document.getElementById("ibkrTableBody");
  tbody.innerHTML = "";

  ibkrPos.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.symbol}</td>
      <td>${p.description}</td>
      <td>${p.currency}</td>
      <td>${format(p.quantity)}</td>
      <td>${format(p.costUsd)}</td>
      <td>${p.openDateTime || ""}</td>
      <td>${format(p.fxRateToBase)}</td>
      <td>${format(p.priceUsd)}</td>
      <td>${format(p.valueIls)}</td>
      <td>${format(p.plIls)}</td>
      <td>${format(0)}</td>
      <td>${format(p.plIls)}</td>
    `;
    tbody.appendChild(row);
  });
}

loadData();
