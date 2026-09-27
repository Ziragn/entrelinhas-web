# Publicação dos dois componentes no GitHub

O PDF exige **dois repositórios separados e públicos**. Os repositórios locais já estão separados. Esta documentação não significa que a publicação já aconteceu.

## 1. Criar repositórios vazios

Na sua conta GitHub, crie:

- `entrelinhas-web`, visibilidade **Public**.
- `entrelinhas-api`, visibilidade **Public**.

Não inicialize com README, `.gitignore` ou licença pelo GitHub, porque os arquivos de conteúdo já existem localmente. Nunca envie `.venv`, bancos de dados ou credenciais. Os `.gitignore` entregues excluem esses itens.

O acesso à sua conta deve acontecer pelos mecanismos de autenticação do GitHub/Git Credential Manager, sem colar tokens em arquivos ou no código.

## 2. Publicar a interface

Substitua `SEU_USUARIO` pelo seu usuário real, no terminal da pasta `entrelinhas-web`:

```powershell
git status --short
git add .
git commit -m "Implementa interface Entrelinhas com integracao REST e Docker"
git remote add origin https://github.com/SEU_USUARIO/entrelinhas-web.git
git push -u origin main
```

Se `origin` já existir, confira `git remote -v` antes de alterar qualquer endereço. Não sobrescreva histórico remoto existente.

## 3. Publicar a API

Na pasta `entrelinhas-api`:

```powershell
git status --short
git add .
git commit -m "Implementa API de leituras com SQLite Swagger e Open Library"
git remote add origin https://github.com/SEU_USUARIO/entrelinhas-api.git
git push -u origin main
```

Se o Git solicitar nome/e-mail do autor, configure **localmente em cada repositório**, usando seus dados reais:

```powershell
git config user.name "SEU NOME"
git config user.email "SEU EMAIL OU EMAIL NOREPLY DO GITHUB"
```

Não foram criados commits com uma identidade inventada. Os comandos `git commit` devem usar a identidade escolhida pelo autor.

## 4. Conferir a entrega

1. Abra cada URL em janela anônima e confirme que o código está acessível.
2. Confirme o README, o Dockerfile na raiz e o Compose na raiz da interface.
3. Confirme que as imagens do fluxograma e da interface aparecem no README.
4. Em uma pasta nova, clone os dois repositórios como pastas irmãs:

   ```powershell
   git clone https://github.com/SEU_USUARIO/entrelinhas-web.git
   git clone https://github.com/SEU_USUARIO/entrelinhas-api.git
   cd entrelinhas-web
   docker compose up --build -d
   ```

5. Faça a validação descrita em `VALIDACAO.md` e grave o vídeo.
6. Preencha `ENTREGA.md` com links reais.

A pasta agregadora com `.venv` e os atalhos locais não precisa ser publicada: cada README de componente contém as instruções para uma instalação independente.
