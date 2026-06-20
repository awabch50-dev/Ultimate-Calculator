/* ================================================
   NovCalc — Advanced Calculator Script
   Features: Standard | Scientific | Currency | Unit
   ================================================ */

'use strict';

/* ── DOM READY ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initModeTabs();
  initStandard();
  initScientific();
  initCurrency();
  initUnit();
});

/* ════════════════════════════════════════════════
   1. MODE TABS
═══════════════════════════════════════════════ */
function initModeTabs() {
  const tabs   = document.querySelectorAll('.mode-tab');
  const panels = document.querySelectorAll('.calc-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.mode).classList.add('active');
    });
  });
}

/* ════════════════════════════════════════════════
   2. STANDARD CALCULATOR
═══════════════════════════════════════════════ */
function initStandard() {
  const exprEl    = document.getElementById('std-expr');
  const resultEl  = document.getElementById('std-result');
  const hintEl    = document.getElementById('std-hint');
  const historyEl = document.getElementById('std-history');

  let current  = '0';
  let expr     = '';
  let operator = null;
  let prevVal  = null;
  let newInput = true;
  let history  = [];

  function updateDisplay() {
    resultEl.textContent = formatNumber(current);
    exprEl.textContent   = expr;
  }

  function formatNumber(n) {
    if (n === 'Error') return 'Error';
    const num = parseFloat(n);
    if (isNaN(num)) return n;
    if (Math.abs(num) >= 1e15) return num.toExponential(6);
    return n.includes('.') ? n : Number(n).toLocaleString('en-US');
  }

  function clearHint() { hintEl.textContent = ''; }

  function addHistory(entry) {
    history.unshift(entry);
    if (history.length > 8) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyEl.innerHTML = '';
    history.forEach(h => {
      const chip = document.createElement('button');
      chip.className = 'history-chip';
      chip.textContent = h;
      chip.addEventListener('click', () => {
        const val = h.split('=')[1]?.trim();
        if (val) { current = val; newInput = true; updateDisplay(); }
      });
      historyEl.appendChild(chip);
    });
  }

  function operate(a, op, b) {
    a = parseFloat(a); b = parseFloat(b);
    switch(op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 'Error' : a / b;
    }
  }

  function handleKey(type, value) {
    clearHint();
    if (type === 'num') {
      if (newInput) { current = value === '.' ? '0.' : value; newInput = false; }
      else {
        if (value === '.' && current.includes('.')) return;
        if (current === '0' && value !== '.') current = value;
        else current += value;
      }
    }
    else if (type === 'op') {
      if (prevVal !== null && !newInput) {
        const res = operate(prevVal, operator, current);
        const e = `${prevVal} ${operator} ${current}`;
        if (res === 'Error') { current = 'Error'; prevVal = null; operator = null; }
        else { addHistory(`${e} = ${round(res)}`); current = String(round(res)); prevVal = current; }
      } else { prevVal = current; }
      operator = value;
      expr = `${prevVal} ${value}`;
      newInput = true;
    }
    else if (type === 'eq') {
      if (prevVal !== null && operator) {
        const res = operate(prevVal, operator, current);
        const e   = `${prevVal} ${operator} ${current}`;
        if (res === 'Error') { current = 'Error'; hintEl.textContent = 'Cannot divide by zero'; }
        else {
          addHistory(`${e} = ${round(res)}`);
          expr    = `${e} =`;
          current = String(round(res));
          popAnimation();
        }
        prevVal = null; operator = null; newInput = true;
      }
    }
    else if (type === 'clear')   { current = '0'; expr = ''; prevVal = null; operator = null; newInput = true; clearHint(); }
    else if (type === 'sign')    { current = String(parseFloat(current) * -1); }
    else if (type === 'percent') { current = String(parseFloat(current) / 100); }
    else if (type === 'decimal') { if (!current.includes('.')) { current += '.'; newInput = false; } }
    else if (type === 'backspace') {
      if (current.length > 1) current = current.slice(0, -1);
      else current = '0';
    }
    updateDisplay();
  }

  function popAnimation() {
    resultEl.classList.remove('pop');
    void resultEl.offsetWidth;
    resultEl.classList.add('pop');
    setTimeout(() => resultEl.classList.remove('pop'), 250);
  }

  // Bind keypad
  document.querySelectorAll('#standard .key').forEach(key => {
    key.addEventListener('click', e => {
      addRipple(e);
      if (key.dataset.num)    handleKey('num', key.dataset.num);
      if (key.dataset.op)     handleKey('op',  key.dataset.op);
      if (key.dataset.action === 'equals')   handleKey('eq');
      if (key.dataset.action === 'clear')    handleKey('clear');
      if (key.dataset.action === 'sign')     handleKey('sign');
      if (key.dataset.action === 'percent')  handleKey('percent');
      if (key.dataset.action === 'decimal')  handleKey('decimal');
      if (key.dataset.action === 'backspace')handleKey('backspace');
    });
  });

  // Keyboard support
  document.addEventListener('keydown', e => {
    if (!document.getElementById('standard').classList.contains('active')) return;
    const map = {'0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
      '.':'decimal','Enter':'eq','Escape':'clear','Backspace':'backspace',
      '+':'+','*':'×','/':'÷','-':'−','%':'percent'};
    const v = map[e.key];
    if (!v) return;
    e.preventDefault();
    if ('0123456789'.includes(v)) handleKey('num', v);
    else if (['+','−','×','÷'].includes(v)) handleKey('op', v);
    else if (v === 'eq') handleKey('eq');
    else handleKey(v);
  });

  updateDisplay();
}

/* ════════════════════════════════════════════════
   3. SCIENTIFIC CALCULATOR
═══════════════════════════════════════════════ */
function initScientific() {
  const exprEl    = document.getElementById('sci-expr');
  const resultEl  = document.getElementById('sci-result');
  const hintEl    = document.getElementById('sci-hint');
  const historyEl = document.getElementById('sci-history');

  let current   = '0';
  let expr      = '';
  let operator  = null;
  let prevVal   = null;
  let newInput  = true;
  let history   = [];
  let pendingPow = false;

  function updateDisplay() {
    resultEl.textContent = current;
    exprEl.textContent   = expr;
  }

  function addHistory(entry) {
    history.unshift(entry);
    if (history.length > 6) history.pop();
    historyEl.innerHTML = '';
    history.forEach(h => {
      const chip = document.createElement('button');
      chip.className = 'history-chip';
      chip.textContent = h;
      historyEl.appendChild(chip);
    });
  }

  function operate(a, op, b) {
    a = parseFloat(a); b = parseFloat(b);
    switch(op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 'Error' : a / b;
      case '^': return Math.pow(a, b);
    }
  }

  function handleSci(fn) {
    let val = parseFloat(current);
    let res, label;
    switch(fn) {
      case 'sin':  res = round(Math.sin(val * Math.PI / 180)); label = `sin(${val}°)`; break;
      case 'cos':  res = round(Math.cos(val * Math.PI / 180)); label = `cos(${val}°)`; break;
      case 'tan':  res = round(Math.tan(val * Math.PI / 180)); label = `tan(${val}°)`; break;
      case 'log':  res = val <= 0 ? 'Error' : round(Math.log10(val)); label = `log(${val})`; break;
      case 'ln':   res = val <= 0 ? 'Error' : round(Math.log(val));   label = `ln(${val})`; break;
      case 'sqrt': res = val < 0 ? 'Error' : round(Math.sqrt(val));   label = `√${val}`; break;
      case 'sq':   res = round(val * val);    label = `${val}²`; break;
      case 'abs':  res = Math.abs(val);       label = `|${val}|`; break;
      case 'inv':  res = val === 0 ? 'Error' : round(1 / val); label = `1/${val}`; break;
      case 'fact': res = factorial(Math.round(val)); label = `${val}!`; break;
      case 'pi':   current = String(Math.PI); newInput = true; updateDisplay(); hintEl.textContent = 'π ≈ 3.14159...'; return;
      case 'e':    current = String(Math.E);  newInput = true; updateDisplay(); hintEl.textContent = 'e ≈ 2.71828...'; return;
      case 'pow':
        prevVal = current; operator = '^'; expr = `${current}^`; newInput = true;
        updateDisplay(); return;
    }
    if (res !== undefined) {
      if (res === 'Error') { current = 'Error'; hintEl.textContent = 'Math Error'; }
      else { addHistory(`${label} = ${res}`); current = String(res); hintEl.textContent = `${label} = ${res}`; }
      newInput = true; updateDisplay();
    }
  }

  function handleKey(type, value) {
    hintEl.textContent = '';
    if (type === 'num') {
      if (newInput) { current = value === '.' ? '0.' : value; newInput = false; }
      else { if (value === '.' && current.includes('.')) return; current = (current === '0' && value !== '.') ? value : current + value; }
    }
    else if (type === 'op') {
      if (prevVal !== null && !newInput) {
        const res = operate(prevVal, operator, current);
        if (res === 'Error') { current = 'Error'; prevVal = null; operator = null; }
        else { current = String(round(res)); prevVal = current; }
      } else { prevVal = current; }
      operator = value; expr = `${prevVal} ${value}`; newInput = true;
    }
    else if (type === 'eq') {
      if (prevVal !== null && operator) {
        const res = operate(prevVal, operator, current);
        const e   = `${prevVal} ${operator} ${current}`;
        if (res === 'Error') current = 'Error';
        else { addHistory(`${e} = ${round(res)}`); expr = `${e} =`; current = String(round(res)); }
        prevVal = null; operator = null; newInput = true;
      }
    }
    else if (type === 'clear')    { current = '0'; expr = ''; prevVal = null; operator = null; newInput = true; hintEl.textContent = ''; }
    else if (type === 'backspace') { current = current.length > 1 ? current.slice(0,-1) : '0'; }
    updateDisplay();
  }

  document.querySelectorAll('#scientific .key').forEach(key => {
    key.addEventListener('click', e => {
      addRipple(e);
      if (key.dataset.sci)  handleSci(key.dataset.sci);
      if (key.dataset.num)  handleKey('num', key.dataset.num);
      if (key.dataset.op)   handleKey('op',  key.dataset.op);
      if (key.dataset.action === 'equals')    handleKey('eq');
      if (key.dataset.action === 'clear')     handleKey('clear');
      if (key.dataset.action === 'backspace') handleKey('backspace');
    });
  });

  updateDisplay();
}

/* ════════════════════════════════════════════════
   4. CURRENCY CONVERTER
═══════════════════════════════════════════════ */
const CURRENCIES = {
  USD: { name:'US Dollar',       flag:'🇺🇸', rate:1       },
  EUR: { name:'Euro',            flag:'🇪🇺', rate:0.92    },
  GBP: { name:'British Pound',   flag:'🇬🇧', rate:0.79    },
  PKR: { name:'Pakistani Rupee', flag:'🇵🇰', rate:278.50  },
  INR: { name:'Indian Rupee',    flag:'🇮🇳', rate:83.12   },
  AED: { name:'UAE Dirham',      flag:'🇦🇪', rate:3.67    },
  SAR: { name:'Saudi Riyal',     flag:'🇸🇦', rate:3.75    },
  JPY: { name:'Japanese Yen',    flag:'🇯🇵', rate:149.50  },
  CNY: { name:'Chinese Yuan',    flag:'🇨🇳', rate:7.24    },
  CAD: { name:'Canadian Dollar', flag:'🇨🇦', rate:1.36    },
  AUD: { name:'Australian Dollar',flag:'🇦🇺',rate:1.53    },
  CHF: { name:'Swiss Franc',     flag:'🇨🇭', rate:0.91    },
  TRY: { name:'Turkish Lira',    flag:'🇹🇷', rate:30.80   },
  MYR: { name:'Malaysian Ringgit',flag:'🇲🇾',rate:4.65    },
  SGD: { name:'Singapore Dollar',flag:'🇸🇬', rate:1.34    },
  KWD: { name:'Kuwaiti Dinar',   flag:'🇰🇼', rate:0.308   },
  BHD: { name:'Bahraini Dinar',  flag:'🇧🇭', rate:0.376   },
  BTC: { name:'Bitcoin',         flag:'₿',    rate:0.0000238},
};

const POPULAR_PAIRS = [
  ['USD','PKR'],['EUR','PKR'],['GBP','PKR'],['AED','PKR'],
  ['SAR','PKR'],['USD','EUR'],['USD','GBP'],['USD','INR'],
];

function initCurrency() {
  const fromSel   = document.getElementById('from-currency');
  const toSel     = document.getElementById('to-currency');
  const amtFrom   = document.getElementById('amount-from');
  const amtTo     = document.getElementById('amount-to');
  const flagFrom  = document.getElementById('flag-from');
  const flagTo    = document.getElementById('flag-to');
  const rateText  = document.getElementById('rate-text');
  const pairGrid  = document.getElementById('pair-grid');
  const rateStatus= document.getElementById('rate-status');
  const refreshBtn= document.getElementById('refresh-rates');

  // Populate selects
  Object.entries(CURRENCIES).forEach(([code, info]) => {
    [fromSel, toSel].forEach(sel => {
      const opt = document.createElement('option');
      opt.value       = code;
      opt.textContent = `${code} — ${info.name}`;
      sel.appendChild(opt);
    });
  });
  fromSel.value = 'USD';
  toSel.value   = 'PKR';

  function convert() {
    const from  = fromSel.value;
    const to    = toSel.value;
    const amt   = parseFloat(amtFrom.value) || 0;
    const inUSD = amt / CURRENCIES[from].rate;
    const res   = inUSD * CURRENCIES[to].rate;
    amtTo.value = round(res, 4);
    const one   = round(CURRENCIES[to].rate / CURRENCIES[from].rate, 4);
    rateText.textContent = `1 ${from} = ${one} ${to}`;
    flagFrom.textContent = CURRENCIES[from].flag;
    flagTo.textContent   = CURRENCIES[to].flag;
  }

  fromSel.addEventListener('change', convert);
  toSel.addEventListener('change', convert);
  amtFrom.addEventListener('input', convert);

  document.getElementById('swap-currency').addEventListener('click', () => {
    [fromSel.value, toSel.value] = [toSel.value, fromSel.value];
    convert();
  });

  refreshBtn.addEventListener('click', async () => {
    rateStatus.textContent = 'Fetching live rates...';
    refreshBtn.textContent = '↻ Loading...';
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (res.ok) {
        const data = await res.json();
        Object.keys(CURRENCIES).forEach(code => {
          if (data.rates[code]) CURRENCIES[code].rate = data.rates[code];
        });
        rateStatus.textContent = `Live rates ✓ — Updated ${new Date().toLocaleTimeString()}`;
        convert();
        buildPairs();
      } else { throw new Error(); }
    } catch {
      rateStatus.textContent = 'Live rates unavailable — using reference rates';
    }
    refreshBtn.textContent = '↻ Refresh';
  });

  function buildPairs() {
    pairGrid.innerHTML = '';
    POPULAR_PAIRS.forEach(([f, t]) => {
      const rate = round(CURRENCIES[t].rate / CURRENCIES[f].rate, 2);
      const chip = document.createElement('div');
      chip.className = 'pair-chip';
      chip.innerHTML = `<div class="pair-name">${CURRENCIES[f].flag} ${f} → ${t} ${CURRENCIES[t].flag}</div>
                        <div class="pair-rate">1 ${f} = ${rate} ${t}</div>`;
      chip.addEventListener('click', () => {
        fromSel.value = f; toSel.value = t; amtFrom.value = 1; convert();
      });
      pairGrid.appendChild(chip);
    });
  }

  buildPairs();
  convert();
}

/* ════════════════════════════════════════════════
   5. UNIT CONVERTER
═══════════════════════════════════════════════ */
const UNITS = {
  length: {
    label:'Length',
    units:{
      Meter:{f:1}, Kilometer:{f:0.001}, Centimeter:{f:100}, Millimeter:{f:1000},
      Mile:{f:0.000621371}, Yard:{f:1.09361}, Foot:{f:3.28084}, Inch:{f:39.3701},
      'Nautical Mile':{f:0.000539957}, Furlong:{f:0.00497096}
    }
  },
  weight: {
    label:'Weight',
    units:{
      Kilogram:{f:1}, Gram:{f:1000}, Milligram:{f:1e6}, Tonne:{f:0.001},
      Pound:{f:2.20462}, Ounce:{f:35.274}, Stone:{f:0.157473}, Carat:{f:5000}
    }
  },
  temp: {
    label:'Temperature',
    units:{
      Celsius:{},Fahrenheit:{},Kelvin:{}
    }
  },
  area: {
    label:'Area',
    units:{
      'Sq Meter':{f:1},'Sq Kilometer':{f:1e-6},'Sq Centimeter':{f:10000},
      'Sq Foot':{f:10.7639},'Sq Inch':{f:1550.0},'Sq Yard':{f:1.19599},
      Acre:{f:0.000247105},Hectare:{f:0.0001}
    }
  },
  speed: {
    label:'Speed',
    units:{
      'm/s':{f:1},'km/h':{f:3.6},'mph':{f:2.23694},'ft/s':{f:3.28084},
      Knot:{f:1.94384},'Mach':{f:0.00293858}
    }
  },
  data: {
    label:'Data',
    units:{
      Bit:{f:1},Byte:{f:0.125},Kilobyte:{f:1.25e-4},Megabyte:{f:1.25e-7},
      Gigabyte:{f:1.25e-10},Terabyte:{f:1.25e-13},Kilobit:{f:0.001},
      Megabit:{f:1e-6},Gigabit:{f:1e-9}
    }
  }
};

function convertTemp(val, from, to) {
  let c;
  if (from === 'Celsius')    c = val;
  if (from === 'Fahrenheit') c = (val - 32) / 1.8;
  if (from === 'Kelvin')     c = val - 273.15;
  if (to === 'Celsius')    return round(c, 4);
  if (to === 'Fahrenheit') return round(c * 1.8 + 32, 4);
  if (to === 'Kelvin')     return round(c + 273.15, 4);
}

function initUnit() {
  const catBtns  = document.querySelectorAll('.unit-cat');
  const fromSel  = document.getElementById('unit-from');
  const toSel    = document.getElementById('unit-to');
  const inputFrom= document.getElementById('unit-input-from');
  const inputTo  = document.getElementById('unit-input-to');
  const formula  = document.getElementById('unit-formula');

  let currentCat = 'length';

  function populateSelects(cat) {
    [fromSel, toSel].forEach(sel => sel.innerHTML = '');
    const units = Object.keys(UNITS[cat].units);
    units.forEach(u => {
      [fromSel, toSel].forEach(sel => {
        const o = document.createElement('option');
        o.value = u; o.textContent = u;
        sel.appendChild(o);
      });
    });
    fromSel.value = units[0];
    toSel.value   = units[1] || units[0];
  }

  function convert() {
    const from = fromSel.value;
    const to   = toSel.value;
    const val  = parseFloat(inputFrom.value) || 0;

    if (currentCat === 'temp') {
      inputTo.value = convertTemp(val, from, to);
      formula.textContent = `${val} ${from} → ${inputTo.value} ${to}`;
      return;
    }

    const fFrom = UNITS[currentCat].units[from].f;
    const fTo   = UNITS[currentCat].units[to].f;
    const base  = val / fFrom;
    inputTo.value = round(base * fTo, 6);
    formula.textContent = `${val} ${from} = ${inputTo.value} ${to}`;
  }

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      populateSelects(currentCat);
      inputFrom.value = 1;
      convert();
    });
  });

  fromSel.addEventListener('change', convert);
  toSel.addEventListener('change', convert);
  inputFrom.addEventListener('input', convert);

  document.getElementById('swap-units').addEventListener('click', () => {
    [fromSel.value, toSel.value] = [toSel.value, fromSel.value];
    convert();
  });

  populateSelects('length');
  convert();
}

/* ════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function round(n, decimals = 10) {
  if (n === 'Error' || isNaN(n)) return n;
  return parseFloat(parseFloat(n).toPrecision(12));
}

function factorial(n) {
  if (n < 0 || n > 170) return 'Error';
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function addRipple(e) {
  const btn  = e.currentTarget;
  const r    = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.className = 'key-ripple';
  r.style.cssText = `
    width:${size}px; height:${size}px;
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top  - size/2}px;
  `;
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}