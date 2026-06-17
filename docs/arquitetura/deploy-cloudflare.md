# Deploy PWA no Cloudflare Pages

Este projeto usa Cloudflare Pages como hospedagem oficial do PWA.

## Objetivo

- Publicar o build estatico do Vite com HTTPS.
- Manter custo baixo, sem backend remoto.
- Fazer deploy automatico a partir do GitHub.
- Usar preview deployments para validar mudancas antes de producao.

## Configuracao no Cloudflare Pages

No painel do Cloudflare:

1. Acesse `Workers & Pages`.
2. Crie uma aplicacao do tipo `Pages`.
3. Escolha `Import from an existing Git repository`.
4. Conecte o repositorio GitHub do projeto `meu-treino`.
5. Configure:

```text
Framework preset: Vite
Build command: pnpm build
Build output directory: dist
Root directory: /
Production branch: master
```

## Variaveis de ambiente

Nenhuma variavel de ambiente e necessaria para a primeira versao.

O app deve continuar sem backend remoto, banco remoto, login, pagamentos ou cloud sync ate que o escopo seja alterado explicitamente.

## Fluxo de publicacao

1. Codex ou desenvolvedor altera o codigo.
2. Rodar checks locais relevantes:

```bash
pnpm build
```

3. Fazer commit e push para o GitHub.
4. Cloudflare Pages publica automaticamente o novo build da branch `master`.

## Preview de pull requests

Pull requests devem usar os preview deployments do Cloudflare Pages para validar:

- instalabilidade PWA;
- funcionamento offline;
- tema claro/escuro;
- layout em viewport mobile;
- importacao/download de JSON quando a funcionalidade existir.

## Dominio

Dominio inicial publicado:

```text
https://meu-treino-8gq.pages.dev/
```

Quando houver dominio proprio, configurar o dominio customizado no Cloudflare Pages e manter HTTPS ativo.
