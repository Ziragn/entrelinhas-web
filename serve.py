"""Servidor estático local, sem dependências. Não expõe .git ou documentos."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent


class StaticHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".svg": "image/svg+xml"}

    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        allowed = path in ("/", "/index.html", "/styles.css", "/config.js") or path.startswith(("/assets/", "/js/"))
        segments = Path(path).parts
        if not allowed or ".." in segments or any(part.startswith(".") for part in segments):
            self.send_error(404)
            return
        return super().do_GET()

    def do_HEAD(self):
        # Mesma restrição do GET, sem deixar HEAD expor arquivos internos.
        path = unquote(urlsplit(self.path).path)
        allowed = path in ("/", "/index.html", "/styles.css", "/config.js") or path.startswith(("/assets/", "/js/"))
        if not allowed or ".." in Path(path).parts or any(part.startswith(".") for part in Path(path).parts):
            self.send_error(404)
            return
        return super().do_HEAD()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), partial(StaticHandler, directory=str(ROOT)))
    print(f"Entrelinhas: http://{args.host}:{args.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
