import { request, apiBase } from "./api.js";
import { icon, hydrateIcons, escapeHtml, cover, bookCard, emptyState, chartMarkup, toast } from "./ui.js";

const $ = selector => document.querySelector(selector);
const state = { view: "estante", status: "", sort: "recentes", q: "", page: 1, books: [], stats: null, catalog: [], catalogPage: 1, catalogQuery: "", deleting: null };
let shelfController;
let catalogController;
let statsGeneration = 0;

function showError(selector, message) {
  const element = $(selector);
  element.textContent = message;
  element.hidden = !message;
}

async function loadBooks() {
  shelfController?.abort();
  const controller = new AbortController();
  shelfController = controller;
  const grid = $("#books-grid");
  grid.setAttribute("aria-busy", "true");
  const params = new URLSearchParams({ q: state.q, sort: state.sort, page: state.page, page_size: 6 });
  if (state.status) params.set("status", state.status);
  try {
    const result = await request(`/books?${params}`, { signal: controller.signal });
    if (state.page > 1 && !result.items.length) { state.page--; return loadBooks(); }
    state.books = result.items;
    $("#shelf-total").textContent = result.total;
    grid.innerHTML = result.items.length ? result.items.map(bookCard).join("") : emptyState(
      state.q || state.status ? "Nenhum livro por aqui" : "Toda estante começa com uma história",
      state.q || state.status ? "Experimente outro título ou filtro." : "Adicione seu primeiro livro ou descubra uma nova leitura.",
      '<button class="button primary" data-empty-add>Adicionar um livro</button>');
    renderPagination("#shelf-pagination", result.page, result.pages, "shelf");
    showError("#global-error", "");
  } catch (error) {
    if (controller.signal.aborted) return;
    showError("#global-error", error.message);
    grid.innerHTML = emptyState("Sua estante está aguardando", "A conexão não está disponível no momento.", '<button class="button secondary" data-retry>Reconectar</button>');
  } finally {
    if (shelfController === controller) grid.setAttribute("aria-busy", "false");
  }
}

function renderPagination(selector, page, pages, target) {
  $(selector).innerHTML = pages > 1 ? `<button class="button secondary" data-page="${page - 1}" data-target="${target}" ${page <= 1 ? "disabled" : ""}>Anterior</button><span>Página ${page} de ${pages}</span><button class="button secondary" data-page="${page + 1}" data-target="${target}" ${page >= pages ? "disabled" : ""}>Próxima</button>` : "";
}

async function loadStats() {
  const generation = ++statsGeneration;
  try {
    const stats = await request("/stats");
    if (generation !== statsGeneration) return;
    state.stats = stats;
    const cards = [["Sua coleção", stats.total, "livros na estante", "library", "green"], ["Em leitura", stats.lendo, "histórias acontecendo", "book-open", "orange"], ["Concluídos", stats.concluido, "mundos descobertos", "check", "purple"], ["Páginas lidas", stats.pages_read.toLocaleString("pt-BR"), "um pouco mais a cada dia", "layers", "blue"]];
    $("#metrics").innerHTML = cards.map(([label, value, caption, symbol, color]) => `<article class="metric"><div><span>${label}</span><strong>${value}</strong><small>${caption}</small></div><span class="metric-icon ${color}">${icon(symbol)}</span></article>`).join("");
    $("#nav-count").textContent = stats.total;
    $("#count-all").textContent = stats.total;
    $("#count-reading").textContent = stats.lendo;
    $("#count-want").textContent = stats.quero_ler;
    $("#count-done").textContent = stats.concluido;
    $("#demo-notice").hidden = stats.demo_books === 0;
    const goal = stats.goal;
    $("#goal-year").textContent = goal.year;
    $("#goal-completed").textContent = goal.completed;
    $("#goal-target").textContent = goal.target;
    $("#goal-ring").style.setProperty("--progress", `${Math.min(100, goal.completed / goal.target * 100)}%`);
    $("#goal-message").textContent = goal.completed >= goal.target ? "Meta alcançada! Cada história valeu a pena." : `Faltam ${goal.target - goal.completed} histórias para alcançar sua meta.`;
    $("#mini-chart").innerHTML = chartMarkup(stats.months);
    $("#mini-chart").setAttribute("aria-label", stats.months.map(month => `${month.month}: ${month.count} livros`).join("; "));
    renderJourney();
  } catch (error) { showError("#global-error", error.message); }
}

function renderJourney() {
  const stats = state.stats;
  if (!stats) return;
  const parts = [["Quero ler", stats.quero_ler, "want"], ["Em leitura", stats.lendo, "reading"], ["Concluídos", stats.concluido, "done"]];
  $("#journey-content").innerHTML = `<article class="journey-panel"><span class="eyebrow muted">CONSTÂNCIA, NO SEU TEMPO</span><h3>Seu ritmo nos últimos meses</h3><div class="bar-chart large-chart" role="img" aria-label="${escapeHtml(stats.months.map(m => `${m.month}: ${m.count} livros`).join('; '))}">${chartMarkup(stats.months)}</div><p>Contamos cada livro na sua data de conclusão.</p></article><article class="journey-panel"><span class="eyebrow muted">CADA HISTÓRIA TEM SEU MOMENTO</span><h3>Retrato da sua estante</h3><div class="distribution">${parts.map(([label, count, color]) => `<div><span>${label}<b>${count}</b></span><progress class="${color}" max="${Math.max(1, stats.total)}" value="${count}" aria-label="${label}"></progress></div>`).join("")}</div><p class="average-rating">${icon("star")} ${stats.average_rating || "—"} <span>avaliação média dos seus livros</span></p></article><article class="journey-panel journey-highlight"><span class="eyebrow">SUA META EM ${stats.goal.year}</span><strong>${stats.goal.completed}<small> / ${stats.goal.target} livros</small></strong><p>${stats.goal.completed >= stats.goal.target ? "Você chegou lá. Que venham novas histórias!" : "Não é uma corrida. É um convite para ler mais."}</p></article>`;
}

function switchView() {
  const selected = location.hash.slice(1);
  state.view = ["estante", "descobrir", "jornada"].includes(selected) ? selected : "estante";
  document.querySelectorAll(".view").forEach(view => { view.hidden = view.id !== `view-${state.view}`; });
  document.querySelectorAll("[data-view]").forEach(link => {
    link.classList.toggle("active", link.dataset.view === state.view);
    if (link.dataset.view === state.view) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
  });
  $("#breadcrumb-view").textContent = { estante: "Minha estante", descobrir: "Descobrir livros", jornada: "Minha jornada" }[state.view];
  $("#hero").hidden = state.view !== "estante";
  $("#metrics").hidden = state.view === "descobrir";
  document.title = `${$("#breadcrumb-view").textContent} · Entrelinhas`;
}

function openBook(book = null, fromCatalog = false) {
  $("#book-form").reset();
  $("#book-id").value = fromCatalog ? "" : book?.id || "";
  $("#book-source-id").value = book?.source_id || "";
  $("#book-title").value = book?.title || "";
  $("#book-author").value = book?.author || "";
  $("#book-genre").value = book?.genre || "Literatura";
  $("#book-status").value = book?.status || "quero_ler";
  $("#book-pages").value = book?.total_pages || 200;
  $("#book-current").value = book?.current_page || 0;
  $("#book-rating").value = book?.rating || 0;
  $("#book-notes").value = book?.notes || "";
  $("#book-dialog-title").textContent = book?.id && !fromCatalog ? "Cada página conta" : "Uma nova história";
  $("#book-source").hidden = !fromCatalog;
  $("#book-source").textContent = book?.total_pages ? "Encontrado no Open Library. Confira as páginas da sua edição antes de salvar." : "Encontrado no Open Library. Total de páginas não informado; substitua a sugestão de 200 páginas pela sua edição.";
  showError("#book-form-error", "");
  syncProgressInput();
  $("#book-dialog").showModal();
}

function syncProgressInput() {
  const status = $("#book-status").value;
  $("#book-current").disabled = status !== "lendo";
  if (status === "quero_ler") $("#book-current").value = 0;
  if (status === "concluido") $("#book-current").value = $("#book-pages").value;
  $("#book-current").max = $("#book-pages").value;
}

async function saveBook(event) {
  event.preventDefault();
  const button = $("#save-book");
  button.disabled = true;
  const id = $("#book-id").value;
  const body = { title: $("#book-title").value.trim(), author: $("#book-author").value.trim(), genre: $("#book-genre").value.trim(),
    status: $("#book-status").value, total_pages: Number($("#book-pages").value), current_page: Number($("#book-current").value),
    rating: Number($("#book-rating").value), notes: $("#book-notes").value.trim() };
  if (!id) body.source_id = $("#book-source-id").value || null;
  try {
    await request(id ? `/books/${id}` : "/books", { method: id ? "PATCH" : "POST", body });
    $("#book-dialog").close();
    toast(id ? "Leitura atualizada. Cada página conta!" : "Uma nova história na sua estante!");
    if (!id) state.page = 1;
    await Promise.all([loadBooks(), loadStats()]);
  } catch (error) { showError("#book-form-error", error.message); }
  finally { button.disabled = false; }
}

async function searchCatalog(page = 1) {
  catalogController?.abort();
  const controller = new AbortController();
  catalogController = controller;
  state.catalogPage = page;
  const container = $("#catalog-results");
  container.setAttribute("aria-busy", "true");
  container.innerHTML = '<div class="loading-state"><span class="spinner"></span>Procurando sua próxima história…</div>';
  $("#catalog-pagination").innerHTML = "";
  try {
    const params = new URLSearchParams({ q: state.catalogQuery, page, page_size: 8 });
    const result = await request(`/catalog/search?${params}`, { signal: controller.signal });
    state.catalog = result.items;
    container.innerHTML = result.items.length ? result.items.map((book, index) => `<article class="catalog-card">${cover(book, true)}<div><span class="eyebrow muted">${book.first_publish_year ? `PUBLICADO EM ${book.first_publish_year}` : "DO CATÁLOGO OPEN LIBRARY"}</span><h3>${escapeHtml(book.title)}</h3><p>${escapeHtml(book.author)}</p><button class="button secondary" data-import="${index}">${icon("plus")}Quero ler</button></div></article>`).join("") : emptyState("Uma história ainda por encontrar", "Tente outro título ou nome de autor.");
    renderPagination("#catalog-pagination", page, Math.ceil(result.total / result.page_size), "catalog");
  } catch (error) {
    if (controller.signal.aborted) return;
    container.innerHTML = emptyState("O catálogo fez uma pausa", error.message, '<button class="button secondary" data-catalog-retry>Tentar novamente</button>');
  } finally {
    if (catalogController === controller) container.setAttribute("aria-busy", "false");
  }
}

function openGoal() {
  $("#goal-input").value = state.stats?.goal.target || 12;
  showError("#goal-error", "");
  $("#goal-dialog").showModal();
}

document.addEventListener("click", async event => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  if (button.dataset.close) $(`#${button.dataset.close}`).close();
  if (button.hasAttribute("data-empty-add")) openBook();
  if (button.hasAttribute("data-retry")) await Promise.all([loadBooks(), loadStats()]);
  if (button.dataset.edit) {
    try { openBook(await request(`/books/${button.dataset.edit}`)); }
    catch (error) { toast(error.message); }
  }
  if (button.dataset.delete) {
    state.deleting = Number(button.dataset.delete);
    const book = state.books.find(item => item.id === state.deleting);
    $("#delete-description").textContent = `Você quer excluir “${book?.title || "este livro"}”?`;
    showError("#delete-error", "");
    $("#delete-dialog").showModal();
  }
  if (button.hasAttribute("data-status")) {
    state.status = button.dataset.status;
    state.page = 1;
    document.querySelectorAll("[data-status]").forEach(tab => {
      const active = tab === button;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-pressed", String(active));
    });
    await loadBooks();
  }
  if (button.dataset.page) {
    if (button.dataset.target === "shelf") { state.page = Number(button.dataset.page); await loadBooks(); }
    else await searchCatalog(Number(button.dataset.page));
  }
  if (button.dataset.query) {
    $("#catalog-query").value = button.dataset.query;
    state.catalogQuery = button.dataset.query;
    await searchCatalog();
  }
  if (button.hasAttribute("data-import")) openBook(state.catalog[Number(button.dataset.import)], true);
  if (button.hasAttribute("data-catalog-retry")) await searchCatalog(state.catalogPage);
});

$("#add-book").addEventListener("click", () => openBook());
$("#hero-discover").addEventListener("click", () => { location.hash = "descobrir"; });
$("#book-form").addEventListener("submit", saveBook);
$("#book-status").addEventListener("change", syncProgressInput);
$("#book-pages").addEventListener("input", syncProgressInput);
$("#shelf-sort").addEventListener("change", event => { state.sort = event.target.value; state.page = 1; loadBooks(); });
let searchTimer;
$("#shelf-search").addEventListener("input", event => {
  clearTimeout(searchTimer);
  state.q = event.target.value;
  state.page = 1;
  searchTimer = setTimeout(loadBooks, 250);
});
$("#catalog-form").addEventListener("submit", event => { event.preventDefault(); state.catalogQuery = $("#catalog-query").value.trim(); if (state.catalogQuery.length >= 2) searchCatalog(); });
$("#edit-goal").addEventListener("click", openGoal);
$("#journey-goal").addEventListener("click", openGoal);
$("#goal-form").addEventListener("submit", async event => {
  event.preventDefault();
  $("#save-goal").disabled = true;
  try {
    await request("/goal", { method: "PUT", body: { target: Number($("#goal-input").value) } });
    $("#goal-dialog").close();
    toast("Meta salva. Vá no seu ritmo!");
    await loadStats();
  } catch (error) { showError("#goal-error", error.message); }
  finally { $("#save-goal").disabled = false; }
});
$("#delete-form").addEventListener("submit", async event => {
  event.preventDefault();
  $("#confirm-delete").disabled = true;
  try {
    await request(`/books/${state.deleting}`, { method: "DELETE" });
    $("#delete-dialog").close();
    toast("Livro excluído da estante.");
    await Promise.all([loadBooks(), loadStats()]);
  } catch (error) { showError("#delete-error", error.message); }
  finally { $("#confirm-delete").disabled = false; }
});
window.addEventListener("hashchange", switchView);
hydrateIcons();
document.querySelectorAll("[data-status]").forEach(tab => tab.setAttribute("aria-pressed", String(tab.classList.contains("active"))));
$("#today").textContent = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
$("#api-docs-link").href = `${apiBase}/docs`;
$("#catalog-results").innerHTML = emptyState("Uma boa leitura começa com curiosidade", "Busque no catálogo para descobrir sua próxima história.");
$("#books-grid").innerHTML = '<div class="loading-state"><span class="spinner"></span>Organizando suas histórias…</div>';
switchView();
await Promise.all([loadBooks(), loadStats()]);
