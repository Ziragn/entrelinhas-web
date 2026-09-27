# Modelo de mensagem de entrega

**Repositórios publicados e públicos; validação Docker concluída no GitHub Codespaces.** O modelo abaixo reúne os links dos componentes, um campo para o link do vídeo e o resumo técnico do projeto.

- [x] Interface pública: [Ziragn/entrelinhas-web](https://github.com/Ziragn/entrelinhas-web).
- [x] API pública: [Ziragn/entrelinhas-api](https://github.com/Ziragn/entrelinhas-api).
- [x] Docker validado no Codespaces; `entrelinhas-api` e `entrelinhas-web` healthy.
- [x] Swagger, SQLite, Open Library, integração entre interface e API e GET, POST, PATCH, PUT e DELETE testados com sucesso.

```text
Olá, seguem os dados referentes à entrega do meu MVP Entrelinhas.

O projeto organiza leituras pessoais e utiliza o cenário 1.1:
interface web, API própria em Python/FastAPI e Open Library como API externa.
Os dados são persistidos em SQLite.

Link para o vídeo (até 6 minutos):
[URL COMPLETA DO VÍDEO PUBLICADO]

Link para o repositório público do componente principal:
https://github.com/Ziragn/entrelinhas-web

Link para o repositório público do segundo componente:
https://github.com/Ziragn/entrelinhas-api

Foi utilizada a API Open Library, documentada em:
https://openlibrary.org/dev/docs/api/search

Rota externa consumida:
https://openlibrary.org/search.json

Os READMEs contêm instalação, ambiente virtual, execução por Docker,
rotas utilizadas, condições de uso da API externa e o fluxograma da arquitetura.
O Docker Compose está na raiz do repositório entrelinhas-web.

A execução Docker foi validada no GitHub Codespaces com docker compose up -d
e docker compose ps. Os containers entrelinhas-api e entrelinhas-web ficaram
healthy, nas portas 8000 (API) e 8080 (interface). Durante os testes no Codespaces,
a porta 8000 foi definida como pública para as chamadas do navegador à API.

Foram testados Swagger em /docs, integração entre interface e API, GET, POST,
PATCH, PUT e DELETE e persistência SQLite após derrubar e recriar os containers,
mantendo o volume. A busca real por "Dom Casmurro" confirmou a integração
com a Open Library e a apresentação dos resultados na interface.
```

Antes de enviar, preencha o link do vídeo publicado, confira o acesso aos links e confirme que o vídeo não ultrapassa seis minutos e demonstra os dois componentes em Docker. A validação Docker registrada ocorreu no Codespaces; não houve validação do Docker Desktop no Windows local.
