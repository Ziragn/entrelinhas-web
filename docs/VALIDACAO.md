# Relatório de validação

Data: **25/09/2026**. Ambiente: Windows, Python **3.13.7**, ambiente virtual local `.venv`, Google Chrome existente. Pacotes de execução e testes instalados apenas nesse ambiente virtual.

## Verificado

### API — 34 testes aprovados

Comando na pasta agregadora:

```powershell
.\.venv\Scripts\python.exe -m pytest entrelinhas-api\tests -q
```

Resultado: **34 passed**. Os testes verificaram:

- Cadastro, detalhe, edição, conclusão e exclusão, com status HTTP corretos.
- Persistência de livros e metas ao criar uma nova instância da aplicação.
- Validações de texto, páginas, situação, avaliação e identificador externo.
- PATCH inválido não modifica o registro; duplicatas retornam 409.
- Busca sem acentos, filtros, ordenação, paginação e busca literal parametrizada.
- Transições de situação e preservação/remoção da data de conclusão.
- Estatísticas, meta anual, estado vazio, healthcheck e dados de demonstração idempotentes.
- CORS e operações descritas no OpenAPI/Swagger.
- Normalização e cache da API externa; falhas de rede, HTTP 429 e respostas inválidas retornam 503.

O runner apresentou um aviso de depreciação do adaptador `httpx` do TestClient na versão instalada do Starlette. Os testes passam; o aviso se refere ao cliente de testes, sem impedir a aplicação.

### Navegador — fluxos aprovados

Comando:

```powershell
.\.venv\Scripts\python.exe entrelinhas-web\tests\browser_check.py
```

O teste iniciou servidores reais com banco temporário, abriu o **Chrome em modo headless** e confirmou:

- GET, POST, PATCH, PUT e DELETE enviados pela interface.
- Cadastro, edição de progresso/notas, conclusão e avaliação.
- Persistência após recarregar a página.
- Cancelamento e confirmação da exclusão.
- Filtros, ordenação e paginação.
- Edição persistente da meta e visualização de jornada.
- Importação do catálogo e mensagem de duplicidade.
- Mensagem e botão de nova tentativa em falha do catálogo.
- Título com marcação HTML exibido como texto, sem inserção de imagem/script.
- Layout de 390 px sem rolagem horizontal; diálogo móvel e fechamento com Escape.
- Ausência de exceções JavaScript não tratadas.
- Swagger com as 10 operações carregadas e execução real de `GET /health` pelo botão “Try it out”, mesmo bloqueando todos os endereços externos no navegador. Os recursos oficiais do Swagger UI 5.33.0 são servidos pela própria API, com licença original incluída.

**Delimitação:** a rota de catálogo foi interceptada com respostas explícitas somente no teste do navegador para tornar seus estados repetíveis. O código de produção nunca utiliza essa fixture. A integração externa real foi validada separadamente abaixo.

Imagens: [desktop](preview-desktop.png) e [celular](preview-mobile.png). As capas são arte CSS decorativa; não são capas originais dos livros.

Evidência adicional: [Swagger local](swagger.png). O inicializador `iniciar.py --demo --no-browser` também foi executado: iniciou os dois serviços nas portas 8000/8080 e detectou sua disponibilidade. Os processos de validação foram encerrados ao final.

### Integração externa real — aprovada

Foi executado o cliente real `CatalogClient.search('Machado de Assis', 1, 2)`, fazendo uma requisição HTTPS a `https://openlibrary.org/search.json`.

Resposta recebida em 25/09/2026: **1.401 resultados totais**, com dois itens normalizados: **Dom Casmurro** (`/works/OL1003040W`) e **Memórias póstumas de Brás Cubas** (`/works/OL1003017W`). Esse resultado confirma uma consulta real, sem mock. Quantidade, páginas e metadados são do provedor e podem mudar.

### Sintaxe JavaScript — aprovada

Os três módulos `app.js`, `ui.js` e `api.js` passaram em `node --check`, usando o Node já existente somente como ferramenta de verificação. Node não é necessário para executar o projeto e nenhum pacote npm foi instalado.

## Ainda não verificado / não realizado

| Item | Motivo |
| --- | --- |
| Build e execução dos containers | Docker não está instalado no ambiente disponível |
| Persistência real em volume Docker e healthchecks de containers | Depende de executar o Compose |
| Publicação dos dois repositórios no GitHub | Precisa da conta/conexão e da publicação |
| Gravação e publicação do vídeo de até 6 minutos | Depende da demonstração em Docker e gravação |

Não há alegação de que as etapas acima tenham passado. Os arquivos e o roteiro necessários estão preparados.

## Procedimento para completar a validação Docker

Use uma máquina com Docker instalado. Na raiz `entrelinhas-web`:

```powershell
docker compose config
docker compose up --build -d
docker compose ps
```

1. Confira **api** e **web** como `healthy`.
2. Abra `http://localhost:8080` e `http://localhost:8000/docs`.
3. Execute todas as operações da API conforme `ROTEIRO_VIDEO.md`.
4. Cadastre um livro chamado **Teste de persistência Docker**, com 100 páginas.
5. Execute `docker compose down`, depois `docker compose up -d`.
6. Reabra a interface e confirme que o livro permanece. Não use `-v`, que remove o volume.
7. Em “Descobrir livros”, consulte “Machado de Assis”, importe, edite, marque como concluído e depois exclua apenas esse registro de teste.
8. Salve uma meta anual, recarregue e confira sua persistência.
9. Use `docker compose logs --no-color` se houver falhas; confirme que não há erros de permissão no volume nem de CORS.
10. Registre data e resultados reais; só então marque Docker como validado na matriz.

Para reproduzir os testes locais, consulte o README principal. O banco de testes é temporário e separado do banco pessoal.
