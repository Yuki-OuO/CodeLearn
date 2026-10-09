
const questions = [
  {
    id: "PY-001",
    title: "Hello World",
    level: "入門",
    topic: "基本輸出",
    description: "請撰寫 Python 程式，輸出 Hello World。",
    example: "Hello World",
    hint: "可以使用 print() 顯示文字。",
    starter: 'print("Hello World")',
    reference: 'print("Hello World")',
    check: code => /\bprint\s*\(/.test(code) &&
      /Hello World/.test(code)
  },
  {
    id: "PY-002",
    title: "兩數相加",
    level: "入門",
    topic: "變數與運算",
    description: "設定兩個整數 a = 5、b = 3，並輸出兩數相加的結果。",
    example: "8",
    hint: "使用 + 運算子，再將結果交給 print()。",
    starter: "a = 5\nb = 3\nprint(a + b)",
    reference: "a = 5\nb = 3\nprint(a + b)",
    check: code => /\ba\s*=\s*5\b/.test(code) &&
      /\bb\s*=\s*3\b/.test(code) &&
      /\bprint\s*\([^)]*\ba\b[^)]*\+[^)]*\bb\b[^)]*\)/.test(code)
  },
  {
    id: "PY-003",
    title: "判斷奇偶數",
    level: "初級",
    topic: "條件判斷",
    description: "設定 n = 7，判斷它是奇數還是偶數。奇數輸出 Odd，偶數輸出 Even。",
    example: "Odd",
    hint: "使用 if、else 與取餘數運算子 %。",
    starter: 'n = 7\nif n % 2 != 0:\n    print("Odd")\nelse:\n    print("Even")',
    reference: 'n = 7\nif n % 2 != 0:\n    print("Odd")\nelse:\n    print("Even")',
    check: code => /\bn\s*=\s*7\b/.test(code) &&
      /\bif\b/.test(code) && /\belse\b/.test(code) &&
      /%/.test(code) && /Odd/.test(code) && /Even/.test(code)
  },
  {
    id: "PY-004",
    title: "計算 1 到 5 的總和",
    level: "初級",
    topic: "迴圈",
    description: "使用迴圈計算整數 1、2、3、4、5 的總和，並輸出結果。",
    example: "15",
    hint: "可使用 for 迴圈與 range()。",
    starter: "total = 0\nfor i in range(1, 6):\n    total += i\nprint(total)",
    reference: "total = 0\nfor i in range(1, 6):\n    total += i\nprint(total)",
    check: code => /\bfor\b/.test(code) &&
      /\brange\s*\(/.test(code) &&
      /\bprint\s*\(/.test(code) &&
      /15|total/.test(code) && /(\+=|=\s*total\s*\+)/.test(code)
  },
  {
    id: "PY-005",
    title: "計算矩形面積",
    level: "入門",
    topic: "基本運算",
    description: "設定長方形長度 length = 6、寬度 width = 4，輸出面積。",
    example: "24",
    hint: "矩形面積等於長乘以寬。",
    starter: "length = 6\nwidth = 4\nprint(length * width)",
    reference: "length = 6\nwidth = 4\nprint(length * width)",
    check: code => /\blength\s*=\s*6\b/.test(code) &&
      /\bwidth\s*=\s*4\b/.test(code) &&
      /\bprint\s*\([^)]*\blength\b[^)]*\*[^)]*\bwidth\b[^)]*\)/.test(code)
  },
  {
    id: "PY-006",
    title: "九九乘法表",
    level: "初級",
    topic: "巢狀迴圈",
    description: "使用巢狀迴圈，列印 1 到 3 的乘法表，每列顯示一組乘法結果。",
    example: "1 x 1 = 1\n1 x 2 = 2\n...\n3 x 3 = 9",
    hint: "可使用兩層 for 迴圈及格式化字串。",
    starter: 'for i in range(1, 4):\n    for j in range(1, 4):\n        print(f"{i} x {j} = {i * j}")',
    reference: 'for i in range(1, 4):\n    for j in range(1, 4):\n        print(f"{i} x {j} = {i * j}")',
    check: code => (code.match(/\bfor\b/g) || []).length >= 2 &&
      /range\s*\(/.test(code) && /\bprint\s*\(/.test(code)
  }
];

const $ = id => document.getElementById(id);
let currentQuestion = null;
let userName = "";
let attempts = [];
let solved = [];

try {
  attempts = JSON.parse(localStorage.getItem("cl-attempts") || "[]");
  solved = JSON.parse(localStorage.getItem("cl-solved") || "[]");
  if (!Array.isArray(attempts)) attempts = [];
  if (!Array.isArray(solved)) solved = [];
} catch {
  attempts = [];
  solved = [];
}

function saveProgress() {
  try {
    localStorage.setItem("cl-attempts", JSON.stringify(attempts));
    localStorage.setItem("cl-solved", JSON.stringify(solved));
  } catch {
    // 若瀏覽器不允許本機儲存，仍可在目前頁面操作。
  }
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(el => {
    el.classList.toggle("hidden", el.id !== page);
  });

  document.querySelectorAll("[data-page]").forEach(el => {
    el.classList.toggle("active", el.dataset.page === page);
  });

  const headings = {
    dashboard: "首頁總覽",
    questions: "題庫練習",
    practice: "Python 練習區",
    history: "學習紀錄"
  };

  $("page-heading").textContent = headings[page] || "CodeLearn";

  if (page === "questions") renderQuestions();
  if (page === "history") renderHistory();
  if (page === "dashboard") renderDashboard();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openLogin() {
  $("login-modal").classList.remove("hidden");
  $("login-account").focus();
}

function closeLogin() {
  $("login-modal").classList.add("hidden");
}

$("login-form").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("login-account").value.trim();
  const password = $("login-password").value;

  if (!name || !password) return;

  // 僅供展示：不驗證密碼，也不建立真正的會員帳號。
  userName = name;
  $("user-name").textContent = name;
  $("avatar").textContent = Array.from(name)[0] || "訪";

  closeLogin();
  $("login-password").value = "";
});

$("login-modal").addEventListener("click", event => {
  if (event.target.id === "login-modal") closeLogin();
});

function renderDashboard() {
  $("total-count").textContent = questions.length;
  $("solved-count").textContent = solved.length;
  $("attempt-count").textContent = attempts.length;

  const passed = attempts.filter(item => item.passed).length;
  $("pass-rate").textContent = attempts.length
    ? Math.round(passed / attempts.length * 100) + "%"
    : "0%";

  $("featured-list").innerHTML = questions.slice(0, 3)
    .map(questionCard).join("");
}

function questionCard(q) {
  const done = solved.includes(q.id);

  return `
    <article class="question-card">
      <div class="card-meta">
        <span class="eyebrow">${q.id}</span>
        <span class="level">${q.level}</span>
      </div>
      <h4>${q.title}</h4>
      <p>${q.topic} · ${q.description}</p>
      <p>${done ? "✓ 已完成" : "○ 尚未完成"}</p>
      <button class="primary-btn"
        onclick="openQuestion('${q.id}')">開始練習 →</button>
    </article>`;
}

function renderQuestions() {
  const keyword = $("search-input").value.trim().toLowerCase();
  const level = $("level-filter").value;

  const filtered = questions.filter(q => {
    const matchesKeyword =
      `${q.id} ${q.title} ${q.topic} ${q.description}`
        .toLowerCase().includes(keyword);
    const matchesLevel = level === "全部" || q.level === level;
    return matchesKeyword && matchesLevel;
  });

  $("question-list").innerHTML = filtered.length
    ? filtered.map(q => `
      <article class="list-row">
        <div>
          <div class="card-meta">
            <span class="eyebrow">${q.id}</span>
            <span class="level">${q.level}</span>
          </div>
          <h4>${q.title}</h4>
          <p>${q.topic} · ${solved.includes(q.id) ? "已完成" : "尚未完成"}</p>
        </div>
        <button class="primary-btn"
          onclick="openQuestion('${q.id}')">開始練習</button>
      </article>`).join("")
    : '<div class="panel">找不到符合條件的題目。</div>';
}

$("search-input").addEventListener("input", renderQuestions);
$("level-filter").addEventListener("change", renderQuestions);

function openQuestion(id) {
  const q = questions.find(item => item.id === id);
  if (!q) return;

  currentQuestion = q;
  $("practice-id").textContent = q.id;
  $("practice-title").textContent = q.title;
  $("practice-level").textContent = q.level;
  $("practice-description").textContent = q.description;
  $("practice-example").textContent = q.example;
  $("practice-hint").textContent = q.hint;
  $("code-editor").value = q.starter;
  $("result-message").textContent = "等待提交答案...";
  $("result-output").textContent = "";

  showPage("practice");
}

function resetCode() {
  if (!currentQuestion) return;
  $("code-editor").value = currentQuestion.starter;
  $("result-message").textContent = "程式碼已重設。";
  $("result-output").textContent = "";
}

function showExampleCode() {
  if (!currentQuestion) return;
  $("code-editor").value = currentQuestion.reference;
  $("result-message").textContent =
    "已載入參考程式。你可以閱讀程式碼，再自行練習。";
  $("result-output").textContent = "";
}

function submitCode() {
  if (!currentQuestion) return;

  const code = $("code-editor").value.trim();
  if (!code) {
    $("result-message").textContent = "請先輸入程式碼。";
    return;
  }

  // 重要：此處只檢查簡單的程式碼特徵，
  // 並沒有真正執行 Python 或比對實際執行輸出。
  const passed = currentQuestion.check(code);

  attempts.push({
    id: currentQuestion.id,
    title: currentQuestion.title,
    passed,
    time: new Date().toLocaleString("zh-TW")
  });

  if (passed && !solved.includes(currentQuestion.id)) {
    solved.push(currentQuestion.id);
  }

  saveProgress();

  $("result-message").textContent = passed
    ? "✓ 範例檢查通過！這是前端示範評測，並非真正執行結果。"
    : "尚未符合這道題目的示範規則，請參考提示並檢查程式碼。";

  $("result-output").textContent = passed
    ? "預期輸出範例：\n" + currentQuestion.example
    : "提示：" + currentQuestion.hint;

  renderDashboard();
}

function renderHistory() {
  const rows = questions.map(q => {
    const records = attempts.filter(item => item.id === q.id);
    const latest = records[records.length - 1];

    return `
      <tr>
        <td>${q.id} · ${q.title}</td>
        <td>${latest
          ? (latest.passed ? "通過（示範）" : "未通過")
          : "尚未作答"}</td>
        <td>${records.length}</td>
      </tr>`;
  });

  $("history-table").innerHTML = rows.join("");
}

function clearHistory() {
  if (!confirm("確定要清除所有練習紀錄嗎？")) return;

  attempts = [];
  solved = [];
  saveProgress();
  renderHistory();
  renderDashboard();
}

renderDashboard();
renderQuestions();
renderHistory();
