# Plano - Material 3 com React proprio e Tailwind

## Objetivo

Migrar a interface do `meu-treino` para um layout fiel ao Material Design 3,
mantendo React, Vite, TypeScript e Tailwind como base da aplicacao.

A implementacao deve usar componentes React proprios, orientados por tokens
Material 3, em vez de adotar `@material/web` como fundacao principal. Isso
preserva a ergonomia nativa do React para estado, refs, eventos, formularios
controlados, tipagem e composicao, especialmente na tela de treino ativo.

## Decisao tecnica

- Material Design 3 passa a ser o sistema visual canonico da UI.
- Tailwind continua sendo a camada de estilos utilitarios e responsividade.
- `src/theme` deve expor tokens Material 3 por variaveis CSS.
- `src/components/ui` deve conter primitivos React proprios alinhados a Material 3.
- `lucide-react` continua permitido para icones internos, ate decisao explicita
  de trocar para Material Symbols.
- Nao adicionar `@material/web`, MUI ou outra biblioteca visual de producao sem
  uma etapa separada de avaliacao e aprovacao.
- Os tokens antigos podem permanecer como aliases durante a migracao para evitar
  uma reescrita total em um unico passo.

## Estrategia de branch e validacao

- Executar as alteracoes de implementacao Material 3 em uma branch separada da
  `master`, criada a partir da `master` atualizada.
- Nome sugerido da branch: `ui/material-3-react-tailwind`.
- Nao implementar as fases deste plano diretamente na `master`.
- Dividir a migracao em commits pequenos e revisaveis dentro dessa branch.
- Pushar a branch para o remoto para validacao visual e funcional antes de
  qualquer merge na `master`.
- So levar as alteracoes para a `master` depois de validacao explicita do usuario.
- Alteracoes documentais pequenas podem ser registradas na `master` quando forem
  necessarias para orientar execucoes futuras, mas mudancas de UI/codigo da
  migracao devem seguir pela branch separada.

## Fora do escopo

- Alterar dominio, servicos, storage, importacao JSON, PWA, Capacitor ou regras
  de treino.
- Adicionar backend, login, cloud sync ou dependencia remota de fontes/imagens.
- Migrar para Ionic Framework.
- Recriar assets de marca ja existentes em `assets/identity`.

## Contexto a carregar antes de executar

- `AGENTS.md`
- `docs/arquitetura/arquitetura-prompt.md`
- `docs/arquitetura/identidade-visual-opcoes.md`
- `src/theme/tokens.css`
- `tailwind.config.ts`
- `src/app/styles.css`
- `src/components/ui/button.tsx`
- `src/components/ModalDialog.tsx`
- `src/components/Notice.tsx`
- `src/features/navigation/AppShell.tsx`
- `src/features/home/HomeScreen.tsx`
- `src/features/workouts/ActiveWorkoutScreen.tsx`

## Fase 1 - Contrato visual e tokens

Status: concluida em `ui/material-3-react-tailwind`.

Done when:

- `src/theme/tokens.css` define roles Material 3 para tema claro e escuro:
  `primary`, `on-primary`, `primary-container`, `on-primary-container`,
  `secondary`, `surface`, `surface-container*`, `on-surface`, `outline`,
  `outline-variant`, `error`, `on-error`, `scrim` e roles necessarias.
- Tokens de shape, typografia, elevacao e state layer estao definidos por CSS
  variables.
- Tokens antigos como `--background`, `--card`, `--primary`, `--border` e
  `--muted` continuam funcionando como aliases temporarios.
- `tailwind.config.ts` expoe nomes Material 3 sem remover imediatamente os nomes
  legados usados pelas telas atuais.
- `pnpm build` e `pnpm lint` passam.

Arquivos provaveis:

- `src/theme/tokens.css`
- `tailwind.config.ts`
- `src/app/styles.css`
- `src/theme/theme.tsx`

## Fase 2 - Primitivos Material 3 em React

Status: concluida em `ui/material-3-react-tailwind`.

Done when:

- `Button` suporta variantes Material 3: `filled`, `tonal`, `outlined`,
  `text`, `elevated` e `icon`.
- Existem primitivos reutilizaveis para `Card`, `NavigationBar`, `TopAppBar`,
  `Dialog`, `TextField`, `Switch`, `SegmentedButton`, `LinearProgress` e
  `Chip`.
- Componentes mantem acessibilidade basica: foco visivel, labels, roles quando
  necessario, alvos de toque grandes e estados disabled.
- Componentes usam tokens Material 3, nao cores fixas espalhadas.
- `pnpm build` e `pnpm lint` passam.

Arquivos provaveis:

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/navigation-bar.tsx`
- `src/components/ui/top-app-bar.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/text-field.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/segmented-button.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/chip.tsx`
- `src/components/ModalDialog.tsx`
- `src/components/Notice.tsx`

## Fase 3 - Shell, navegacao e estrutura global

Status: concluida em `ui/material-3-react-tailwind`.

Done when:

- `AppShell` usa top app bar e bottom navigation alinhados a Material 3.
- O item ativo da navegacao usa indicador tipo pill, com label e icone legiveis.
- O layout mobile continua com largura util, area segura inferior e sem overlap.
- A primeira tela continua util e focada no proximo treino recomendado.
- Verificacao visual mobile confirma que a navegacao nao cobre conteudo.

Arquivos provaveis:

- `src/features/navigation/AppShell.tsx`
- `src/features/navigation/appNavigation.ts`
- `src/components/ScreenIdentifier.tsx`
- `tests/visual/home-mobile.spec.ts`

## Fase 4 - Home e telas de apoio

Done when:

- Home usa cards Material 3 para plano ativo, proximo treino, progresso e atalhos.
- Importacao, preview, erro, historico e ajustes usam os novos primitivos.
- Tema claro e escuro continuam selecionaveis, salvos localmente e aplicados sem
  reinicio.
- As telas nao dependem mais de classes ad hoc repetidas para cards e secoes
  comuns.
- `pnpm build`, `pnpm lint` e teste visual mobile passam.

Arquivos provaveis:

- `src/features/home/HomeScreen.tsx`
- `src/features/import-export/ImportPreviewScreen.tsx`
- `src/features/import-export/ImportErrorScreen.tsx`
- `src/features/import-export/PromptCopyButton.tsx`
- `src/features/progress/ProgressScreen.tsx`
- `src/features/progress/LoadHistoryPanel.tsx`
- `src/features/settings/SettingsScreen.tsx`
- `src/features/settings/ThemeSegmentedControl.tsx`
- `src/features/settings/HealthConnectSettingsCard.tsx`

## Fase 5 - Treino ativo

Done when:

- Tela de treino ativo segue Material 3 sem perder velocidade de uso durante a
  academia.
- Lista de exercicios, card expandido, timer, marcacao de series e sheet de
  registro final continuam funcionando.
- Campos de carga e reps seguem padrao Material 3, mas continuam grandes e
  rapidos para toque.
- O bloco final de entrada continua com carga e reps somente, sem RIR visivel.
- Fluxo manual mobile: iniciar treino, marcar series, registrar carga/reps,
  alternar exercicios e finalizar treino.

Arquivos provaveis:

- `src/features/workouts/ActiveWorkoutScreen.tsx`
- `src/features/workouts/RoutineListScreen.tsx`
- `src/features/workouts/RoutineMetrics.tsx`
- `src/features/workouts/WorkoutFinishedScreen.tsx`

## Fase 6 - Limpeza e remocao de legado

Done when:

- Classes e tokens legados nao usados sao removidos.
- Documentacao reflete Material 3 como contrato visual vigente.
- Nao ha dependencia shadcn/ui como decisao arquitetural ativa.
- `pnpm build`, `pnpm lint`, testes unitarios relevantes e teste visual mobile
  passam.
- A mudanca esta dividida em commits pequenos e revisaveis.

Arquivos provaveis:

- `AGENTS.md`
- `docs/arquitetura/arquitetura-prompt.md`
- `docs/arquitetura/identidade-visual-opcoes.md`
- `src/theme/tokens.css`
- `tailwind.config.ts`

## Criterios gerais de aceite

- O app continua mobile-first, offline-first e 100% local.
- O visual segue Material Design 3 por tokens, componentes e comportamento.
- React continua sendo usado de forma idiomatica, sem wrappers obrigatorios para
  Web Components na UI principal.
- Nenhuma tela principal perde funcionalidade.
- A tela de treino ativo continua priorizando registro rapido e poucas
  distracoes.
- Light/dark continuam disponiveis e com contraste adequado.
- PWA continua instalavel e compativel com empacotamento Android via Capacitor.

## Checks por execucao

- Rodar o menor conjunto aplicavel:
  - `pnpm build`
  - `pnpm lint`
  - testes unitarios tocados pela mudanca
  - `pnpm visual:check` quando houver alteracao de layout principal
- Verificar viewport mobile quando houver mudanca visual relevante.
- Nao commitar alteracoes nao relacionadas ja presentes no worktree.
