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

## Distribuição

1. Rodar `npm run desktop:build`.
2. Subir o `.exe` gerado em um drive interno (SharePoint, Google Drive) ou GitHub Releases.
3. Usuário baixa, executa, escolhe pasta de instalação, app aparece no menu iniciar e área de trabalho.

> **Aviso do SmartScreen**: como o instalador não é assinado digitalmente, o Windows mostrará "Windows protegeu seu PC" na primeira execução. O usuário precisa clicar em "Mais informações → Executar assim mesmo". Para eliminar o aviso, comprar um certificado de code signing.

## CORS

O backend no Render precisa aceitar requisições vindas do Electron. Quando o app está empacotado, requests saem com origin `file://` ou ausente. Confirme que o middleware CORS do backend não bloqueia esses casos.
