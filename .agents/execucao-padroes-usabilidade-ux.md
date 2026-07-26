# Execução — padrões de usabilidade e UX

## Objetivo

Padronizar a experiência mobile do `meu-treino`: estrutura de tela, navegação,
feedback de ações, superfícies e cores. Corrigir o espaço inferior em UX-0003
e UX-0009 e adequar UX-0006 aos diálogos de confirmação.

## Critério de pronto

- As telas principais usam header global, `PageHeader`, conteúdo em coluna e
  navegação inferior consistentes.
- UX-0003 e UX-0009 usam header contextual compartilhado, sem espaço vazio
  criado por altura mínima duplicada, e mantêm o footer contextual seguro.
- Backup, restauração, limpeza local, cópia do prompt e importação usam
  diálogos claros para retorno ou confirmação.
- Os componentes usam tokens Material 3 e passam por build, lint, testes e
  verificação visual mobile.

## Execução 1 — contrato visual e primitivas

Status: concluída nesta alteração.

- [x] Registrar os padrões duráveis em `docs/arquitetura/identidade-visual.md`.
- [x] Criar `PageHeader` para telas principais.
- [x] Criar `ConfirmationDialog` com estados informativo, sucesso, atenção e
  destrutivo, foco seguro e ações explícitas.
- [x] Ajustar o diálogo base para área segura, toque mobile e rolagem interna.

## Execução 2 — shell, navegação e telas principais

Status: concluída nesta alteração.

- [x] Aplicar `PageHeader` em Início, Treino, Histórico e Ajustes.
- [x] Tornar a barra superior global comum a telas principais e telas de fluxo
  que não tenham barra contextual própria.
- [x] Alinhar cards de rotina e histórico a superfícies, bordas e foco visível
  dos tokens Material 3.
- [x] Reduzir o padding do shell em telas sem navegação inferior.

## Execução 3 — fluxos de tarefa e feedback

Status: concluída nesta alteração.

- [x] Migrar UX-0003 e UX-0009 para `TopAppBar` contextual compartilhada.
- [x] Remover `min-h-screen` interno de UX-0003 e UX-0009 e corrigir o rodapé
  contextual da lista de exercícios.
- [x] Converter UX-0006: confirmar restauração e limpeza em popup; apresentar
  sucesso/falha de backup em popup; manter o conteúdo limpo após fechar.
- [x] Converter confirmação da importação e retorno de cópia de prompt para o
  mesmo padrão.
- [x] Mostrar erros operacionais da execução de treino em popup global.

## Execução 4 — verificação e ajustes finais

Status: concluída nesta alteração.

- [x] `pnpm build`.
- [x] `pnpm lint`.
- [x] `pnpm test`.
- [x] `pnpm visual:check`, com inspeção das capturas mobile de UX-0003,
  UX-0006 e UX-0009.
- [x] Revisar o diff, criar commit e enviar ao remoto.

## Roteiro manual mobile

1. Abra Início, Treino, Histórico e Ajustes; confirme o mesmo header global,
   `PageHeader`, margens e barra inferior.
2. Em Ajustes, escolha Restaurar backup, cancele e confirme que nada muda;
   escolha novamente e confirme a ação. Faça o mesmo para Apagar dados.
3. Importe um JSON e confirme que a troca do plano só ocorre após o popup.
4. Inicie uma rotina, abra UX-0003 e UX-0009 e role até o fim: não deve haver
   faixa vazia grande entre o conteúdo e o código da tela.
5. Marque séries, registre o exercício e confirme que os próximos passos e
   qualquer erro aparecem em diálogos com ação clara.
