async function loadThreads() {
  const res = await fetch("./threads.json");
  return res.json();
}

function $(sel) { return document.querySelector(sel); }

function toTextDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString([], { year: "numeric", month: "short", day: "numeric" });
}

function renderCatalog(threads) {
  const catalog = $("#catalog");
  if (!catalog) return;

  const q = ($("#q")?.value || "").toLowerCase();
  const activeSort = document.querySelector(".tab.is-active")?.dataset.sort || "bumped";

  let list = [...threads];

  if (q) {
    list = list.filter(t =>
      (t.title + " " + t.lede + " " + t.board).toLowerCase().includes(q)
    );
  }

  if (activeSort === "latest") {
    list.sort((a,b) => new Date(b.created) - new Date(a.created));
  } else if (activeSort === "pinned") {
    list.sort((a,b) => (b.pinned === true) - (a.pinned === true));
  } else { // bumped
    list.sort((a,b) => new Date(b.bumped) - new Date(a.bumped));
  }

  catalog.innerHTML = list.map(t => `
    <a class="card" href="./thread.html?id=${encodeURIComponentss="thumb" style="background-image:url('${t.thumb}')"></div>
      <div class="card-body">
        <div class="meta">
          <span class="board">/${t.board}/</span>
          ${t.pinned ? `<span class="pin">PINNED</span>` : ``}
          <span class="muted">${toTextDate(t.bumped)}</span>
          <span class="muted">${t.replies.length} repl</span>
        </div>
        <h3>${t.title}</h3>
        <p>${t.lede}</p>
      </div>
    </a>
  `).join("");
}

function mdToHtml(lines) {
  // ultra-minimal markdown-ish rendering for headings/bullets
  return lines.map(line => {
    if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
    if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
    if (line.trim() === "") return "";
    return `<p>${line}</p>`;
  }).join("").replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>");
}

function renderThread(threads) {
  const op = $("#op");
  const replies = $("#replies");
  if (!op || !replies) return;

  const id = new URLSearchParams(location.search).get("id");
  const t = threads.find(x => x.id === id) || threads[0];

  document.title = t.title;

  op.innerHTML = `
    <div class="op-head">
      <div class="meta">
        <span class="board">/${t.board}/</span>
        ${t.pinned ? `<span class="pin">PINNED</span>` : ``}
        <span class="muted">Posted ${toTextDate(t.created)}</span>
      </div>
      <h1>${t.title}</h1>
      <p class="lede">${t.lede}</p>
    </div>

    <div class="op-media">
      ${t.thumb}
    </div>

    <div class="op-body">
      ${mdToHtml(t.body)}
    </div>
  `;

  replies.innerHTML = t.replies.map(r => `
    <div class="reply">
      <div class="reply-meta">
        <span class="reply-no">No.${r.no}</span>
        <span class="reply-name">${r.name}</span>
        <span class="muted">${toTextDate(r.time)}</span>
      </div>
      <div class="reply-text">${r.text}</div>
    </div>
  `).join("");
}

async function init() {
  const threads = await loadThreads();

  // Hooks
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderCatalog(threads);
    });
  });

  $("#q")?.addEventListener("input", () => renderCatalog(threads));

  renderCatalog(threads);
  renderThread(threads);
}

init();
``
