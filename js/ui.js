const paths = {
  "book-open": '<path d="M12 7c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V6c-3-1-6-1-9 1Zm0 0v14"/>',
  library: '<path d="M4 4v16M8 4v16M12 4v16M16 5l4 14M3 20h18"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>',
  chart: '<path d="M4 4v16h17M9 16v-5m5 5V7m5 9v-7"/>',
  "arrow-right": '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  sort: '<path d="M4 7h16M7 12h10M10 17h4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  leaf: '<path d="M20 3c-12-1-19 8-12 14 6 5 13-3 12-14ZM5 21 16 9"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>',
  star: '<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',
};

export function icon(name) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths["book-open"]}</svg>`;
}
export function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach(element => { element.innerHTML = icon(element.dataset.icon); });
}
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
export function cover(book, compact = false) {
  const hash = [...book.title].reduce((sum, char) => sum + char.codePointAt(0), 0);
  return `<div class="book-cover cover-${hash % 6} ${compact ? "compact-cover" : ""}" aria-hidden="true"><span class="cover-category">${escapeHtml(book.genre || "UMA NOVA HISTÓRIA")}</span><strong>${escapeHtml(book.title)}</strong><div class="cover-decoration"><i></i><i></i><i></i></div><span class="cover-author">${escapeHtml(book.author)}</span><span class="cover-spine"></span></div>`;
}
export const statusNames = { quero_ler: "Quero ler", lendo: "Lendo", concluido: "Concluído" };
export function bookCard(book) {
  const percent = Math.round(book.current_page / book.total_pages * 100);
  return `<article class="book-card">${cover(book)}<div class="book-info"><div class="book-meta"><span class="status-pill ${book.status}"><i></i>${statusNames[book.status]}</span>${book.rating ? `<span class="rating" aria-label="${book.rating} de 5 estrelas">★ ${book.rating}</span>` : ""}</div><h3 title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h3><p class="book-author">${escapeHtml(book.author)}</p><div class="book-progress"><div><span>${book.current_page} de ${book.total_pages} pág.</span><strong>${percent}%</strong></div><progress max="100" value="${percent}" aria-label="Progresso de ${escapeHtml(book.title)}"></progress></div><div class="book-actions"><button class="text-button" data-edit="${book.id}">${icon("edit")}${book.status === "lendo" ? "Atualizar leitura" : "Editar livro"}</button><button class="icon-button delete-button" data-delete="${book.id}" aria-label="Excluir ${escapeHtml(book.title)}">${icon("trash")}</button></div></div></article>`;
}
export function emptyState(title, text, action = "") {
  return `<div class="empty-state">${icon("book-open")}<h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p>${action}</div>`;
}
export function chartMarkup(months) {
  const max = Math.max(3, ...months.map(month => month.count));
  return months.map(month => {
    const label = new Date(`${month.month}-15T12:00:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return `<div class="chart-column"><span class="bar-value">${month.count}</span><div class="bar-track"><div class="bar" style="height:${Math.max(3, month.count / max * 100)}%" title="${label}: ${month.count} livros"></div></div><span>${label}</span></div>`;
  }).join("");
}
let toastTimer;
export function toast(message) {
  const element = document.querySelector("#toast");
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { element.hidden = true; }, 4500);
}
