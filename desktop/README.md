# Sistema de Inovações — App Desktop (Windows)

Wrapper Electron do frontend já existente. Aponta para o backend deployado no Render.

## Pré-requisitos

- Node.js 18+
- Windows 10/11 (para gerar o instalador `.exe`)

## Setup inicial

```bash
# Na raiz do repositório
npm run install:desktop
```

## Rodar em modo desenvolvimento

Abre o app Electron carregando o Vite (hot-reload do frontend funciona normalmente):

```bash
# Na raiz do repositório
npm run desktop:dev
```

> Isso sobe o Vite em `localhost:5173` e o Electron em paralelo. O backend NÃO sobe — use `npm run dev:backend` em outro terminal se quiser bater no Express local. Por padrão, em dev o frontend usa o proxy `/api` → `localhost:3333`.

## Gerar instalador `.exe` para distribuição

Antes de buildar, garanta que existe um arquivo `frontend/.env.production` com a URL do backend no Render:

```env
VITE_API_URL=https://SEU-APP.onrender.com/api
```

Depois:

```bash
# Na raiz do repositório
npm run desktop:build
```

O instalador será gerado em [desktop/dist/](dist/) com nome `Sistema-Inovacoes-Setup-1.0.0.exe`.

## Ícone

Coloque um arquivo `icon.ico` (256×256, multi-resolução) em `desktop/build/icon.ico`. Pode ser gerado a partir de [frontend/public/images/logo.png](../frontend/public/images/logo.png) usando ferramentas como [convertio.co](https://convertio.co/png-ico/) ou ImageMagick:

```bash
magick frontend/public/images/logo.png -define icon:auto-resize=256,128,64,48,32,16 desktop/build/icon.ico
```

Se não fornecido, o electron-builder usa um ícone padrão.

## Distribuição (primeira instalação)

1. Rodar `npm run desktop:build`.
2. Subir o `.exe` gerado em um drive interno (SharePoint, Google Drive) ou GitHub Releases.
3. Usuário baixa, executa, escolhe pasta de instalação, app aparece no menu iniciar e área de trabalho.

> **Aviso do SmartScreen**: como o instalador não é assinado digitalmente, o Windows mostrará "Windows protegeu seu PC" na primeira execução. O usuário precisa clicar em "Mais informações → Executar assim mesmo". Para eliminar o aviso, comprar um certificado de code signing.

## Auto-update (atualizações automáticas)

Depois que o app já está instalado, novas versões chegam automaticamente via GitHub Releases. **Os usuários não precisam baixar nem reinstalar nada.**

### Como funciona

- Toda vez que o app abre (e a cada 1h depois), ele verifica o GitHub por uma versão mais recente.
- Se houver, baixa em background.
- Quando termina, mostra um diálogo: "Reiniciar agora" ou "Depois". Se "Depois", a atualização aplica sozinha quando o usuário fechar o app.

### Como publicar uma nova versão

1. **Bumpar a versão** em [desktop/package.json](package.json) (ex: `"version": "1.0.0"` → `"1.0.1"`).
2. **Gerar um GitHub Personal Access Token** (uma vez só):
   - https://github.com/settings/tokens → "Generate new token (classic)"
   - Escopo necessário: `repo` (acesso ao repositório privado)
   - Copia o token
3. **Setar como variável de ambiente** (na sua máquina):
   ```powershell
   $env:GH_TOKEN = "ghp_seu_token_aqui"
   ```
   (em PowerShell, é só nessa sessão; para permanente, use `setx GH_TOKEN "..."` e reabra o terminal)
4. **Rodar o release**:
   ```bash
   npm run build --prefix frontend
   npm run release --prefix desktop
   ```
   Isso builda o `.exe` E publica como Release no GitHub junto com o `latest.yml` (arquivo que o auto-updater lê).
5. **Pronto.** Próxima vez que cada colega abrir o app, ele detecta e atualiza sozinho.

### Token GitHub embutido (repo privado)

O app está configurado para baixar releases do repo privado usando um token embutido no binário. Você precisa fazer isso **uma vez**:

1. **Gerar um Fine-grained Personal Access Token**:
   - https://github.com/settings/tokens?type=beta → "Generate new token"
   - **Resource owner**: `Top-Construtora`
   - **Repository access**: "Only select repositories" → `sistema-departamento-inovacoes`
   - **Permissions**:
     - Contents: **Read-only**
     - Metadata: **Read-only** (automático)
   - Expiração: 1 ano (anote no calendário pra renovar)
   - Copia o token (começa com `github_pat_...`)

2. **Criar `desktop/update-config.json`** (esse arquivo é gitignored, nunca vai pro repo):
   ```json
   {
     "githubToken": "github_pat_SEU_TOKEN_AQUI"
   }
   ```
   Use [update-config.example.json](update-config.example.json) como base.

3. **Builds futuros incluem o token automaticamente** — o `electron-builder` empacota o `update-config.json` dentro do `.exe`. Os colegas instalam normalmente e o auto-update começa a funcionar.

> ⚠️ **Importante**: o token fica embutido no binário e é extraível por alguém que descompacte o `.exe`. Por isso o token deve ser:
> - **Read-only** (não pode escrever)
> - **Escopo restrito a esse único repo**
> - Renovado periodicamente
>
> Em uso interno na Top Construtora isso é aceitável. Se algum dia distribuir o app externamente, migre pra opção do repo público de releases.

## CORS

O backend no Render precisa aceitar requisições vindas do Electron. Quando o app está empacotado, requests saem com origin `file://` ou ausente. Confirme que o middleware CORS do backend não bloqueia esses casos.
