const hostname = window.location.hostname;

let apiBaseUrl;

if (hostname.endsWith(".app.github.dev")) {
  apiBaseUrl = `${window.location.protocol}//${hostname.replace("-8080", "-8000")}`;
} else {
  apiBaseUrl = `${window.location.protocol}//${hostname}:8000`;
}

window.ENTRELINHAS_CONFIG = {
  apiBaseUrl,
};