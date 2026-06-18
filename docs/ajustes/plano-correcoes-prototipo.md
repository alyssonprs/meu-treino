# Plano de correcoes - aderencia ao prototipo aprovado

Data: 2026-06-17

## Objetivo

Realinhar a implementacao atual do app `meu-treino` com o fluxo aprovado em `docs/arquitetura/ux-prototipo-aprovado.md` e `docs/arquitetura/prototipos/meu-treino-wireframes.excalidraw`.

Este documento foi escrito para orientar proximas execucoes do Codex em tarefas pequenas, revisaveis e eficientes. Nao implementar todas as correcoes em uma unica execucao.

Ao finalizar uma execucao deste plano, atualizar o respectivo status para `Concluida` antes de encerrar a tarefa, junto com os checks e evidencias aplicaveis.

## Fontes de verdade

- `AGENTS.md`
- `docs/arquitetura/arquitetura-prompt.md`
- `docs/arquitetura/ux-prototipo-aprovado.md`
- `docs/arquitetura/prototipos/meu-treino-wireframes.excalidraw`
- `docs/arquitetura/prototipos/meu-treino-wireframes-v2.excalidraw`
- `docs/arquitetura/prototipos/ux-01-inicio-sem-treino.png`
- `docs/arquitetura/prototipos/ux-02-inicio-com-treino-ativo.png`
- `docs/arquitetura/prototipos/ux-04-execucao-do-treino.png`

## Evidencias capturadas da implementacao atual

O projeto foi iniciado localmente em `http://127.0.0.1:5173/` e verificado em viewport mobile `390 x 844`.

Capturas da implementacao atual:

- `docs/ajustes/auditoria-entrega/01-app-inicio-vazio.png`
- `docs/ajustes/auditoria-entrega/02-app-preview-json.png`
- `docs/ajustes/auditoria-entrega/03-app-inicio-com-plano.png`
- `docs/ajustes/auditoria-entrega/04-app-execucao.png`

Observacao tecnica: o Browser interno do Codex falhou no Windows por permissao do runtime. As capturas foram feitas com Playwright local, usando o app rodando no Vite.

## Sequencia de telas aprovada

O Excalidraw V2 contem as telas `UX-01` a `UX-14`, com `UX-09` e `UX-12` removidas como telas independentes:

1. `UX-01 Inicio sem treino`: estado vazio com acao principal `Importar JSON`, acao secundaria `Baixar modelo`, reforcos de dados locais/offline e bottom nav.
2. `UX-02 Inicio com treino`: plano ativo, progresso do ciclo, proximo treino recomendado, resumo de ultimo treino/proxima troca/carga preservada e atalhos.
3. `UX-03 Detalhe do treino`: tela intermediaria antes da execucao, com aquecimento, lista de exercicios tocaveis e cargas sugeridas; tocar em um exercicio abre `UX-04` naquele exercicio.
4. `UX-04 Execucao do treino`: experiencia focada durante a academia, sem bottom nav, com progresso da rotina, exercicio atual, um conjunto principal de campos para carga/reps/RIR, `Salvar serie`, card de descanso e `Proximo exercicio`.
5. `UX-05`: nao deve ser implementada como tela separada. O descanso entre series foi absorvido pela `UX-04` como card/estado interno com `+30s`, `Pular` e `Iniciar proxima serie`.
6. `UX-06 Finalizacao`: confirmacao de treino concluido, resumo salvo e proxima recomendacao.
7. `UX-07 Historico`: resumo do ciclo, evolucao de carga e ultimos treinos.
8. `UX-08 Progresso do exercicio`: detalhe de um exercicio no historico, com ultima carga, maior carga e registros recentes.
9. `UX-09`: removida. A escolha do arquivo JSON deve acontecer diretamente no card da `UX-01` quando nao houver treino ativo, ou no card de treino/JSON da `UX-13` quando houver treino ativo.
10. `UX-10 Preview do JSON`: resumo do plano valido e confirmacao de substituicao.
11. `UX-11 Erro de importacao`: erro claro de JSON invalido, detalhe tecnico e recuperacao.
12. `UX-12`: removida. `Baixar modelo` deve executar download direto a partir da `UX-01` sem treino ativo ou da `UX-13` com treino ativo.
13. `UX-13 Configuracoes`: tema, funcoes de JSON/troca de treino quando houver plano ativo, backup, restauracao, apagar dados locais e informacoes do app.
14. `UX-14 Tema claro`: validacao visual das telas principais no tema claro.

## Navegacao esperada

### Primeiro uso

`UX-01 Inicio sem treino` -> tocar em `Importar JSON` abre o seletor de arquivo -> `UX-10 Preview do JSON` -> confirma importacao -> `UX-02 Inicio com treino`.

Caminho alternativo: `UX-01` -> tocar em `Importar JSON` abre o seletor de arquivo -> erro de validacao -> `UX-11 Erro de importacao` -> escolher outro arquivo ou baixar modelo.

### Baixar modelo

Sem treino ativo: `UX-01 Inicio sem treino` -> tocar em `Baixar modelo` executa o download direto do arquivo modelo, sem abrir uma tela `UX-12`.

Com treino ativo: bottom nav `Ajustes` -> `UX-13 Configuracoes` -> area de treino/JSON -> tocar em `Baixar modelo` executa o download direto.

### Treino recomendado

`UX-02 Inicio com treino` -> `UX-03 Detalhe do treino` -> usuario revisa a lista de exercicios e toca no exercicio que vai fazer -> `UX-04 Execucao do treino` naquele exercicio -> salvar serie -> card de descanso dentro da propria `UX-04` -> iniciar proxima serie, seguir para proximo exercicio disponivel ou voltar a lista -> finalizar rotina -> `UX-06 Finalizacao` -> voltar ao inicio ou ver historico.

### Historico

Bottom nav `Historico` -> `UX-07 Historico` -> selecionar exercicio -> `UX-08 Progresso do exercicio` -> voltar.

### Ajustes

Bottom nav `Ajustes` -> `UX-13 Configuracoes` -> alternar tema, baixar modelo JSON, substituir treino atual, exportar/importar backup, apagar dados ou ver versao.

Com treino ativo: bottom nav `Ajustes` -> `UX-13 Configuracoes` -> tocar em `Substituir treino atual` abre o seletor de arquivo -> `UX-10 Preview do JSON` ou `UX-11 Erro de importacao`.

### Tema

Troca de tema em `UX-13 Configuracoes` deve aplicar sem reiniciar e persistir localmente. O tema claro deve seguir `UX-14 Tema claro`.

## Diferencas encontradas

### Navegacao e arquitetura de tela

- `src/app/App.tsx` concentra quase toda a UI em um unico arquivo e alterna apenas entre home e treino ativo.
- A bottom nav existe visualmente, mas os itens `Treino`, `Historico` e `Ajustes` nao mudam de tela.
- Nao ha rotas ou estado de tela para `UX-03`, `UX-06`, `UX-07`, `UX-08`, `UX-11` e `UX-13`; `UX-09` e `UX-12` nao devem existir como rotas/telas.
- A bottom nav continua visivel durante a execucao do treino, contrariando `UX-04`.

### Inicio sem treino

- A tela atual nao segue a composicao aprovada de `UX-01`: falta o bloco visual central de importacao e o bloco compacto com os tres beneficios.
- A implementacao mostra cards duplicados de `Importar treino` e `Baixar modelo` abaixo do card principal.
- `Historico de cargas` e `Tema do app` aparecem no primeiro uso, competindo com a acao principal.
- O texto visivel esta sem acentos em varios pontos. A UI final deve usar portugues natural.

### Inicio com treino ativo

- A tela atual nao segue `UX-02`: falta o card superior de progresso do ciclo com destaque, semana atual e contador.
- O card de proximo treino nao exibe duracao, volume, descanso, relacao com treino anterior e hierarquia visual aprovada.
- O app mantem `Importar JSON` e `Baixar modelo` como destaque principal mesmo com plano ativo; com treino ativo, essas acoes e toda troca de treino devem ficar em `Ajustes`.
- O preview `Plano ativo atualizado` permanece na home ate o usuario fechar, criando um estado intermediario que nao aparece no fluxo aprovado.
- Faltam os blocos/atalhos de `Ultimo treino`, `Proxima troca`, `Carga preservada`, `Ver plano` e `Historico` conforme o prototipo; `Substituir treino atual` deve sair da home ativa e ficar em `Ajustes`.

### Detalhe do treino

- `UX-03 Detalhe do treino` nao existe.
- O botao `Iniciar treino` da home abre diretamente a execucao, sem mostrar aquecimento, lista de exercicios, cargas sugeridas, contexto da rotina ou opcao de tocar no exercicio que sera feito.

### Execucao do treino

- A tela atual mostra todos os exercicios e todas as series em uma lista longa.
- O prototipo exige uma experiencia guiada por exercicio atual, com progresso da rotina, timer em destaque, um conjunto principal de campos para carga/reps/RIR, `Salvar serie` e `Proximo exercicio`.
- A entrada de carga, reps e RIR deve ser preenchida para o exercicio em execucao, sem repetir uma grade de campos para cada repeticao ou para todos os exercicios ao mesmo tempo.
- Nao ha controles de incremento/decremento para carga, reps e RIR.
- Nao ha estados visuais de serie concluida, serie em execucao e serie pendente como em `UX-04`.
- Nao ha cabecalho com voltar, pausar e parar.
- A bottom nav fica visivel durante o treino.
- O botao principal atual e `Finalizar treino`, mas o fluxo aprovado prioriza salvar serie e avancar.

### Descanso durante a execucao

- O timer atual aparece dentro de cada card de exercicio, sem relacao clara com a serie recem-salva.
- Faltam `+30s`, `Pular`, proxima serie e carga sugerida.
- Nao criar uma tela dedicada para `UX-05`; o descanso deve aparecer como card/estado dentro da `UX-04`, ligado a serie recem-salva.

### Finalizacao

- `UX-06 Finalizacao` nao existe.
- Ao finalizar, o app volta para a home com uma mensagem curta, sem resumo da sessao e sem proxima recomendacao.

### Historico

- `UX-07 Historico` e `UX-08 Progresso do exercicio` nao existem como telas.
- A home possui apenas um painel resumido de carga, sem ultimos treinos, evolucao por exercicio, detalhe de exercicio ou navegacao.
- O repositorio atual nao expoe consultas dedicadas para listar sessoes concluidas e detalhes historicos por exercicio.

### Importacao e modelo

- `UX-10` e `UX-11` estao implementadas como paineis embutidos na home, nao como fluxo dedicado.
- A home sem treino ativo deve ter importacao/modelo em destaque; a home com treino ativo nao deve exibir esse card. Com treino ativo, importacao, download do modelo e substituicao de treino pertencem a `Ajustes`.
- Nao criar tela dedicada `UX-09`; `Importar JSON` na `UX-01` e `Substituir treino atual` na area de JSON em `UX-13` devem abrir o seletor de arquivo diretamente.
- Nao criar tela dedicada `UX-12`; `Baixar modelo` deve executar o download direto a partir da `UX-01` ou `UX-13`.
- O erro de importacao nao foi validado visualmente nesta auditoria, mas o codigo mostra que ele tambem fica embutido na home.

### Configuracoes

- `UX-13 Configuracoes` nao existe como tela.
- O tema fica embutido na home.
- As funcoes de JSON e troca de treino nao estao centralizadas em `Ajustes` quando ja existe treino ativo.
- Backup, importar backup, apagar dados locais e versao nao estao entregues como experiencia de ajustes.
- O repositorio ja possui `clearAllWorkoutData`, mas nao ha UI dedicada para acionar essa limpeza com confirmacao.

### Qualidade visual e acessibilidade

- A implementacao atual usa componentes basicos e tokens, mas nao replica a densidade, hierarquia e estados aprovados.
- A bottom nav fixa pode cobrir conteudo em paginas longas.
- A bottom nav nao indica semanticamente a pagina atual alem de cor visual.
- A tela de execucao usa campos de texto pequenos e repetitivos, menos adequada para uso rapido durante treino.

## Estrategia de correcao

Preservar a logica de dominio, validacao, importacao, repositorio Dexie, recomendacao e progresso ja existentes. Corrigir principalmente a arquitetura de telas, navegacao e experiencia de treino.

Nao adicionar novas dependencias de producao sem aprovacao. A principio, as correcoes podem ser feitas com React, Tailwind, shadcn/ui base existente e lucide-react.

Decisao de fluxo para JSON:

- Sem treino ativo, a tela inicial deve manter o card de `Importar JSON` e `Baixar modelo`.
- Sem treino ativo, `Importar JSON` abre o seletor de arquivo diretamente na `UX-01`, sem passar por uma tela `UX-09`.
- Sem treino ativo, `Baixar modelo` executa download direto na `UX-01`, sem passar por uma tela `UX-12`.
- Com treino ativo, a tela inicial deve priorizar o proximo treino recomendado e nao deve exibir card de importacao/modelo.
- Com treino ativo, todas as funcoes de JSON, download de modelo e troca/substituicao de treino devem ficar em `Ajustes`; `Substituir treino atual` em `UX-13` abre o seletor de arquivo diretamente.
- Nao implementar rota/tela `UX-09` nem `UX-12`.

Decisao de execucao para `UX-04`:

- A tela de execucao deve ter um conjunto principal de campos de carga, reps e RIR para o exercicio em andamento.
- Nao criar uma grade repetida de campos por repeticao ou por todos os exercicios ao mesmo tempo.
- O descanso deve ficar dentro da propria `UX-04` como card/estado apos salvar serie.
- Nao criar rota/tela separada para `UX-05`.

Decisao de entrada na execucao:

- Clicar em `Iniciar treino` na home nao deve abrir direto `UX-04`.
- O app deve abrir primeiro `UX-03 Detalhe do treino`, mostrando a lista de exercicios da rotina.
- Em `UX-03`, nao deve haver estado separado de exercicio marcado nem botao global de inicio.
- Cada exercicio da lista deve ser tocavel; ao tocar em um exercicio, o app abre `UX-04` diretamente naquele exercicio, porque um aparelho pode estar ocupado e outro livre.
- Ao entrar em `UX-04`, a execucao deve iniciar no exercicio tocado na lista, nao necessariamente no primeiro exercicio pela ordem do plano.

## Execucao 1 - Criar shell de navegacao e separar telas

Status: Concluida

Objetivo: substituir o `App.tsx` monolitico por um shell com estado de tela simples e bottom nav funcional.

Arquivos provaveis:

- `src/app/App.tsx`
- `src/features/navigation`
- `src/features/home`
- `src/features/import-export`
- `src/features/workouts`
- `src/features/progress`
- `src/features/settings`

Escopo:

- Criar um tipo de rota local, por exemplo `AppScreen`.
- Implementar `AppShell` com header, conteudo e bottom nav.
- Fazer bottom nav mudar entre `Inicio`, `Treino`, `Historico` e `Ajustes`.
- Esconder bottom nav durante execucao de treino e finalizacao.
- Mover componentes grandes de `App.tsx` para arquivos de feature.
- Manter os servicos e repositorios existentes.

Pronto quando:

- Clicar em `Inicio`, `Treino`, `Historico` e `Ajustes` muda o conteudo visivel.
- `App.tsx` fica responsavel por orquestracao, nao por toda a UI.
- A execucao de treino nao mostra bottom nav.
- `pnpm test`, `pnpm lint` e `pnpm build` passam.

## Execucao 2 - Corrigir primeiro uso, importacao e modelo

Status: Concluida

Objetivo: implementar `UX-01`, `UX-10` e `UX-11` para primeiro uso, sem criar telas dedicadas `UX-09` ou `UX-12`.

Arquivos provaveis:

- `src/features/home`
- `src/features/import-export`
- `src/platform`
- `src/assets/meu-treino-modelo.json`

Escopo:

- Refazer inicio sem treino conforme `UX-01`.
- Manter o card de `Importar JSON` e `Baixar modelo` na home somente no estado sem treino ativo.
- Remover cards duplicados que competem com a acao principal.
- Fazer o botao `Importar JSON` da `UX-01` abrir o seletor de arquivo diretamente.
- Fazer o botao `Baixar modelo` da `UX-01` executar download direto do arquivo modelo.
- Criar tela de preview com confirmacao de substituicao.
- Criar tela de erro com detalhe tecnico e recuperacao.
- Nao criar tela dedicada de baixar modelo.
- Depois de confirmar importacao, navegar para `Inicio` com plano ativo.

Pronto quando:

- Primeiro uso segue `UX-01`.
- Home sem treino ativo mostra importacao/modelo; home com treino ativo nao mostra esse card.
- Importacao valida segue `UX-01` -> seletor de arquivo -> `UX-10` -> `UX-02`.
- Importacao invalida segue `UX-01` -> seletor de arquivo -> `UX-11`.
- Baixar modelo executa download direto sem abrir `UX-12`.
- Checks passam e ha teste visual mobile do primeiro uso/importacao.

## Execucao 3 - Corrigir home com plano ativo e detalhe do treino

Objetivo: implementar `UX-02` e `UX-03` usando a recomendacao e progresso existentes.

Arquivos provaveis:

- `src/features/home`
- `src/features/workouts`
- `src/services/progressService.ts`
- `src/services/workoutRecommendationService.ts`

Escopo:

- Refazer home ativa conforme `UX-02`.
- Dar prioridade ao proximo treino recomendado.
- Remover da home ativa o card de `Importar JSON` e `Baixar modelo`.
- Exibir progresso do ciclo, contador de treinos, semana aproximada e dias por semana.
- Exibir resumo de ultimo treino, proxima troca e carga preservada.
- Implementar atalhos `Ver plano` e `Historico`; a acao `Substituir treino atual` deve ficar em `Ajustes`.
- Criar tela de detalhe do treino recomendado `UX-03`.
- O botao da home deve ir para detalhe, nao direto para `UX-04`.
- `UX-03` deve mostrar a lista completa de exercicios do treino, com carga sugerida/ultima carga quando existir.
- Cada item de exercicio em `UX-03` deve abrir `UX-04` diretamente naquele exercicio.
- Nao criar estado previo nem botao global de inicio no detalhe.

Pronto quando:

- Home com plano ativo nao prioriza importacao.
- Home com plano ativo nao mostra `Importar JSON`, `Baixar modelo` ou troca de treino.
- O card principal de `Proximo treino` bate com a hierarquia aprovada.
- `Iniciar treino` na home abre detalhe antes da execucao.
- `UX-03` lista aquecimento, exercicios, cargas sugeridas e cooldown.
- `UX-03` permite tocar diretamente no exercicio que sera executado antes de abrir `UX-04`.
- Checks passam e capturas mobile sao atualizadas.

## Execucao 4 - Refatorar execucao para fluxo guiado por serie

Objetivo: implementar `UX-04` como fluxo real de treino, com descanso integrado na propria tela.

Arquivos provaveis:

- `src/features/workouts`
- `src/services/workoutSessionService.ts`
- `src/services/workoutSessionService.test.ts`

Escopo:

- Introduzir estado de sessao ativa com `currentExerciseIndex`, status do exercicio em andamento e timer/card de descanso atual.
- Inicializar `currentExerciseIndex` a partir do exercicio tocado na lista de `UX-03`, nao fixar sempre no primeiro exercicio.
- Mostrar apenas o exercicio atual com contexto de progresso da rotina.
- Implementar cabecalho com voltar, pausar e parar/cancelar.
- Implementar um conjunto principal de controles grandes de incremento/decremento para carga, reps e RIR do exercicio atual.
- Nao renderizar campos de carga/reps/RIR para todos os exercicios ou repeticoes ao mesmo tempo.
- Implementar `Salvar serie`.
- `Salvar serie` deve salvar os valores atuais do exercicio em andamento, sem pedir campos separados por repeticao.
- Apos salvar serie, exibir card/estado de descanso dentro da propria `UX-04`.
- Implementar `+30s`, `Pular` e `Iniciar proxima serie` nesse card de descanso.
- Permitir voltar a lista/detalhe e tocar em outro exercicio quando o proximo aparelho estiver ocupado.
- Manter os dados no draft ate finalizar a rotina.

Pronto quando:

- A execucao nao lista todos os exercicios ao mesmo tempo.
- A execucao inicia no exercicio tocado no detalhe do treino.
- Usuario registra serie em poucos toques.
- O exercicio atual apresenta carga, reps e RIR em um unico bloco de entrada.
- Estados de progresso deixam claro o que ja foi concluido, o que esta em execucao e o que esta pendente.
- Card de descanso esta ligado a serie recem-salva.
- Bottom nav nao aparece durante treino.
- Testes cobrem conversao do draft em sessao salva.

## Execucao 5 - Implementar finalizacao de treino

Objetivo: implementar `UX-06` e fechar corretamente o fluxo de treino.

Arquivos provaveis:

- `src/features/workouts`
- `src/services/workoutSessionService.ts`
- `src/services/workoutRecommendationService.ts`
- `src/storage/pwa/dexieWorkoutPlanRepository.ts`

Escopo:

- Salvar sessao somente ao finalizar rotina.
- Exibir resumo: exercicios, series registradas, progresso no ciclo e rotina concluida.
- Atualizar ultima rotina finalizada e recomendacao seguinte.
- Oferecer `Voltar ao inicio` e `Ver historico`.
- Tratar tentativa de finalizar sem series validas.

Pronto quando:

- Ao concluir treino, usuario ve tela de sucesso antes de voltar.
- Home passa a recomendar a proxima rotina pela ordem.
- Historico de carga e progresso continuam preservados.
- Testes de servico e storage passam.

## Execucao 6 - Implementar historico e detalhe de exercicio

Objetivo: implementar `UX-07` e `UX-08`.

Arquivos provaveis:

- `src/features/progress`
- `src/services/progressService.ts`
- `src/storage/workoutPlanRepository.ts`
- `src/storage/pwa/dexieWorkoutPlanRepository.ts`
- testes de storage/progresso

Escopo:

- Adicionar consultas para sessoes concluidas recentes.
- Adicionar consulta de historico por exercicio, incluindo ultima carga, maior carga e registros recentes.
- Criar tela `Historico` com resumo do ciclo, evolucao de carga e ultimos treinos.
- Criar tela de detalhe por exercicio.
- Ligar bottom nav `Historico` a essa tela.

Pronto quando:

- `Historico` nao e mais apenas um card na home.
- Usuario consegue abrir um exercicio e ver seus registros.
- Cargas registradas em treinos aparecem no historico.
- Testes de storage/progresso cobrem as novas consultas.

## Execucao 7 - Implementar ajustes e dados locais

Objetivo: implementar `UX-13` e completar as acoes locais previstas.

Arquivos provaveis:

- `src/features/settings`
- `src/theme/theme.tsx`
- `src/platform`
- `src/storage/workoutPlanRepository.ts`
- `src/storage/pwa/dexieWorkoutPlanRepository.ts`

Escopo:

- Mover seletor de tema para tela `Ajustes`.
- Criar area de treino/JSON em `Ajustes` com apenas `Substituir treino atual` e `Baixar modelo`.
- Fazer `Substituir treino atual` em `Ajustes` abrir o seletor de arquivo diretamente, sem rota/tela `UX-09`.
- Fazer `Baixar modelo` em `Ajustes` executar download direto, sem rota/tela `UX-12`.
- Exibir versao do app.
- Implementar apagar dados locais com confirmacao.
- Planejar ou implementar exportar/importar backup local, conforme escopo aprovado antes da execucao.
- Garantir que trocar tema aplica sem reiniciar.
- Validar tema claro contra `UX-14`.

Pronto quando:

- Bottom nav `Ajustes` abre configuracoes reais.
- Com treino ativo, funcoes de JSON e troca de treino ficam em `Ajustes`, nao na home.
- O card de JSON da `UX-13` mostra apenas os botoes `Substituir treino atual` e `Baixar modelo`.
- Em `Ajustes`, importacao valida segue seletor de arquivo -> `UX-10`, e importacao invalida segue seletor de arquivo -> `UX-11`.
- Tema claro/escuro funciona e persiste.
- Apagar dados locais limpa plano, progresso e historico apos confirmacao.
- Acoes nao implementadas nao devem aparecer como funcionais falsas.

## Execucao 8 - Revisao visual mobile e testes de regressao

Objetivo: validar aderencia visual e funcional das telas principais apos as correcoes.

Arquivos provaveis:

- `tests/visual`
- `docs/arquitetura/prototipos`
- `src/features/*`

Escopo:

- Criar testes visuais mobile para:
  - inicio sem treino
  - importacao/preview
  - inicio com plano ativo
  - importacao/modelo dentro de ajustes quando ha treino ativo
  - detalhe do treino com lista tocavel de exercicios
  - execucao com card de descanso integrado
  - finalizacao
  - historico
  - ajustes
  - tema claro
- Checar ausencia de overflow horizontal.
- Checar se bottom nav nao cobre conteudo acionavel.
- Checar estados vazios, erro de importacao e ciclo concluido.
- Atualizar documentacao apenas quando a implementacao bater com o prototipo aprovado.

Pronto quando:

- `pnpm test`, `pnpm lint`, `pnpm build` e `pnpm visual:check` passam.
- As capturas mobile comprovam as telas principais.
- Nao ha texto cortado, conteudo coberto pela bottom nav ou controles pequenos demais na execucao.

## Ordem recomendada

1. Execucao 1: navegacao e separacao de telas. Status: Concluida.
2. Execucao 2: primeiro uso/importacao/modelo. Status: Concluida.
3. Execucao 3: home ativa/detalhe do treino.
4. Execucao 4: execucao guiada com descanso integrado.
5. Execucao 5: finalizacao.
6. Execucao 6: historico.
7. Execucao 7: ajustes.
8. Execucao 8: revisao visual e regressao.

## Prompt base para proximas execucoes

Use este formato para cada lote:

```text
Use AGENTS.md, docs/arquitetura/arquitetura-prompt.md, docs/arquitetura/ux-prototipo-aprovado.md e docs/ajustes/plano-correcoes-prototipo.md como referencia.
Objetivo: executar a [Execucao N - nome] do plano de correcoes.
Restricoes: PWA primeiro, dados 100% locais, sem backend remoto, sem novas dependencias de producao sem aprovacao, manter servicos/repositorios existentes quando possivel.
Pronto quando: cumprir os criterios da execucao, rodar os checks relevantes e atualizar as capturas/testes mobile quando a execucao envolver UI.
```

## Checks recomendados por tipo de mudanca

- Navegacao/UI: `pnpm lint`, `pnpm build`, `pnpm visual:check`.
- Dominio/servicos: `pnpm test`, `pnpm lint`.
- Storage: `pnpm test`, `pnpm build`.
- PWA geral: `pnpm build` e verificacao manual/mobile no app local.

## Fora do escopo deste plano

- Backend remoto, login, conta, pagamentos ou cloud sync.
- Publicacao iOS/App Store.
- Recriar identidade visual ou gerar novos icones de marca.
- Trocar stack principal.

