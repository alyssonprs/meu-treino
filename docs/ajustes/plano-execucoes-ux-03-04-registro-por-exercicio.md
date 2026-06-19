# Plano de execucoes - ajustes UX-03 e UX-04

Data: 2026-06-19

## Objetivo

Organizar as proximas execucoes para simplificar o detalhe do treino (`UX-03`) e a execucao do treino (`UX-04`), reduzindo cliques durante o treino.

Estas alteracoes atualizam a decisao anterior do prototipo aprovado: a primeira versao deve registrar carga e repeticoes por exercicio, nao mais carga, repeticoes e RIR por serie.

## Fontes de verdade

- `AGENTS.md`
- `docs/arquitetura/arquitetura-prompt.md`
- `docs/arquitetura/ux-prototipo-aprovado.md`
- `docs/ajustes/plano-correcoes-prototipo.md`
- `docs/arquitetura/prototipos/meu-treino-wireframes-v2.excalidraw`

## Decisoes aprovadas nesta revisao

- Em `UX-03`, remover o label `Abrir` do card de exercicio.
- Em `UX-03`, manter o icone de seta para indicar que o card e acionavel.
- Em `UX-03`, remover o card com titulo `Toque no exercicio disponivel`.
- Em `UX-03`, remover o card com texto `Sem botao global: toque no exercicio que voce vai fazer agora.`
- Em `UX-04`, remover o card superior com o conteudo `0/19 series 0/6 exercicios`.
- Em `UX-04`, registrar carga e repeticoes por exercicio, nao por serie.
- Em `UX-04`, remover o preenchimento de RIR do fluxo inicial.
- Manter RIR como possibilidade futura, sem exigir campo visivel agora.

## Estrategia recomendada

Nao executar tudo em um unico contexto.

Dividir em dois contextos principais:

1. Limpeza visual de baixo risco em `UX-03` e `UX-04`.
2. Mudanca de comportamento em `UX-04`: registro por exercicio e remocao de RIR.

Usar um terceiro contexto somente se a regressao visual ou os testes indicarem ajustes finos.

## Execucao 1 - Limpeza visual da UX-03 e topo da UX-04

Status: Pendente

Objetivo: remover elementos redundantes sem alterar ainda o modelo de dados ou o fluxo de salvamento.

Arquivos provaveis:

- `src/features/workouts`
- `tests/visual`
- `docs/ajustes/auditoria-entrega`

Escopo:

- Remover o label `Abrir` dos cards de exercicio em `UX-03`.
- Garantir que a seta ou icone de navegacao continua visivel nos cards de exercicio.
- Remover o card `Toque no exercicio disponivel` de `UX-03`.
- Remover o card `Sem botao global: toque no exercicio que voce vai fazer agora.` de `UX-03`.
- Remover o card superior de `UX-04` com o contador `0/19 series 0/6 exercicios`.
- Preservar a navegacao: tocar no card de exercicio em `UX-03` continua abrindo `UX-04` naquele exercicio.

Fora do escopo:

- Alterar servicos de treino.
- Alterar storage.
- Alterar finalizacao de treino.
- Remover RIR.
- Trocar registro por serie para registro por exercicio.

Pronto quando:

- `UX-03` fica sem cards explicativos redundantes.
- Cards de exercicio continuam claramente acionaveis.
- `UX-04` nao mostra o card superior redundante de series/exercicios.
- A navegacao `UX-03 -> UX-04` continua funcionando.
- Checks relevantes passam.

Checks recomendados:

- `pnpm lint`
- `pnpm build`
- `pnpm visual:check`

Evidencias esperadas:

- Captura mobile atualizada de `UX-03`.
- Captura mobile atualizada de `UX-04`, se o teste visual cobrir a tela.

## Execucao 2 - Registro por exercicio e remocao de RIR na UX-04

Status: Pendente

Objetivo: alterar a experiencia de execucao para registrar carga e repeticoes uma vez por exercicio, reduzindo cliques durante o treino.

Arquivos provaveis:

- `src/features/workouts`
- `src/services/workoutSessionService.ts`
- `src/services/workoutSessionService.test.ts`
- `src/storage/workoutPlanRepository.ts`
- `src/storage/pwa/dexieWorkoutPlanRepository.ts`
- `src/features/progress`
- testes de servico, storage e progresso

Escopo:

- Trocar o bloco de registro por serie por um bloco unico de registro por exercicio.
- Remover o campo/controle de RIR da interface de execucao.
- Manter apenas carga e repeticoes como entradas principais.
- Substituir a acao `Salvar serie` por uma acao equivalente a `Registrar exercicio` ou `Salvar exercicio`.
- Atualizar estados visuais para exercicio pendente, exercicio em andamento e exercicio registrado.
- Revisar o card de descanso para fazer sentido no novo fluxo.
- Garantir que o usuario consiga avancar para o proximo exercicio apos registrar o exercicio atual.
- Garantir que a finalizacao da rotina continue persistindo os dados corretamente.
- Ajustar historico e resumo para nao dependerem de RIR visivel.

Decisao tecnica recomendada:

- Manter o campo de RIR como opcional ou nulo no dominio/storage, quando isso evitar migracao desnecessaria.
- Remover RIR da UI e dos fluxos obrigatorios da primeira versao.
- Se a estrutura atual exigir `set_logs`, persistir um registro tecnico unico por exercicio, com `set_number = 1`, ate uma refatoracao de storage ser realmente necessaria.

Fora do escopo:

- Criar backend remoto.
- Adicionar novas dependencias de producao.
- Criar conta, login ou sync.
- Recriar o historico inteiro.
- Implementar analytics avancado de RIR.

Pronto quando:

- A execucao mostra apenas carga e repeticoes para o exercicio atual.
- O usuario registra o exercicio em poucos toques.
- Nao existe preenchimento de RIR na `UX-04`.
- O fluxo nao exige registrar cada serie separadamente.
- A rotina pode ser finalizada com os exercicios registrados.
- Historico e progresso continuam exibindo cargas registradas.
- Testes relevantes passam.

Checks recomendados:

- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm visual:check`

Evidencias esperadas:

- Captura mobile da nova `UX-04`.
- Evidencia de registro de exercicio e finalizacao.
- Evidencia de historico com carga registrada.

## Execucao 3 - Atualizar documentacao canonica e plano de correcoes

Status: Pendente

Objetivo: persistir a decisao de produto para que proximas execucoes nao reintroduzam registro por serie ou RIR obrigatorio.

Arquivos provaveis:

- `docs/arquitetura/arquitetura-prompt.md`
- `docs/arquitetura/ux-prototipo-aprovado.md`
- `docs/ajustes/plano-correcoes-prototipo.md`
- `AGENTS.md`, somente se a regra precisar orientar todas as futuras execucoes

Escopo:

- Atualizar a descricao da `UX-04` para registrar carga e repeticoes por exercicio.
- Remover mencoes de RIR como campo obrigatorio da experiencia de execucao.
- Registrar RIR como melhoria futura, nao como requisito da primeira versao.
- Atualizar criterios de aceite afetados.
- Atualizar o plano de correcoes com referencia a este novo plano.

Pronto quando:

- A documentacao canonica nao conflita com a nova decisao.
- Novas execucoes encontram a regra correta sem depender de contexto de conversa.
- Checks de documentacao nao se aplicam, mas o diff deve ser pequeno e revisavel.

Checks recomendados:

- Revisao manual do diff.

## Execucao 4 - Regressao mobile e ajustes finos

Status: Pendente

Objetivo: validar que a simplificacao nao quebrou telas principais, persistencia ou historico.

Arquivos provaveis:

- `tests/visual`
- `docs/ajustes/auditoria-entrega`
- `src/features/workouts`
- `src/features/progress`

Escopo:

- Verificar `UX-03` em viewport mobile.
- Verificar `UX-04` em viewport mobile.
- Verificar finalizacao de treino.
- Verificar historico apos registro de exercicio.
- Verificar ausencia de overflow horizontal.
- Verificar que bottom nav continua ausente durante execucao.
- Ajustar textos, espacamentos e estados visuais quebrados.

Pronto quando:

- `pnpm test`, `pnpm lint`, `pnpm build` e `pnpm visual:check` passam.
- Capturas mobile relevantes foram atualizadas quando necessario.
- Nao ha texto cortado, card redundante ou controle pequeno demais na execucao.

## Ordem recomendada

1. `Execucao 1`: limpeza visual de baixo risco.
2. `Execucao 2`: registro por exercicio e remocao de RIR.
3. `Execucao 3`: documentacao canonica.
4. `Execucao 4`: regressao mobile e ajustes finos.

Se a `Execucao 2` exigir mudancas de storage maiores que o esperado, separar em:

- `2A`: UI e draft local de registro por exercicio.
- `2B`: persistencia, historico e testes.

## Prompt base para proximas execucoes

```text
Use AGENTS.md, docs/arquitetura/arquitetura-prompt.md, docs/arquitetura/ux-prototipo-aprovado.md, docs/ajustes/plano-correcoes-prototipo.md e docs/ajustes/plano-execucoes-ux-03-04-registro-por-exercicio.md como referencia.
Objetivo: executar a [Execucao N - nome] do plano de ajustes UX-03/UX-04.
Restricoes: PWA primeiro, dados 100% locais, sem backend remoto, sem novas dependencias de producao sem aprovacao, manter servicos/repositorios existentes quando possivel.
Pronto quando: cumprir os criterios da execucao, rodar os checks relevantes e atualizar capturas/testes mobile quando a execucao envolver UI.
```
