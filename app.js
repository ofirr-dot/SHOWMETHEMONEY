const API_URL =
  "https://script.google.com/macros/s/AKfycbwkdPCUeSG9wZcCA7SczlRHwi2MXkqAoZCNlbgtbYoO43Vuk50ZK_G8RtVb-KsxvoDXKg/exec?mode=api";

function format(n) {
  return Number(n || 0).toLocaleString("he-IL", {
    maximumFractionDigits: 2,
  });
}

function setTimestamp() {
  const now = new Date();
  const d = now.toLocaleDateString("he-IL");
  const t = now.toLocaleTimeString("he-IL", { hour12: false });
  document.getElementById("timestamp").innerText = `${t} · ${d}`;
}

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const contents = {
    summary: document.getElementById("tab-summary"),
    ibkr: document.getElementById("tab-ibkr"),
    fair: document.getElementById("tab-fair"),
    leumi: document.getElementById("tab-leumi"),
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      Object.values(contents).forEach((c) => c.classList.remove("active"));
      const tab = btn.getAttribute("data-tab");
      contents[tab].classList.add("active");
    });
  });
}

async function loadData() {
  setTimestamp();
  setupTabs();
  const statusEl = document.getElementById("status");

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    statusEl.style.display = "none";

    let ibkrValue = 0;
    let unrealized = 0;
    let realized = 0;

    data.openPositions.forEach((p) => {
      const unrealBase = (p.unrealizedPL || 0) * (p.fxRateToBase || 1);
      const realizedBase =
        (data.realizedBySymbol[p.symbol] || 0) * (p.fxRateToBase || 1);

      unrealized += unrealBase;
      realized += realizedBase;
      ibkrValue += (p.positionValue || 0) * (p.fxRateToBase || 1);
    });

    data.cash.forEach((c) => {
      ibkrValue += (c.endingCash || 0) * (c.fxRateToBase || 1);
    });

    const totalPL = unrealized + realized;
    const costApprox = ibkrValue - totalPL;

    const fairValue = 0;
    const leumiValue = 0;
    const totalPortfolio = ibkrValue;

    const ibkrPct = 100;

    document.getElementById("ibkrValue").innerText = "₪" + format(ibkrValue);
    document.getElementById("ibkrPercent").innerText = ibkrPct.toFixed(1) + "%";

    document.getElementById("fairValue").innerText = "₪0";
    document.getElementById("fairPercent").innerText = "0%";

    document.getElementById("leumiValue").innerText = "₪0";
    document.getElementById("leumiPercent").innerText = "0%";

    document.getElementById("totalValue").innerText =
      "₪" + format(totalPortfolio);

    const pctChange = costApprox ? (totalPL / costApprox) * 100 : 0;

    document.getElementById("totalChangePct").innerText =
      (pctChange >= 0 ? "+" : "") + pctChange.toFixed(2) + "%";

    document.getElementById("totalChangeAbs").innerText =
      (totalPL >= 0 ? "+" : "") + format(totalPL) + "₪";

    document.getElementById("sumTotal").innerText =
      "₪" + format(totalPortfolio);
    document.getElementById("sumUnrealized").innerText =
      "₪" + format(unrealized);
    document.getElementById("sumRealized").innerText =
      "₪" + format(realized);
    document.getElementById("sumPL").innerText = "₪" + format(totalPL);

    const tbody = document.getElementById("ibkrTableBody");
    tbody.innerHTML = "";

    data.openPositions.forEach((p) => {
      const unrealBase = (p.unrealizedPL || 0) * (p.fxRateToBase || 1);
      const realizedBase =
        (data.realizedBySymbol[p.symbol] || 0) * (p.fxRateToBase || 1);
      const totalBase = unrealBase + realizedBase;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.symbol}</td>
        <td>${p.description}</td>
        <td>${p.currency}</td>
        <td>${format(p.quantity)}</td>
        <td>${format(p.costBasisPrice)}</td>
        <td>${p.openDateTime || ""}</td>
        <td>${format(p.fxRateToBase)}</td>
        <td>${format(p.markPrice)}</td>
        <td>${format((p.positionValue || 0) * (p.fxRateToBase || 1))}</td>
        <td>${format(unrealBase)}</td>
        <td>${format(realizedBase)}</td>
        <td>${format(totalBase)}</td>
      `;
      tbody.appendChild(row);
    });

    const allocCtx = document
      .getElementById("allocationChart")
      .getContext("2d");

    new Chart(allocCtx, {
      type: "doughnut",
      data: {
        labels: ["IBKR"],
        datasets: [
          {
            data: [ibkrValue],
            backgroundColor: ["#3b82f6"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#e5e7eb" },
          },
        },
      },
    });

    const barCtx = document.getElementById("barChart").getContext("2d");

    new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["תיק כולל"],
        datasets: [
          {
            label: "עלות כוללת תיק (הערכה)",
            data: [costApprox],
            backgroundColor: "#3b82f6",
          },
          {
            label: "שווי תיק נוכחי",
            data: [totalPortfolio],
            backgroundColor: "#22c55e",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#e5e7eb" },
          },
        },
        scales: {
          x: {
            ticks: { color: "#e5e7eb" },
            grid: { color: "#1f2937" },
          },
          y: {
            ticks: { color: "#e5e7eb" },
            grid: { color: "#1f2937" },
          },
        },
      },
    });
  } catch (err) {
    statusEl.classList.add("error");
    statusEl.innerText = "שגיאה בטעינת הנתונים: " + err;
  }
}

loadData();
