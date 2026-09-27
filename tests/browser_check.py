"""Teste de interface com Chrome existente e banco temporário, sem instalar navegador."""
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright, expect

WEB_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = WEB_ROOT.parent
API_ROOT = WORKSPACE / "entrelinhas-api"
ARTIFACTS = WEB_ROOT / "docs"


def wait_for(url):
    for _ in range(80):
        try:
            with urllib.request.urlopen(url, timeout=1):
                return
        except OSError:
            time.sleep(0.2)
    raise RuntimeError(f"Servidor não respondeu: {url}")


def main():
    for port in (8000, 8080):
        with socket.socket() as sock:
            try:
                sock.bind(("127.0.0.1", port))
            except OSError:
                raise RuntimeError(f"Feche o Entrelinhas antes do teste; porta {port} ocupada.")
    runtime = WORKSPACE / ".runtime"
    runtime.mkdir(exist_ok=True)
    ARTIFACTS.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=runtime, prefix="browser-check-") as directory:
        env = {**os.environ, "DATABASE_PATH": str(Path(directory) / "test.db")}
        subprocess.run([sys.executable, "-m", "app.seed"], cwd=API_ROOT, env=env, check=True)
        flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
        processes = []
        try:
            processes.append(subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"], cwd=API_ROOT, env=env, creationflags=flags, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
            processes.append(subprocess.Popen([sys.executable, "serve.py"], cwd=WEB_ROOT, creationflags=flags, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
            wait_for("http://127.0.0.1:8000/health")
            wait_for("http://127.0.0.1:8080/")
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(channel="chrome", headless=True)
                page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
                errors = []
                methods = set()
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.on("request", lambda request: methods.add(request.method) if ":8000/" in request.url else None)
                docs = browser.new_page()
                # Toda dependência externa é bloqueada: Swagger deve funcionar localmente.
                docs.route("**/*", lambda route: route.continue_() if route.request.url.startswith("http://127.0.0.1:8000/") else route.abort())
                docs.goto("http://127.0.0.1:8000/docs")
                expect(docs.locator(".opblock")).to_have_count(10)
                docs.locator("#operations-Sistema-health_health_get .opblock-summary").click()
                docs.get_by_role("button", name="Try it out").click()
                docs.get_by_role("button", name="Execute", exact=True).click()
                expect(docs.locator(".live-responses-table tbody .response-col_status")).to_have_text("200")
                docs.screenshot(path=str(ARTIFACTS / "swagger.png"), full_page=True)
                docs.close()
                page.goto("http://127.0.0.1:8080/")
                expect(page.locator(".book-card")).to_have_count(6)
                expect(page.locator("#nav-count")).to_have_text("8")
                page.screenshot(path=str(ARTIFACTS / "preview-desktop.png"), full_page=True)
                page.set_viewport_size({"width": 390, "height": 844})
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
                page.screenshot(path=str(ARTIFACTS / "preview-mobile.png"), full_page=True)
                page.set_viewport_size({"width": 1440, "height": 1000})

                # POST, persistência após recarregar, edição com PATCH, notas e avaliação.
                page.locator("#add-book").click()
                page.locator("#book-title").fill("Teste de leitura <img src=x onerror=alert(1)>")
                page.locator("#book-author").fill("Autora de teste")
                page.locator("#book-pages").fill("120")
                page.locator("#save-book").click()
                expect(page.locator("#book-dialog")).not_to_be_visible()
                expect(page.locator("#nav-count")).to_have_text("9")
                page.reload()
                expect(page.locator("#nav-count")).to_have_text("9")
                page.locator("#shelf-search").fill("Teste de leitura")
                expect(page.locator(".book-card")).to_have_count(1)
                expect(page.locator(".book-card img")).to_have_count(0)
                page.locator("[data-edit]").click()
                page.locator("#book-status").select_option("lendo")
                page.locator("#book-current").fill("60")
                page.locator("#book-notes").fill("Nota preservada no SQLite.")
                page.locator("#save-book").click()
                expect(page.locator(".book-card .book-progress strong")).to_have_text("50%")
                page.locator("[data-edit]").click()
                expect(page.locator("#book-notes")).to_have_value("Nota preservada no SQLite.")
                page.locator("#book-status").select_option("concluido")
                page.locator("#book-rating").select_option("5")
                page.locator("#save-book").click()
                expect(page.locator(".book-card .status-pill")).to_have_text("Concluído")
                expect(page.locator(".book-card .book-progress strong")).to_have_text("100%")

                # DELETE só após confirmar; cancelar mantém o livro.
                page.locator("[data-delete]").click()
                page.get_by_role("button", name="Manter livro").click()
                expect(page.locator(".book-card")).to_have_count(1)
                page.locator("[data-delete]").click()
                page.locator("#confirm-delete").click()
                expect(page.locator(".book-card")).to_have_count(0)
                expect(page.locator("#nav-count")).to_have_text("8")
                page.locator("#shelf-search").fill("")
                expect(page.locator(".book-card")).to_have_count(6)

                # Filtros, ordenação e paginação interagem com a API.
                page.locator('[data-status="lendo"]').click()
                expect(page.locator(".book-card")).to_have_count(2)
                page.locator('[data-status=""]').click()
                expect(page.locator(".book-card")).to_have_count(6)
                page.get_by_role("button", name="Próxima", exact=True).click()
                expect(page.locator(".book-card")).to_have_count(2)
                page.locator("#shelf-sort").select_option("titulo")
                expect(page.locator(".book-card")).to_have_count(6)
                expect(page.locator(".book-card h3").first).to_have_text("A hora da estrela")

                # PUT para meta anual e persistência após recarregar.
                page.locator("#edit-goal").click()
                page.locator("#goal-input").fill("20")
                page.locator("#save-goal").click()
                expect(page.locator("#goal-target")).to_have_text("20")
                page.reload()
                expect(page.locator("#goal-target")).to_have_text("20")
                page.locator('[data-view="jornada"]').click()
                expect(page.locator("#view-jornada")).to_be_visible()
                expect(page.locator(".journey-highlight")).to_contain_text("20 livros")

                # Fixture explícita apenas no teste do navegador; produção sempre usa Open Library.
                def catalog_response(route):
                    route.fulfill(status=200, content_type="application/json", headers={"Access-Control-Allow-Origin": "http://127.0.0.1:8080"}, body=json.dumps({"items": [{"title": "Livro da integração", "author": "Autor externo", "source_id": "/works/OL987654W", "total_pages": 180, "first_publish_year": 2001}], "total": 1, "page": 1, "page_size": 8, "source": "Open Library"}))
                page.route("**/catalog/search?*", catalog_response)
                page.locator('[data-view="descobrir"]').click()
                page.locator("#catalog-query").fill("Livro da integração")
                page.get_by_role("button", name="Buscar livros", exact=True).click()
                expect(page.locator(".catalog-card")).to_have_count(1)
                page.locator("[data-import]").click()
                expect(page.locator("#book-title")).to_have_value("Livro da integração")
                page.locator("#save-book").click()
                expect(page.locator("#book-dialog")).not_to_be_visible()
                expect(page.locator("#nav-count")).to_have_text("9")
                page.locator("[data-import]").click()
                page.locator("#save-book").click()
                expect(page.locator("#book-form-error")).to_contain_text("já está")
                page.locator('[data-close="book-dialog"]').first.click()
                page.unroute("**/catalog/search?*", catalog_response)
                page.route("**/catalog/search?*", lambda route: route.fulfill(status=503, content_type="application/json", headers={"Access-Control-Allow-Origin": "http://127.0.0.1:8080"}, body=json.dumps({"detail": "Catálogo temporariamente indisponível."})))
                page.get_by_role("button", name="Buscar livros", exact=True).click()
                expect(page.locator("#catalog-results")).to_contain_text("O catálogo fez uma pausa")
                expect(page.locator("[data-catalog-retry]")).to_be_visible()

                # Responsividade, formulário em tela estreita, sem rolagem horizontal.
                page.locator('[data-view="estante"]').click()
                page.set_viewport_size({"width": 390, "height": 844})
                expect(page.locator(".book-card")).to_have_count(6)
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), "Overflow horizontal no celular"
                page.locator("#add-book").click()
                expect(page.locator("#book-dialog")).to_be_visible()
                assert page.locator("#book-dialog").bounding_box()["width"] <= 390
                page.keyboard.press("Escape")
                expect(page.locator("#book-dialog")).not_to_be_visible()
                assert {"GET", "POST", "PATCH", "PUT", "DELETE"} <= methods, methods
                assert not errors, errors
                browser.close()
                print("OK: Swagger offline, CRUD real, GET/POST/PATCH/PUT/DELETE, persistência, filtros, paginação, meta, importação, duplicatas, erro externo, XSS e layout móvel.")
        finally:
            for process in processes:
                process.terminate()
            for process in processes:
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()


if __name__ == "__main__":
    main()
