# Matriz de atendimento ao PDF

Referência: documento de seis páginas fornecido pelo usuário, arquivo `01c03f22-dad1-4318-96a0-eb40c5575178.pdf`.

**Cenário escolhido: 1.1.** Interface principal → API própria → API externa. As exigências alternativas para uma API principal não se aplicam, porque o módulo principal é uma interface. Ainda assim, a API implementada oferece GET, POST, PATCH, DELETE e PUT.

## Arquitetura e objetivo

| Requisito | Implementação / evidência | Estado |
| --- | --- | --- |
| Pelo menos três módulos que se comunicam | Interface Entrelinhas → API Entrelinhas → Open Library; busca real por “Dom Casmurro” apresentada na interface | **ATENDIDO — integração completa validada no Codespaces** |
| Comunicação REST e/ou GraphQL | HTTP/JSON REST entre interface e API; HTTPS/JSON para Open Library | **ATENDIDO** |
| Pelo menos um componente externo | Open Library é mantido pelo Internet Archive, não implementado pelo projeto | **ATENDIDO** |
| Persistência SQLite/MySQL/PostgreSQL | SQLite em `app/database.py`; livros e metas persistentes; volume Docker mantém os dados após derrubar e recriar os containers | **ATENDIDO — persistência local e Docker testada** |
| Componentes próprios autônomos | `entrelinhas-web` e `entrelinhas-api`, cada um com execução e Dockerfile próprios | **ATENDIDO — ambos healthy no Codespaces** |
| Repositório próprio para cada componente | [entrelinhas-web](https://github.com/Ziragn/entrelinhas-web) e [entrelinhas-api](https://github.com/Ziragn/entrelinhas-api) | **CONCLUÍDO — publicados e públicos** |

## Componente principal: interface — 5,0 pontos possíveis

| Critério | Evidência | Estado |
| --- | --- | --- |
| HTML, CSS e JavaScript | `index.html`, `styles.css`, módulos `js/` | **ATENDIDO** |
| Chamada GET | Lista, detalhe, estatísticas e busca externa | **ATENDIDO — método testado pela interface, inclusive em Docker** |
| Chamada POST | Botão Adicionar livro e importação do catálogo | **ATENDIDO — cadastro testado pela interface, inclusive em Docker** |
| Chamada DELETE | Exclusão com diálogo de confirmação | **ATENDIDO — método testado pela interface, inclusive em Docker** |
| Chamada PUT/PATCH | PATCH ao editar livro/progresso; PUT ao salvar meta | **ATENDIDO — ambos testados pela interface, inclusive em Docker** |
| README com título/descrição | `entrelinhas-web/README.md` | **ATENDIDO** |
| Instalação, configuração e inicialização | README com ambiente virtual, comandos Windows e Linux/macOS | **ATENDIDO — execução local Windows testada** |
| README formatado | Cabeçalhos, listas, tabelas, código e imagens | **ATENDIDO** |
| Imagem/fluxograma de arquitetura | `docs/arquitetura.svg`, exibido no README; versão PNG também disponível | **ATENDIDO** |
| Dockerfile na raiz | `entrelinhas-web/Dockerfile` | **ATENDIDO — container healthy no Codespaces** |
| Compose na raiz do componente principal | `entrelinhas-web/compose.yaml`; `docker compose up -d` e `docker compose ps` | **ATENDIDO — execução validada no Codespaces** |
| Domínio distinto dos exemplos | Organizador pessoal de leituras, sem compras, finanças ou endereços | **ATENDIDO** |
| Interações/visualizações extras | Dashboard, meta circular, gráfico mensal, filtros, progresso, feedbacks e layout responsivo | **ATENDIDO — testado e capturado em imagens** |

## Componente back-end — 3,0 pontos possíveis

| Critério | Evidência | Estado |
| --- | --- | --- |
| API REST/GraphQL | REST em Python/FastAPI | **ATENDIDO** |
| Pelo menos quatro rotas | 10 operações em 6 caminhos funcionais: `/health`, `/books`, `/books/{book_id}`, `/catalog/search`, `/stats`, `/goal` | **ATENDIDO — implementado e verificado** |
| Documentação Swagger | `/docs`, schemas, exemplos, respostas e erros; recursos servidos localmente | **ATENDIDO — OpenAPI e Swagger verificados no Chrome sem CDN; Swagger também testado no Codespaces** |
| README com título, descrição e instalação | `entrelinhas-api/README.md` | **ATENDIDO** |
| Dockerfile na raiz | `entrelinhas-api/Dockerfile`, usuário sem privilégios, healthcheck | **ATENDIDO — container healthy no Codespaces** |
| Funcionalidades extras além de CRUD | Filtros, ordenação, paginação, notas, avaliações, metas e agregações | **ATENDIDO — testado** |

**Contagem exata:** são **10 operações HTTP em 6 caminhos funcionais**: health (1), coleção de livros (2), livro por ID (3), busca externa (1), estatísticas (1), meta (2). Há mais de quatro rotas tanto contando operações quanto caminhos. Endpoints de documentação não são usados para completar o mínimo.

## API externa — 1,0 ponto possível

| Critério | Evidência | Estado |
| --- | --- | --- |
| API pública com serviço gratuito | Open Library Search API, sem token ou cadastro | **ATENDIDO — consulta real bem-sucedida, inclusive por “Dom Casmurro” no Codespaces** |
| Documentar licença/condições | Seção “API externa” do README principal, com fonte oficial e ressalva sobre direitos preexistentes | **ATENDIDO** |
| Documentar cadastro | README informa que a consulta não exige cadastro/chave | **ATENDIDO** |
| Documentar rotas utilizadas | URL `/search.json`, parâmetros e campos detalhados | **ATENDIDO** |
| Consumir e tratar dados sem redirecionamento | `app/catalog.py` normaliza; interface exibe/importa resultados | **ATENDIDO — integração testada** |

## Organização — 1,0 ponto possível

| Critério | Evidência | Estado |
| --- | --- | --- |
| Um repositório público separado no GitHub por módulo | [Ziragn/entrelinhas-web](https://github.com/Ziragn/entrelinhas-web) e [Ziragn/entrelinhas-api](https://github.com/Ziragn/entrelinhas-api) | **CONCLUÍDO — publicados e públicos** |
| Estrutura clara de pastas | Rotas, schemas, banco, repositório, serviço externo, UI e cliente HTTP separados | **ATENDIDO** |
| Convenções de nomes | Python em snake_case; arquivos JS separados por responsabilidade | **ATENDIDO** |
| Código novo se houver base de aula | Nenhuma base de aula foi fornecida/utilizada; código criado neste projeto | Não se apoia em projeto de aula |

## Materiais de entrega e ambiente local

| Item | Referência / descrição |
| --- | --- |
| Ambiente virtual | `.venv` criado; instaladores usam explicitamente seu Python, sem instalação Python global |
| Vídeo de no máximo seis minutos | Roteiro de **5min40s** em [ROTEIRO_VIDEO.md](ROTEIRO_VIDEO.md), cobrindo os cinco tópicos na ordem |
| Demonstração da API via Docker e das rotas no Swagger | API healthy e Swagger testado no Codespaces; sequência de demonstração das rotas no roteiro |
| Demonstração da interface via Docker e da integração | Interface healthy e integração completa validada no Codespaces; sequência de demonstração no roteiro |
| Links dos dois repositórios públicos | URLs de `Ziragn/entrelinhas-web` e `Ziragn/entrelinhas-api` em [ENTREGA.md](ENTREGA.md) |
| Link do vídeo | Campo específico no modelo de mensagem em [ENTREGA.md](ENTREGA.md) |

A validação Docker ocorreu no **GitHub Codespaces**, com API na porta **8000** e interface na **8080**. A porta **8000 foi definida como pública durante os testes** para permitir chamadas do navegador à API. Os containers `entrelinhas-api` e `entrelinhas-web` ficaram **healthy**. Esse registro não corresponde a uma validação do Docker Desktop no Windows local. Os resultados estão em [VALIDACAO.md](VALIDACAO.md).
