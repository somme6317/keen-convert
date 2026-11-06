// Mobile Menu Toggle Script
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

let currencies = {};
let exchangeRates = {};
let fxChartInstance = null;

const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const fromAmountInput = document.getElementById('from-amount');
const toAmountInput = document.getElementById('to-amount');
const fromSymbol = document.getElementById('from-symbol');
const toSymbol = document.getElementById('to-symbol');
const rateDisplay = document.getElementById('rate-display');
const updateTimeDisplay = document.getElementById('update-time');
const swapBtn = document.getElementById('swap-btn');
const convertActionBtn = document.getElementById('convert-action-btn');
const matrixGrid = document.getElementById('matrix-grid');
const matrixBaseLabel = document.getElementById('matrix-base-label');
const liveStatusPill = document.getElementById('live-status-pill');
const chartSubtitle = document.getElementById('chart-subtitle');

async function initTerminal() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const apiData = await response.json();
        if (apiData && apiData.rates) {
            exchangeRates = apiData.rates;
        }
    } catch (error) {
        console.warn("API fetch failed, loading local rates.json dataset...", error);
        try {
            const localRes = await fetch('rates.json');
            const localData = await localRes.json();
            for (let code in localData.currencies) {
                exchangeRates[code] = localData.currencies[code].rate;
            }
            if (liveStatusPill) {
                liveStatusPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span><span>Offline Mode (JSON)</span>';
            }
        } catch (e) {
            console.error("Failed to load local rates.json", e);
        }
    }

    currencies = {
        USD: { name: "United States Dollar", symbol: "$" },
        EUR: { name: "Euro", symbol: "€" },
        GBP: { name: "British Pound", symbol: "£" },
        NGN: { name: "Nigerian Naira", symbol: "₦" },
        GHS: { name: "Ghanaian Cedi", symbol: "GH₵" },
        KES: { name: "Kenyan Shilling", symbol: "KSh" },
        ZAR: { name: "South African Rand", symbol: "R" },
        OMR: { name: "Omani Rial", symbol: "OMR" },
        JPY: { name: "Japanese Yen", symbol: "¥" },
        CAD: { name: "Canadian Dollar", symbol: "CA$" },
        AUD: { name: "Australian Dollar", symbol: "AU$" },
        INR: { name: "Indian Rupee", symbol: "₹" },
        CNY: { name: "Chinese Yuan", symbol: "¥" },
        CHF: { name: "Swiss Franc", symbol: "CHF" },
        BTC: { name: "Bitcoin", symbol: "₿" }
    };

    populateDropdowns();
    loadLocalStorageState();
    updateSymbolsOnly();
    convertCurrency();
    initChart();
}

function populateDropdowns() {
    if (!fromCurrencySelect || !toCurrencySelect) return;
    let options = '';
    for (const [code, data] of Object.entries(currencies)) {
        options += `<option value="${code}">${code} — ${data.name}</option>`;
    }
    fromCurrencySelect.innerHTML = options;
    toCurrencySelect.innerHTML = options;
}

// Load previous user state from LocalStorage
function loadLocalStorageState() {
    const savedFrom = localStorage.getItem('keen_convert_from');
    const savedTo = localStorage.getItem('keen_convert_to');
    const savedAmount = localStorage.getItem('keen_convert_amount');

    if (savedFrom && fromCurrencySelect) fromCurrencySelect.value = savedFrom;
    if (savedTo && toCurrencySelect) toCurrencySelect.value = savedTo;
    if (savedAmount && fromAmountInput) fromAmountInput.value = savedAmount;
}

function updateSymbolsOnly() {
    if (!fromCurrencySelect || !toCurrencySelect) return;
    const fromCurr = fromCurrencySelect.value;
    const toCurr = toCurrencySelect.value;
    if (fromSymbol) fromSymbol.textContent = currencies[fromCurr] ? currencies[fromCurr].symbol : '$';
    if (toSymbol) toSymbol.textContent = currencies[toCurr] ? currencies[toCurr].symbol : '€';
}

function convertCurrency() {
    const amount = parseFloat(fromAmountInput.value) || 0;
    const fromCurr = fromCurrencySelect.value;
    const toCurr = toCurrencySelect.value;

    updateSymbolsOnly();

    const rateInUSD = exchangeRates[fromCurr] || 1;
    const rateOutUSD = exchangeRates[toCurr] || 1;
    const conversionRate = rateOutUSD / rateInUSD;

    const convertedAmount = amount * conversionRate;
    if (toAmountInput) {
        toAmountInput.value = convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }

    if (rateDisplay) {
        rateDisplay.textContent = `1 ${fromCurr} = ${conversionRate.toFixed(4)} ${toCurr}`;
    }
    if (updateTimeDisplay) {
        updateTimeDisplay.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Save state to LocalStorage
    localStorage.setItem('keen_convert_from', fromCurr);
    localStorage.setItem('keen_convert_to', toCurr);
    localStorage.setItem('keen_convert_amount', amount);

    updateMatrix(fromCurr);
}

function updateMatrix(baseCurr) {
    if (!matrixBaseLabel || !matrixGrid) return;
    matrixBaseLabel.textContent = baseCurr;
    let html = '';
    const popularTargets = ['EUR', 'GBP', 'NGN', 'GHS', 'JPY', 'CAD'];

    popularTargets.forEach(target => {
        if (target !== baseCurr) {
            const baseRate = exchangeRates[baseCurr] || 1;
            const targetRate = exchangeRates[target] || 1;
            const rate = targetRate / baseRate;

            html += `
                <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-800 flex items-center justify-between font-mono hover:border-yellow-500/40 transition-all">
                    <div>
                        <span class="block text-xs font-bold text-white">${baseCurr}/${target}</span>
                        <span class="text-[10px] text-gray-500">${currencies[target] ? currencies[target].name.substring(0, 12) : target}...</span>
                    </div>
                    <span class="text-xs font-semibold text-yellow-400">${rate > 1 ? rate.toFixed(2) : rate.toFixed(4)}</span>
                </div>
            `;
        }
    });
    matrixGrid.innerHTML = html;
}

if (swapBtn) {
    swapBtn.addEventListener('click', () => {
        const temp = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = temp;
        convertCurrency();
        showToast("Currencies swapped & computed!", "success");
    });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `glass-panel px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-medium text-white border-l-4 ${type === 'success' ? 'border-l-yellow-400' : 'border-l-emerald-400'} animate-fade-in pointer-events-auto`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-yellow-400 text-sm"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

if (fromCurrencySelect) fromCurrencySelect.addEventListener('change', updateSymbolsOnly);
if (toCurrencySelect) toCurrencySelect.addEventListener('change', updateSymbolsOnly);

if (convertActionBtn) {
    convertActionBtn.addEventListener('click', () => {
        convertCurrency();
        showToast(`Calculated: ${fromAmountInput.value} ${fromCurrencySelect.value} to ${toCurrencySelect.value}`, 'success');
    });
}

function initChart() {
    const canvas = document.getElementById('fxChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(30, 132, 73, 0.22)');
    gradient.addColorStop(1, 'rgba(30, 132, 73, 0.0)');

    fxChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Exchange Rate Trend',
                data: [0.918, 0.921, 0.920, 0.925, 0.922, 0.924, 0.9245],
                borderColor: '#1E8449',
                borderWidth: 2.5,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#F1C40F'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#55705B', font: { family: 'JetBrains Mono', size: 10 } } },
                y: { grid: { color: 'rgba(20, 90, 50, 0.10)' }, ticks: { color: '#55705B', font: { family: 'JetBrains Mono', size: 10 } } }
            }
        }
    });
}

window.updateChartTimeframe = function(tf) {
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.classList.remove('bg-yellow-500', 'text-gray-950', 'shadow-md');
        btn.classList.add('text-gray-400');
    });
    event.target.classList.add('bg-yellow-500', 'text-gray-950', 'shadow-md');
    event.target.classList.remove('text-gray-400');

    if (chartSubtitle) {
        chartSubtitle.textContent = `Historical spread for USD/EUR (${tf})`;
    }

    let newData = [];
    let labels = [];
    if (tf === '1W') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        newData = [0.918, 0.921, 0.920, 0.925, 0.922, 0.924, 0.9245];
    } else if (tf === '1M') {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        newData = [0.910, 0.915, 0.922, 0.9245];
    } else {
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        newData = [0.895, 0.905, 0.915, 0.9245];
    }

    if (fxChartInstance) {
        fxChartInstance.data.labels = labels;
        fxChartInstance.data.datasets[0].data = newData;
        fxChartInstance.update();
    }
};

window.addEventListener('DOMContentLoaded', initTerminal);