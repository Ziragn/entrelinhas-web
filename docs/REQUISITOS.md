# Matriz de atendimento ao PDF

Referência: documento de seis páginas fornecido pelo usuário, arquivo `01c03f22-dad1-4318-96a0-eb40c5575178.pdf`.

**Cenário escolhido: 1.1.** Interface principal → API própria → API externa. As exigências alternativas para uma API principal não se aplicam, porque o módulo principal é uma interface. Ainda assim, a API implementada oferece GET, POST, PATCH, DELETE e PUT.

## Arquitetura e objetivo

| Requisito | Implementação / evidência | Estado |
| --- | --- | --- |
| Pelo menos três módulos que se comunicam | Interface Entrelinhas, API Entrelinhas, Open Library | Implementado e integração real consultada |
| Comunicação REST e/ou GraphQL | HTTP/JSON REST entre interface e API; HTTPS/JSON para Open Library | Implementado |
| Pelo menos um componente externo | Open Library é mantido pelo Internet Archive, não implementado pelo projeto | Implementado |
| Persistência SQLite/MySQL/PostgreSQL | SQLite em `app/database.py`; livros e metas persistentes | Testado, inclusive reinício da aplicação |
| Componentes próprios autônomos | `entrelinhas-web` e `entrelinhas-api`, cada um com execução e Dockerfile próprios | Implementado localmente |
| Repositório próprio para cada componente | Dois repositórios Git locais independentes | Preparados; publicação pública pendente |

## Componente principal: interface — 5,0 pontos possíveis

| Critério | Evidência | Estado |
| --- | --- | --- |
| HTML, CSS e JavaScript | `index.html`, `styles.css`, módulos `js/` | Implementado |
| Chamada GET | Lista, detalhe, estatísticas e busca externa | Testado no navegador |
| Chamada POST | Botão Adicionar livro e importação do catálogo | Testado no navegador |
| Chamada DELETE | Exclusão com diálogo de confirmação | Testado no navegador |
| Chamada PUT/PATCH | PATCH ao editar livro/progresso; PUT ao salvar meta | Ambos testados no navegador |
| README com título/descrição | `entrelinhas-web/README.md` | Entregue |
| Instalação, configuração e inicialização | README com ambiente virtual, comandos Windows e Linux/macOS | Entregue; execução Windows testada |
| README formatado | Cabeçalhos, listas, tabelas, código e imagens | Entregue |
| Imagem/fluxograma de arquitetura | `docs/arquitetura.svg`, exibido no README; versão PNG também disponível | Entregue |
| Dockerfile na raiz | `entrelinhas-web/Dockerfile` | Entregue; execução Docker pendente |
| Compose na raiz do componente principal | `entrelinhas-web/compose.yaml` | Entregue; execução Docker pendente |
| Domínio distinto dos exemplos | Organizador pessoal de leituras, sem compras, finanças ou endereços | Implementado |
| Interações/visualizações extras | Dashboard, meta circular, gráfico mensal, filtros, progresso, feedbacks e layout responsivo | Testado e capturado em imagens |

## Componente back-end — 3,0 pontos possíveis

| Critério | Evidência | Estado |
| --- | --- | --- |
| API REST/GraphQL | REST em Python/FastAPI | Implementado |
| Pelo menos quatro rotas | 10 operações em 6 caminhos funcionais: `/health`, `/books`, `/books/{book_id}`, `/catalog/search`, `/stats`, `/goal` | Implementado e verificado |
| Documentação Swagger | `/docs`, schemas, exemplos, respostas e erros; recursos servidos localmente | OpenAPI e interface Swagger verificados no Chrome sem CDN |
| README com título, descrição e instalação | `entrelinhas-api/README.md` | Entregue |
| Dockerfile na raiz | `entrelinhas-api/Dockerfile`, usuário sem privilégios, healthcheck | Entregue; execução Docker pendente |
| Funcionalidades extras além de CRUD | Filtros, ordenação, paginação, notas, avaliações, metas e agregações | Testado |

**Contagem exata:** são **10 operações HTTP em 6 caminhos funcionais**: health (1), coleção de livros (2), livro por ID (3), busca externa (1), estatísticas (1), meta (2). Há mais de quatro rotas tanto contando operações quanto caminhos. Endpoints de documentação não são usados para completar o mínimo.

## API externa — 1,0 ponto possível

| Critério | Evidência | Estado |
| --- | --- | --- |
| API pública com serviço gratuito | Open Library Search API, sem token ou cadastro | Consulta real bem-sucedida |
| Documentar licença/condições | Seção “API externa” do README principal, com fonte oficial e ressalva sobre direitos preexistentes | Entregue |
| Documentar cadastro | README informa que a consulta não exige cadastro/chave | Entregue |
| Documentar rotas utilizadas | URL `/search.json`, parâmetros e campos detalhados | Entregue |
| Consumir e tratar dados sem redirecionamento | `app/catalog.py` normaliza; interface exibe/importa resultados | Testado |

## Organização — 1,0 ponto possível

| Critério | Evidência | Estado |
| --- | --- | --- |
| Um repositório público separado no GitHub por módulo | Diretórios/repositórios locais `entrelinhas-web` e `entrelinhas-api`; guia de publicação | **Pendente: conta/conexão GitHub e publicação** |
| Estrutura clara de pastas | Rotas, schemas, banco, repositório, serviço externo, UI e cliente HTTP separados | Implementado |
| Convenções de nomes | Python em snake_case; arquivos JS separados por responsabilidade | Implementado |
| Código novo se houver base de aula | Nenhuma base de aula foi fornecida/utilizada; código criado neste projeto | Não se apoia em projeto de aula |

## Entrega e solicitação adicional do usuário

| Item | Material pronto | Estado |
| --- | --- | --- |
| Criar ambiente virtual, obrigatório pelo usuário | `.venv` já criado; instaladores usam explicitamente seu Python | **Concluído, sem instalação Python global** |
| Vídeo de no máximo seis minutos | Roteiro de **5min40s** em `ROTEIRO_VIDEO.md`, cobrindo os cinco tópicos na ordem | **Gravação/publicação pendente** |
| Mostrar API rodando via Docker e todas as rotas no Swagger | Comandos, sequência e exemplos no roteiro | **Pendente: Docker disponível e gravação** |
| Mostrar interface rodando via Docker e integração | Compose e roteiro de demonstração | **Pendente: Docker disponível e gravação** |
| Links completos para vídeo e dois repositórios | Modelo `ENTREGA.md` | **Pendente: URLs reais** |

Não se atribui uma nota prevista nem se declara atendimento integral enquanto existirem essas pendências. Arquivos Docker preparados não são evidência de containers executados; Git local não é repositório público no GitHub; roteiro não é vídeo gravado.
