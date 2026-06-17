# Plano de correcoes UX - primeira versao

Data: 2026-06-17

## Objetivo

Reorientar a implementacao atual do `meu-treino` para seguir o fluxo aprovado em `docs/ux-prototipo-aprovado.md` e o arquivo editavel `docs/prototipos/meu-treino-wireframes.excalidraw`.

Este arquivo foi escrito para orientar proximas execucoes do Codex em blocos pequenos, revisaveis e verificaveis.

## Fontes usadas na revisao

- `AGENTS.md`
- `docs/arquitetura-prompt.md`
- `docs/ux-prototipo-aprovado.md`
- `docs/prototipos/meu-treino-wireframes.excalidraw`
- Capturas da implementacao atual em `docs/auditoria-ux-correcoes/`
- App local executado em `http://127.0.0.1:5173/` com viewport mobile de 390 x 844 px

## Capturas da implementacao atual

- `docs/auditoria-ux-correcoes/01-implementado-inicio-vazio.png`
- `docs/auditoria-ux-correcoes/02-implementado-preview-importacao.png`
- `docs/auditoria-ux-correcoes/03-implementado-pos-importacao-com-preview.png`
- `docs/auditoria-ux-correcoes/04-implementado-inicio-com-plano.png`
- `docs/auditoria-ux-correcoes/05-implementado-execucao.png`

## Sequencia aprovada de telas e navegacao

### Primeiro uso

1. `UX-01 Inicio sem treino importado`
2. Acao `Importar JSON` abre `UX-09 Importar JSON`
3. Acao `Baixar modelo` abre `UX-12 Baixar modelo JSON`
4. Em `UX-09`, selecionar arquivo valido abre `UX-10 Preview do JSON`
5. Em `UX-09`, selecionar arquivo invalido abre `UX-11 Erro de importacao`
6. Em `UX-10`, confirmar importacao ativa o plano e abre `UX-02 Inicio com treino ativo`
7. Em `UX-11`, escolher outro arquivo volta ao fluxo de `UX-09`

### Uso com plano ativo

1. `UX-02 Inicio com treino ativo` e a tela inicial principal.
2. A primeira dobra deve priorizar plano ativo, progresso do ciclo, proximo treino recomendado e botao `Iniciar treino`.
3. Acao `Iniciar treino` deve abrir `UX-03 Detalhe do treino recomendado` ou iniciar a execucao a partir desse detalhe, mantendo a hierarquia aprovada.
4. Navegacao inferior:
   - `Inicio` abre `UX-02`
   - `Treino` abre `UX-03`
   - `Historico` abre `UX-07`
   - `Ajustes` abre `UX-13`
5. Atalhos da home:
   - `Ver plano` abre o detalhe/lista do plano ou `UX-03`
   - `Importar novo` abre `UX-09`
   - `Historico` abre `UX-07`

### Execucao de treino

1. `UX-03 Detalhe do treino recomendado` mostra aquecimento, exercicios, cargas sugeridas e acao `Iniciar treino`.
2. `UX-04 Execucao do treino` foca em um exercicio e uma serie atual por vez.
3. `Salvar serie` registra a serie atual.
4. Apos salvar uma serie, `UX-05 Timer de descanso` controla o descanso e permite `Pular`.
5. `Proximo exercicio` avanca dentro da rotina.
6. A navegacao inferior deve sumir durante `UX-04` e `UX-05`.
7. Ao concluir/finalizar, abrir `UX-06 Finalizacao do treino`.
8. `UX-06` deve salvar a ultima rotina finalizada, mostrar resumo e apontar a proxima recomendacao.
9. `Voltar ao inicio` abre `UX-02`; `Ver historico` abre `UX-07`.

### Historico e ajustes

1. `UX-07 Historico` lista resumo do ciclo, evolucao basica de carga e ultimos treinos.
2. Tocar em um exercicio abre `UX-08 Detalhe de exercicio no historico`.
3. `UX-13 Configuracoes` concentra tema, backup/exportacao, apagar dados locais e versao.
4. `UX-14 Tema claro` e uma validacao visual do tema claro nas telas principais, nao precisa ser uma rota independente.

## Estado atual encontrado

- A UI esta quase toda concentrada em `src/app/App.tsx`.
- A implementacao atual funciona como pagina unica, com secoes empilhadas.
- A navegacao inferior e visual: os botoes `Treino`, `Historico` e `Ajustes` nao mudam de tela.
- O fluxo de importacao existe, mas aparece inline dentro da home.
- Depois de ativar um plano, o preview continua na tela ate o usuario tocar em `Fechar preview`.
- Mesmo com plano ativo, a primeira dobra continua priorizando importacao JSON e baixar modelo.
- A execucao do treino lista todos os exercicios e todas as series de uma vez.
- Durante a execucao, a navegacao inferior continua visivel.
- Nao ha telas dedicadas para `UX-03`, `UX-05`, `UX-06`, `UX-07`, `UX-08`, `UX-09`, `UX-12` e `UX-13`.
- A tela de configuracoes foi reduzida ao seletor de tema dentro da home.

## Principais diferencas contra o prototipo

### 1. Navegacao principal nao foi entregue

O prototipo define um fluxo com telas distintas. A implementacao atual renderiza quase tudo na home e usa uma bottom nav sem estado de navegacao real.

Impacto: o usuario nao consegue acessar `Treino`, `Historico` e `Ajustes` como telas, e o fluxo guiado aprovado se perde.

### 2. Home com plano ativo nao prioriza o proximo treino

Em `UX-02`, o proximo treino e a acao `Iniciar treino` dominam a primeira tela. Na implementacao atual, o card de importacao e os blocos auxiliares ficam antes do card de proximo treino.

Impacto: a tela inicial deixa de ser guiada e vira uma pagina administrativa.

### 3. Estado vazio ficou pesado e diferente do aprovado

`UX-01` mostra um estado vazio central, com importacao/modelo e beneficios locais. A implementacao atual mostra tambem cards duplicados, historico de cargas e tema na mesma tela.

Impacto: o primeiro uso fica mais longo, menos claro e menos parecido com a tela aprovada.

### 4. Fluxo de importacao nao tem telas dedicadas

`UX-09`, `UX-10` e `UX-11` deveriam ser uma sequencia clara: escolher arquivo, validar, preview, confirmar ou erro. Hoje esses estados aparecem como paineis dentro da home.

Impacto: a confirmacao de substituicao fica menos forte, e a volta para a home apos importar nao segue o fluxo aprovado.

### 5. Detalhe do treino recomendado esta ausente

`UX-03` deveria apresentar aquecimento, lista compacta de exercicios, cargas sugeridas, descanso e acao de iniciar. Hoje `Iniciar treino` pula direto para a tela de execucao.

Impacto: o usuario perde a revisao rapida do treino antes de comecar.

### 6. Execucao nao segue o modo treino aprovado

`UX-04` e `UX-05` focam em uma serie atual, com controles grandes de carga, reps e RIR, timer de descanso e poucas distracoes. Hoje todos os exercicios e series aparecem ao mesmo tempo, sem controles de incremento/decremento e com bottom nav fixa.

Impacto: a experiencia durante a academia fica mais lenta, poluida e menos adequada para uso com uma mao.

### 7. Finalizacao de treino nao tem tela propria

`UX-06` deveria confirmar treino concluido, mostrar resumo, salvar ultima rotina e indicar a proxima recomendacao. Hoje finalizar volta para a home com uma mensagem simples.

Impacto: o fechamento do treino nao reforca progresso nem proxima acao.

### 8. Historico e detalhe de exercicio nao foram implementados como telas

`UX-07` e `UX-08` existem no prototipo, mas a implementacao atual tem apenas um painel resumido de cargas na home.

Impacto: o usuario nao consegue consultar historico de treinos, evolucao por exercicio e detalhes conforme aprovado.

### 9. Ajustes nao foi implementado como tela

`UX-13` inclui tema, backup/exportacao, importacao de backup, apagar dados locais, versao e explicacao offline-first. Hoje existe apenas seletor de tema na home.

Impacto: a bottom nav promete uma area que nao existe e configuracoes importantes ficam ausentes.

### 10. Visual ainda nao segue a composicao aprovada

A base de tema existe, mas a interface atual usa composicoes genericas de cards. Falta aproximar header, hierarquia, botoes, estados e densidade visual das telas aprovadas.

Impacto: mesmo funcionalidades existentes parecem uma primeira versao tecnica, nao a experiencia aprovada.

## Plano de execucoes recomendado

### Execucao C1 - Criar navegacao e layout base

Objetivo: transformar a pagina unica em um app com estados/telas navegaveis seguindo UX-01 a UX-14.

Restricoes:

- Nao adicionar dependencia de roteamento sem aprovacao.
- Usar estado local simples no `App` ou um reducer pequeno.
- Preservar servicos, repositorios e regras de dominio existentes.
- Manter PWA/local/offline e mobile-first.

Arquivos provaveis:

- `src/app/App.tsx`
- `src/features/navigation/*`
- `src/components/AppShell.tsx`
- `src/components/ScreenHeader.tsx`
- `src/components/BottomNavigation.tsx`

Pronto quando:

- Bottom nav muda entre `Inicio`, `Treino`, `Historico` e `Ajustes`.
- O item ativo da nav corresponde a tela atual.
- A nav inferior fica oculta durante execucao e descanso.
- Apos importacao confirmada, o app navega automaticamente para `Inicio`.
- Nao ha duplicacao de paineis de importacao, historico e tema dentro da home.

Verificacao:

- `pnpm lint`
- `pnpm build`
- Capturar viewport 390 x 844 px das quatro abas principais.

### Execucao C2 - Corrigir Inicio sem treino e Inicio com treino ativo

Objetivo: implementar `UX-01` e `UX-02` como telas distintas e fieis ao modelo guiado.

Restricoes:

- Usar `docs/prototipos/ux-01-inicio-sem-treino.png` e `docs/prototipos/ux-02-inicio-com-treino-ativo.png` como referencia visual.
- Usar tokens de tema, sem cores fixas espalhadas.
- Usar assets oficiais de `assets/identity` quando houver marca/logotipo.
- Sem landing page.

Arquivos provaveis:

- `src/features/home/HomeEmptyScreen.tsx`
- `src/features/home/HomeActivePlanScreen.tsx`
- `src/features/home/NextWorkoutCard.tsx`
- `src/features/home/CycleProgressCard.tsx`

Pronto quando:

- Sem plano ativo, a primeira tela mostra apenas o estado vazio aprovado, importacao, baixar modelo e beneficios locais.
- Com plano ativo, a primeira dobra mostra plano ativo, progresso do ciclo, proximo treino recomendado e `Iniciar treino`.
- `Importar novo`, `Ver plano` e `Historico` aparecem como acoes secundarias, nao como foco principal.
- Textos longos nao cortam em 390 x 844 px.

Verificacao:

- `pnpm lint`
- `pnpm build`
- Capturas 390 x 844 px comparadas com UX-01 e UX-02.

### Execucao C3 - Implementar fluxo dedicado de importacao e modelo

Objetivo: entregar `UX-09`, `UX-10`, `UX-11` e `UX-12` como telas/estados dedicados.

Restricoes:

- Validacao continua em `src/domain` e `src/services`.
- Importacao deve continuar 100% local.
- Confirmar substituicao antes de ativar novo plano.
- Preservar historico de cargas existente.

Arquivos provaveis:

- `src/features/import-export/ImportWorkoutScreen.tsx`
- `src/features/import-export/ImportPreviewScreen.tsx`
- `src/features/import-export/ImportErrorScreen.tsx`
- `src/features/import-export/DownloadTemplateScreen.tsx`

Pronto quando:

- `Importar JSON` da home abre a tela de importacao.
- Arquivo valido abre preview com resumo e acao `Confirmar importacao`.
- Arquivo invalido abre erro com detalhe tecnico e acao de tentar novamente.
- `Baixar modelo` abre uma tela dedicada com download e, se viavel no PWA, compartilhamento via Web Share com fallback para download.
- Apos confirmar importacao, o usuario cai em `UX-02`.

Verificacao:

- `pnpm test -- src/services/workoutImportService.test.ts`
- `pnpm lint`
- `pnpm build`
- Capturas dos estados UX-09, UX-10, UX-11 e UX-12.

### Execucao C4 - Implementar detalhe do treino recomendado

Objetivo: entregar `UX-03` antes da execucao.

Restricoes:

- A recomendacao deve continuar usando `getNextRecommendedRoutineFromSnapshot`.
- Nao duplicar regra de negocio na UI.
- Mostrar carga sugerida usando historico existente quando disponivel.

Arquivos provaveis:

- `src/features/workouts/WorkoutDetailScreen.tsx`
- `src/features/workouts/ExercisePreviewList.tsx`

Pronto quando:

- Botao `Iniciar treino` da home leva ao detalhe do treino recomendado.
- A tela mostra aquecimento, exercicios, series, reps, RIR, descanso e cargas sugeridas.
- Acao principal inicia a sessao e abre `UX-04`.
- Voltar retorna para home com plano ativo.

Verificacao:

- `pnpm test -- src/services/workoutRecommendationService.test.ts`
- `pnpm lint`
- `pnpm build`
- Captura 390 x 844 px de UX-03.

### Execucao C5 - Refazer execucao em modo treino

Objetivo: transformar a execucao atual em `UX-04` e `UX-05`, focada em uma serie atual.

Restricoes:

- Preservar `createWorkoutSessionDraft` e `finishWorkoutSession` quando possivel.
- Salvar carga, reps e RIR por serie.
- Usar botoes de incremento/decremento para carga, reps e RIR.
- Manter inputs numericos acessiveis como fallback.
- Ocultar bottom nav durante execucao.

Arquivos provaveis:

- `src/features/workouts/ActiveWorkoutScreen.tsx`
- `src/features/workouts/CurrentExerciseCard.tsx`
- `src/features/workouts/SetLogger.tsx`
- `src/features/workouts/RestTimerPanel.tsx`

Pronto quando:

- A tela mostra rotina, progresso de exercicios e barra de progresso.
- Apenas a serie atual fica em edicao.
- Series concluidas aparecem compactas.
- `Salvar serie` registra a serie e abre/ativa descanso.
- `Pular` encerra descanso.
- `Proximo exercicio` avanca sem precisar rolar uma lista longa.
- Pausar/cancelar/finalizar tem comportamento claro e seguro.

Verificacao:

- `pnpm test -- src/services/workoutSessionService.test.ts`
- `pnpm lint`
- `pnpm build`
- Capturas 390 x 844 px de UX-04 e UX-05.

### Execucao C6 - Implementar finalizacao do treino

Objetivo: entregar `UX-06` apos conclusao/finalizacao.

Restricoes:

- Finalizar deve chamar o servico existente e atualizar progresso local.
- Recomendacao da proxima rotina deve vir da regra de dominio/servico.
- Evitar mensagens soltas na home como substituto de tela de sucesso.

Arquivos provaveis:

- `src/features/workouts/WorkoutCompletionScreen.tsx`
- `src/features/workouts/WorkoutSummaryCard.tsx`

Pronto quando:

- Ao concluir a rotina, o app abre tela de sucesso.
- A tela mostra exercicios, series registradas e progresso do ciclo.
- Mostra a proxima recomendacao.
- `Voltar ao inicio` abre `UX-02`.
- `Ver historico` abre `UX-07`.

Verificacao:

- `pnpm test -- src/services/workoutSessionService.test.ts src/services/workoutRecommendationService.test.ts src/services/progressService.test.ts`
- `pnpm lint`
- `pnpm build`
- Captura 390 x 844 px de UX-06.

### Execucao C7 - Implementar historico e detalhe de exercicio

Objetivo: entregar `UX-07` e `UX-08`.

Restricoes:

- Usar repositorio local existente.
- Historico deve sobreviver a troca de plano quando exercicios equivalentes forem encontrados.
- Nao criar graficos complexos se uma lista/barras simples resolver a primeira versao.

Arquivos provaveis:

- `src/features/progress/HistoryScreen.tsx`
- `src/features/progress/ExerciseProgressScreen.tsx`
- `src/features/progress/LoadEvolutionList.tsx`

Pronto quando:

- Aba `Historico` abre uma tela dedicada.
- Mostra resumo do ciclo, exercicios com evolucao e ultimos treinos.
- Tocar em exercicio abre detalhe com ultima carga, maior carga e registros recentes.
- Estado vazio de historico existe quando nao ha treinos concluidos.

Verificacao:

- `pnpm test -- src/services/progressService.test.ts`
- `pnpm lint`
- `pnpm build`
- Capturas 390 x 844 px de UX-07 e UX-08.

### Execucao C8 - Implementar Ajustes e tema claro validado

Objetivo: entregar `UX-13` e validar `UX-14`.

Restricoes:

- Tema escuro continua padrao de primeira abertura.
- Tema claro usa tokens existentes e deve ser aplicado sem reiniciar.
- Backup/exportacao e apagar dados devem ser locais.
- Se alguma acao de backup ainda nao puder ser completa, exibir estado desabilitado com texto curto ou dividir em nova execucao.

Arquivos provaveis:

- `src/features/settings/SettingsScreen.tsx`
- `src/features/settings/ThemeSegmentedControl.tsx`
- `src/platform/*`

Pronto quando:

- Aba `Ajustes` abre tela dedicada.
- Tema claro/escuro funciona e persiste.
- Tela mostra versao do app.
- Existem acoes para exportar backup, importar backup e apagar dados locais, com confirmacao para acao destrutiva.
- Telas principais ficam legiveis no tema claro.

Verificacao:

- `pnpm lint`
- `pnpm build`
- Capturas de `Inicio`, `Treino`, `Historico` e `Ajustes` no tema claro.

### Execucao C9 - QA visual, acessibilidade e documentacao

Objetivo: fechar a correcao com uma verificacao de produto, nao apenas de build.

Restricoes:

- Nao ampliar escopo funcional.
- Corrigir apenas desalinhamentos contra o prototipo aprovado e problemas de uso mobile.

Arquivos provaveis:

- `docs/revisao-final-primeira-versao.md`
- `docs/roteiro-execucoes-codex.md`
- Capturas novas em `docs/auditoria-ux-correcoes/` ou pasta equivalente

Pronto quando:

- Todas as telas UX-01 a UX-14 foram verificadas em 390 x 844 px.
- Bottom nav funciona e some durante treino.
- Sem overflow horizontal.
- Textos principais nao cortam.
- Fluxo primeiro uso, troca de treino, treino recomendado, historico e tema foram testados.
- `docs/revisao-final-primeira-versao.md` e atualizado com o resultado real.

Verificacao:

- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm visual:check` ou captura Playwright equivalente

## Ordem sugerida

1. C1 Navegacao e layout base
2. C2 Home vazia e home ativa
3. C3 Importacao/modelo
4. C4 Detalhe do treino
5. C5 Execucao e descanso
6. C6 Finalizacao
7. C7 Historico
8. C8 Ajustes e tema claro
9. C9 QA final

## Notas para o proximo Codex

- Trate `docs/ux-prototipo-aprovado.md` como contrato de UX.
- O foco desta correcao e UI/navegacao; a base de dominio, validacao, Dexie e servicos ja existe e deve ser preservada.
- Evite refatorar regras de negocio enquanto estiver corrigindo telas.
- Nao adicionar backend, login, sync, pagamentos ou IA dentro do app.
- Nao adicionar novas dependencias de producao sem pedir aprovacao.
- Cada execucao deve terminar com checks relevantes, capturas mobile e commit separado.
