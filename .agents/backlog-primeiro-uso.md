# Backlog - primeiro uso real

Origem: observacoes do treino realizado em 2026-06-19.

Este arquivo organiza trabalho executavel para o agente. Decisoes duraveis devem ser consolidadas em `docs/arquitetura/`; tarefas temporarias ficam aqui ou em issues/PRs.

## Politica de organizacao

- Use `.agents/` para backlog operacional, planos de execucao e notas de trabalho do Codex.
- Use `docs/arquitetura/` apenas para decisoes que precisam permanecer como contrato de produto, arquitetura ou UX.
- Evite recriar `docs/ajustes`, porque `docs/README.md` define que planos temporarios nao devem permanecer em `docs`.
- Para economizar contexto, cada execucao deve carregar somente este backlog, `AGENTS.md`, `docs/arquitetura/arquitetura-prompt.md`, `docs/arquitetura/ux-prototipo-aprovado.md` e os arquivos de codigo diretamente afetados.

## Itens

| ID | Pedido | Area | Impacto UX/prototipo | Prioridade | Execucao |
| --- | --- | --- | --- | --- | --- |
| PU-01 | Na lista de rotinas, mostrar quando cada rotina foi realizada pela ultima vez | Rotinas, historico local | Ajuste em tela `Treino`; nao muda fluxo | P1 | E1 |
| PU-02 | Registrar serie finalizada, ver descanso entre series, mas informar peso e repeticoes somente no final do exercicio | UX-04, servico de sessao | Altera UX-04 aprovada; atualizar Excalidraw antes ou junto da implementacao visual | P0 | E2 |
| PU-03 | Remover botoes de pausa e `X` da tela do exercicio | UX-04 | Ajuste visual direto em UX-04; nao muda dominio | P1 | E2 |
| PU-04 | Mostrar status do exercicio na rotina em progresso: pendente, em progresso e concluido | Detalhe da rotina, sessao ativa | Ajuste em `UX-03` quando existe rotina em progresso | P1 | E3 |

## Execucoes sugeridas

### E1 - Ultima execucao por rotina

Objetivo: mostrar na lista de rotinas quando aquela rotina foi concluida pela ultima vez.

Arquitetura provavel:

- `src/storage/workoutPlanRepository.ts`: adicionar consulta ou resumo por rotina.
- `src/storage/pwa/dexieWorkoutPlanRepository.ts`: buscar ultima `workout_sessions.completedAt` por `routineId`.
- `src/services/progressService.ts`: expor `RoutineLastCompletedSummary`.
- `src/features/workouts/RoutineListScreen.tsx`: mostrar `Nunca realizado` ou data curta.
- `src/app/App.tsx`: carregar e passar o mapa para a lista.

Pronto quando:

- Cada card de rotina mostra a ultima data concluida ou `Nunca realizado`.
- A rotina recomendada continua destacada.
- Ha teste de servico ou storage para o resumo por rotina.

### E2 - Series, descanso e conclusao do exercicio

Objetivo: permitir marcar series concluidas durante o exercicio, iniciar descanso entre series e pedir carga/reps apenas no fim do exercicio.

Arquitetura provavel:

- `src/services/workoutSessionService.ts`: representar progresso visivel de series separado do registro final de carga/reps.
- Manter compatibilidade com a regra da primeira versao: persistir carga/reps uma vez por exercicio. Se o storage continuar exigindo `set_logs`, gravar um unico registro tecnico resumido por exercicio, a menos que seja decidido persistir series sem carga/reps.
- `src/features/workouts/ActiveWorkoutScreen.tsx`: trocar `Registrar exercicio` inicial por `Serie concluida`; apos ultima serie, mostrar formulario de carga/reps e acao `Concluir exercicio`.
- Remover estado e UI de pausa.
- Remover botao `X` do header. Cancelamento pode ficar somente ao voltar para detalhe/lista, se necessario.

Pronto quando:

- O usuario consegue concluir serie 1, ver descanso, continuar para a proxima serie e so informar carga/reps depois da ultima serie.
- O descanso usa `rest_seconds` do exercicio.
- Nao ha botao de pausa nem `X` no topo da tela do exercicio.
- Finalizar rotina continua salvando a sessao e atualizando a recomendacao.
- Testes de `workoutSessionService` cobrem progresso de series e conclusao do exercicio.

### E3 - Status dos exercicios na rotina em progresso

Objetivo: quando existe uma sessao em andamento, a lista de exercicios da rotina deve mostrar status por exercicio.

Arquitetura provavel:

- `src/services/workoutSessionService.ts`: helper para status `pending`, `in-progress`, `completed`.
- `src/features/workouts/WorkoutScreen.tsx`: receber `activeWorkout` ou um mapa de status quando a rotina selecionada for a rotina em andamento.
- `src/app/App.tsx`: passar o draft ativo para a tela de detalhe quando aplicavel.
- UI: badges curtos `Pendente`, `Em progresso`, `Concluido`.

Pronto quando:

- Exercicios ainda nao iniciados aparecem como `Pendente`.
- O exercicio atual aparece como `Em progresso`.
- Exercicios com carga/reps final salvos no draft aparecem como `Concluido`.
- Tocar em um exercicio continua abrindo a execucao naquele exercicio.

## Ordem recomendada

1. E2, porque muda o modelo mental da UX-04 e afeta o status dos exercicios.
2. E3, porque depende melhor do novo estado de progresso da sessao.
3. E1, porque usa historico persistido e e independente do fluxo de execucao.

## Observacoes para prototipo

- Atualizar o quadro `UX-04` no Excalidraw para incluir contador de series, acao `Serie concluida`, descanso entre series e formulario final de carga/reps.
- Atualizar `UX-03` ou anotar variante de `UX-03 com treino em andamento` para mostrar os badges de status.
- A tela `Treino` pode receber apenas um ajuste no card da rotina; nao precisa de novo fluxo.
