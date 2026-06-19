# Plano de ajuste - menu Treino com lista de rotinas

Data: 2026-06-19

## Objetivo

Alterar a usabilidade do item `Treino` da navegacao inferior para listar todas as rotinas do plano ativo, permitindo que o usuario escolha qual rotina quer executar no dia.

Esta alteracao nao remove a recomendacao automatica de treino. A recomendacao continua existindo e deve permanecer em destaque na tela `Inicio`.

Status: aprovado para implementacao em 2026-06-19.

Referencias aprovadas:

- `docs/arquitetura/prototipos/meu-treino-wireframes-v2.excalidraw`
- `docs/arquitetura/ux-prototipo-aprovado.md`
- `docs/arquitetura/arquitetura-prompt.md`

## Decisao de UX

Fluxo desejado:

1. Usuario toca no item `Treino` da navegacao inferior.
2. App mostra uma lista com todas as rotinas do plano ativo, ordenadas por `order`.
3. A rotina recomendada continua identificada visualmente na lista, mas nao e a unica rotina exibida.
4. Usuario toca em uma rotina da lista.
5. App abre a `UX-03` com o detalhe da rotina escolhida.
6. Na `UX-03`, usuario toca no exercicio que vai fazer.
7. App abre a `UX-04` diretamente naquele exercicio, mantendo o comportamento ja aprovado.

Fluxo que deve continuar existindo:

1. Usuario abre `Inicio`.
2. App mostra o proximo treino recomendado.
3. Usuario toca em `Iniciar treino`.
4. App abre a `UX-03` da rotina recomendada.

## Contexto atual

Hoje o item `Treino` usa a mesma tela `WorkoutScreen` para mostrar a `UX-03` da proxima rotina recomendada. Isso faz o menu `Treino` listar os exercicios do treino recomendado, nao as rotinas do plano.

Arquivos relevantes observados:

- `src/features/navigation/appNavigation.ts`: define `AppScreen` e abas principais.
- `src/features/navigation/AppShell.tsx`: renderiza a navegacao inferior.
- `src/app/App.tsx`: controla `activeScreen`, recomendacao, inicio de sessao e renderizacao da tela `workout`.
- `src/features/workouts/WorkoutScreen.tsx`: hoje renderiza o detalhe da rotina recomendada, com aquecimento, exercicios, cargas sugeridas e cooldown.
- `tests/visual/home-mobile.spec.ts`: cobre home ativa, detalhes do treino, execucao, finalizacao e historico.

## Ajustes necessarios

### 1. Separar conceito de lista de rotinas e detalhe de rotina

Criar uma tela/componente para a lista de rotinas do plano ativo, por exemplo:

- `src/features/workouts/RoutineListScreen.tsx`

Responsabilidades:

- Exibir estado sem plano ativo.
- Exibir plano ativo e quantidade de rotinas.
- Listar todas as rotinas ordenadas por `order`.
- Mostrar nome da rotina, quantidade de exercicios, duracao estimada, faixa de descanso e resumo curto.
- Destacar a rotina recomendada com selo como `Recomendado`.
- Permitir tocar em qualquer rotina para abrir a `UX-03` daquela rotina.

Manter `WorkoutScreen` como a tela de detalhe da rotina (`UX-03`), mas ela deve receber a rotina selecionada, e nao assumir sempre a rotina recomendada.

### 2. Guardar a rotina selecionada para UX-03

Adicionar estado em `src/app/App.tsx`, por exemplo:

```ts
const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
```

Comportamentos:

- Ao tocar em `Inicio > Iniciar treino`, definir `selectedRoutineId` como a rotina recomendada e abrir `workout`.
- Ao tocar em `Treino > rotina`, definir `selectedRoutineId` como a rotina escolhida e abrir `workout`.
- Se `selectedRoutineId` estiver vazio ou apontar para rotina inexistente, usar a rotina recomendada como fallback.
- Ao importar novo plano ou apagar dados locais, limpar `selectedRoutineId`.

### 3. Alterar o comportamento da aba Treino

O clique na aba `Treino` deve navegar para uma tela de lista de rotinas, nao diretamente para a `UX-03`.

Opcao de implementacao simples:

- Adicionar uma nova tela interna, por exemplo `routine-detail`, e deixar `workout` representar a lista de rotinas.

Opcao alternativa:

- Manter `workout` como detalhe e criar `routines` para a lista.

Recomendacao: usar nomes mais claros:

- `workout`: lista de rotinas acessada pela aba `Treino`.
- `routine-detail`: `UX-03`, detalhe da rotina selecionada.
- `active-workout`: `UX-04`, execucao em andamento.

Isso reduz ambiguidade entre menu `Treino` e detalhe de uma rotina.

### 4. Ajustar a entrada na execucao

Atualizar `handleStartRecommendedWorkout` ou renomear para uma funcao mais geral, por exemplo:

```ts
handleStartRoutineExercise(routineId: string, exerciseIndex: number)
```

Comportamentos:

- Encontrar a rotina pelo `routineId` selecionado.
- Criar ou atualizar o draft de treino com essa rotina.
- Iniciar a `UX-04` no exercicio tocado.
- Preservar o caso atual de continuar draft se a rotina em andamento for a mesma.

### 5. Preservar recomendacao de treino

A recomendacao deve continuar sendo calculada por:

- `getNextRecommendedRoutineFromSnapshot(activePlan)`

E deve continuar aparecendo:

- No card principal da Home (`UX-02`).
- Na lista de rotinas do menu `Treino`, como selo visual na rotina recomendada.
- Na finalizacao (`UX-06`), como proxima recomendacao.

Nao alterar regras de dominio:

- Recomendar por `order`.
- Depois da ultima rotina, voltar para a primeira.
- Atualizar ultima rotina finalizada somente ao finalizar uma sessao.

### 6. Atualizar documentacao de UX

Atualizar os documentos canonicos depois da implementacao aprovada:

- `docs/arquitetura/arquitetura-prompt.md`
- `docs/arquitetura/ux-prototipo-aprovado.md`
- `docs/ajustes/plano-correcoes-prototipo.md`, se ainda for usado como referencia temporaria.

Decisao a registrar:

- A Home continua guiada pelo proximo treino recomendado.
- O menu `Treino` passa a ser a entrada para escolher qualquer rotina do plano.
- A `UX-03` deixa de ser apenas "Detalhe do treino recomendado" e passa a ser "Detalhe da rotina selecionada", podendo receber tanto a rotina recomendada quanto uma rotina escolhida manualmente.

## Plano de execucao

Recomendacao de execucao: implementar em uma unica tarefa de Codex, no mesmo contexto, porque a mudanca e coesa e atravessa os mesmos pontos de navegacao, selecao de rotina, detalhe da rotina e testes visuais. Separar em contextos diferentes so faz sentido se a implementacao ficar bloqueada, se os testes visuais demorarem demais, ou se for desejada uma revisao manual entre a UI funcional e a atualizacao das evidencias.

Mesmo executando em uma unica tarefa, seguir as etapas abaixo em ordem para manter o diff revisavel.

### Execucao 1 - Navegacao e estado da rotina selecionada

Objetivo: separar a aba `Treino` da `UX-03`.

Escopo:

- Atualizar `AppScreen` para incluir a tela de detalhe da rotina, se necessario.
- Adicionar estado de rotina selecionada em `App.tsx`.
- Fazer Home abrir detalhe da rotina recomendada.
- Fazer aba `Treino` abrir lista de rotinas.
- Garantir fallback para rotina recomendada quando nao houver selecao valida.

Pronto quando:

- Tocar em `Iniciar treino` na Home abre `UX-03` da recomendada.
- Tocar no item `Treino` da bottom nav nao abre mais direto a lista de exercicios.

### Execucao 2 - Tela de lista de rotinas

Objetivo: implementar a nova tela do menu `Treino`.

Escopo:

- Criar `RoutineListScreen`.
- Listar todas as rotinas do plano ativo.
- Destacar a recomendada.
- Cada card de rotina abre `UX-03` daquela rotina.
- Manter estados de nenhum plano ativo.

Pronto quando:

- Todas as rotinas importadas aparecem no menu `Treino`.
- A rotina recomendada aparece marcada, sem bloquear escolha manual.
- Tocar em qualquer rotina abre `UX-03`.

### Execucao 3 - Generalizar UX-03 e inicio de treino

Objetivo: fazer `UX-03` funcionar para qualquer rotina selecionada.

Escopo:

- Ajustar `WorkoutScreen` para receber `routine` ou `routineId`.
- Renomear props/funcoes para deixar claro que a rotina pode ser recomendada ou escolhida.
- Ajustar inicio de exercicio para usar a rotina selecionada.
- Preservar carga sugerida por exercicio.

Pronto quando:

- A `UX-03` mostra aquecimento, exercicios, cargas sugeridas e cooldown da rotina escolhida.
- Tocar em um exercicio abre `UX-04` naquele exercicio e naquela rotina.

### Execucao 4 - Testes e evidencias mobile

Objetivo: cobrir a regressao visual e funcional do novo fluxo.

Escopo:

- Atualizar `tests/visual/home-mobile.spec.ts`.
- Cobrir importacao do plano modelo, clique em `Treino`, lista de rotinas, abertura de rotina nao recomendada e abertura de `UX-04`.
- Verificar que Home ainda recomenda o proximo treino.
- Rodar checks relevantes.
- Atualizar capturas em `docs/ajustes/auditoria-entrega` se a implementacao for feita.

Checks esperados:

- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm visual:check`

Pronto quando:

- Os checks passam.
- A navegacao mobile nao tem overflow horizontal.
- A bottom nav nao cobre conteudo acionavel.
- O fluxo recomendado e o fluxo de escolha manual coexistem.

## Riscos e cuidados

- Evitar alterar as regras de recomendacao no dominio; a mudanca e de navegacao e UX.
- Evitar duplicar logica de formatacao entre lista de rotinas e detalhe; extrair helper somente se a duplicacao ficar real.
- Cuidar para um draft de treino existente nao ser sobrescrito silenciosamente quando o usuario escolher outra rotina.
- Se houver treino em andamento e o usuario voltar para a lista, a decisao recomendada e manter o draft atual ate cancelar ou finalizar.
- Nao adicionar novas dependencias.

## Fora de escopo neste ajuste

- Backend remoto, login, sincronizacao ou conta.
- Mudancas na estrutura do JSON importado.
- Mudancas nas regras de progresso ou recomendacao.
- Redesenho completo do visual aprovado.
- Criar nova tela separada para descanso.
