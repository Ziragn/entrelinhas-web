# Roteiro da apresentação · 5 minutos e 40 segundos

O PDF exige **um vídeo de até 6 minutos**, com os cinco tópicos abaixo, nessa ordem. Esta é uma preparação para gravação; nenhum vídeo foi gravado ou publicado automaticamente.

## Preparação antes de gravar

1. Tenha Docker em funcionamento e conclua a [validação dos containers](VALIDACAO.md).
2. Mantenha os dois repositórios como pastas irmãs e execute na pasta `entrelinhas-web`:

   ```powershell
   docker compose up --build -d
   docker compose exec api python -m app.seed
   docker compose ps
   ```

3. Abra três abas: interface `http://localhost:8080`, Swagger `http://localhost:8000/docs` e a imagem `docs/arquitetura.svg`.
4. Deixe o terminal com `docker compose ps` mostrando os dois serviços em execução e saudáveis. Só afirme que estão em Docker se estiverem realmente.
5. Deixe o JSON abaixo pronto para copiar. No Swagger, use um livro exclusivo chamado “Leitura para apresentação”, para evitar duplicatas dos exemplos.
6. Prepare uma consulta externa, como `Machado de Assis`, e confirme antes que a rede/provedor responde.
7. Grave a tela com narração e cronômetro. No Windows, pode usar uma ferramenta de captura de tela/vídeo já disponível. Faça um ensaio e mantenha a duração final abaixo de 6:00.

## 1. Objetivo — 00:00 a 00:50 (50 s)

**Tela:** início da interface.

**Fala sugerida:**

“O Entrelinhas resolve a dificuldade de organizar livros que queremos ler e acompanhar as leituras que já começamos. Em uma estante pessoal, podemos guardar livros, acompanhar páginas, registrar notas e avaliações e definir uma meta anual. Também podemos descobrir livros de um catálogo externo e trazê-los para a mesma aplicação.”

Mostre a estante, os indicadores e a meta.

## 2. Arquitetura e comunicação — 00:50 a 01:40 (50 s)

**Tela:** imagem `arquitetura.svg`.

**Fala sugerida:**

“Escolhi o cenário 1.1: interface, API própria e API externa. A interface usa HTML, CSS e JavaScript e faz chamadas REST com JSON para uma API Python em FastAPI. A API guarda livros e metas no SQLite e consulta o Open Library por HTTPS. Os componentes próprios têm repositórios e Dockerfiles separados. O Compose fica na raiz da interface, e o banco é preservado em um volume.”

Aponte os três componentes, as setas e o banco.

## 3. API externa — 01:40 a 02:30 (50 s)

**Tela:** seção da API externa no README e, depois, “Descobrir livros”.

**Fala sugerida:**

“O catálogo vem da Search API do Open Library, que permite a consulta pública gratuita sem chave. Utilizo a rota search.json para obter título, autoria, identificador e páginas quando disponíveis. As condições de uso e o licenciamento estão documentados. A API trata a resposta, limita chamadas e usa cache. Os dados aparecem aqui dentro, sem redirecionamento.”

Busque “Machado de Assis” e mostre um resultado. Aponte que as páginas podem variar por edição.

## 4. Segunda componente: API via Docker/Swagger — 02:30 a 04:00 (90 s)

**Tela:** terminal com `docker compose ps`, depois Swagger.

Narre que a API está em um container e que o Swagger é gerado a partir dos contratos. **Execute todas as 10 operações**:

| Ordem | Operação | Entrada / observação |
| --- | --- | --- |
| 1 | `GET /health` | Retorna API/banco disponíveis |
| 2 | `POST /books` | Cole o JSON abaixo; anote o `id` criado |
| 3 | `GET /books` | Filtre `q=Leitura para apresentação` |
| 4 | `GET /books/{book_id}` | Use o ID retornado |
| 5 | `PATCH /books/{book_id}` | `{"status":"lendo","current_page":50}` |
| 6 | `GET /catalog/search` | `q=Machado de Assis`, `page=1`, `page_size=8` |
| 7 | `GET /stats` | Mostre contadores e histórico |
| 8 | `GET /goal` | Mostre meta anual atual |
| 9 | `PUT /goal` | `{"target":15}` |
| 10 | `DELETE /books/{book_id}` | Exclua só o registro criado nesta sequência; resposta 204 |

```json
{
  "title": "Leitura para apresentação",
  "author": "Autor de demonstração",
  "total_pages": 200,
  "current_page": 0,
  "status": "quero_ler",
  "genre": "Literatura",
  "rating": 0,
  "notes": "Registro temporário para demonstrar o CRUD",
  "source_id": null
}
```

Para caber em 90 segundos, deixe as seções abertas e os formulários preparados no ensaio. Mostre a resposta de cada execução. `/docs`, `/redoc` e `/openapi.json` são ferramentas de documentação, não rotas de negócio extras a demonstrar.

## 5. Componente principal: interface via Docker — 04:00 a 05:30 (90 s)

Reserve os últimos **10 segundos** para encerrar, totalizando **5min40s**, com margem de 20 segundos até o limite obrigatório. Os cinco blocos respeitam as faixas de tempo sugeridas no PDF.

**Tela:** interface e, se útil, aba Network das ferramentas do navegador.

1. **GET:** abra a estante, filtre “Lendo”, busque um autor e mude a ordenação. Explique que a lista vem da API.
2. **POST:** em “Descobrir livros”, importe um resultado. Confirme título/páginas e salve. Explique a criação no SQLite.
3. **PATCH:** abra o livro importado, mude para “Lendo”, informe uma página e registre uma nota. Mostre a barra atualizada.
4. **PATCH / visualização:** marque a conclusão e dê uma avaliação. Mostre o indicador de concluídos e a meta.
5. **PUT:** ajuste a meta anual e abra “Minha jornada” para mostrar o gráfico.
6. **Persistência:** recarregue a página e mostre que o registro permanece.
7. **DELETE:** exclua o livro de demonstração pela confirmação. Mostre que a lista e os indicadores atualizam.

Finalize mostrando os dois repositórios públicos e informando onde encontrar os READMEs, os Dockerfiles e o fluxograma. Não exponha credenciais, tokens ou abas pessoais.

## Conferência final

- Duração final ≤ 6:00, com áudio compreensível.
- Cinco tópicos presentes, na ordem do enunciado.
- Os dois componentes realmente executados via Docker.
- Todas as operações da API demonstradas no Swagger.
- Interface demonstrando chamadas aos demais componentes.
- Repositórios separados e públicos.
- Link de vídeo acessível ao avaliador, sem exigência de autorização individual.
- Mensagem de entrega com URLs completas, seguindo `ENTREGA.md`.
