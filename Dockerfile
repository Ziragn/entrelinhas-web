FROM nginx:1.28-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css config.js /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
COPY js /usr/share/nginx/html/js
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=4s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/
