# Plano de guias visuais de exercicios

## Objetivo

Garantir que o usuario consiga reconhecer o exercicio durante o treino mesmo quando nao conhece o nome.

A solucao deve:

- funcionar offline;
- continuar 100% local;
- nao depender de backend, camera, video remoto ou GIF pesado;
- usar o JSON como fonte de decisao;
- manter a tela de treino simples, com o guia recolhido por padrao;
- mostrar uma representacao visual para a maioria dos exercicios importados.

## Decisao de produto

Usar uma estrategia hibrida:

1. Imagem especifica por `visual_id`, quando existir asset local para aquele exercicio.
2. Imagem generica por `movement_pattern`, quando nao houver `visual_id`.
3. Musculos e dicas do JSON como ultimo fallback.

Ordem de resolucao:

```text
1. Se exercise.visual_id existir e estiver no catalogo: usar imagem especifica.
2. Senao, se exercise_id tiver mapeamento conhecido: usar imagem especifica.
3. Senao, se movement_pattern tiver imagem generica: usar imagem generica.
4. Senao, mostrar musculos principais, musculos secundarios e dicas.
```

## Como devem ser as imagens genericas

As imagens genericas nao representam um exercicio exato. Elas representam familias de movimento.

Caracteristicas:

- corpo simplificado e nao identificavel;
- pouco detalhe humano;
- musculo principal destacado;
- musculos auxiliares em cor mais fria e menos intensa;
- seta clara indicando direcao do movimento;
- sem cenario de academia;
- sem texto dentro da imagem, para evitar problemas de legibilidade e internacionalizacao;
- proporcao consistente, preferencialmente quadrada ou 4:3;
- arquivo compacto em `webp` sempre que possivel.

Exemplos:

- `horizontal_push`: supino, chest press, flexao.
- `horizontal_pull`: remada baixa, remada curvada, remada unilateral.
- `vertical_push`: desenvolvimento militar, desenvolvimento com halteres.
- `vertical_pull`: puxada aberta, barra fixa.
- `hinge`: terra romeno, stiff.
- `elbow_flexion`: rosca direta, rosca martelo, rosca Scott.
- `elbow_extension`: triceps corda, triceps testa, triceps frances.

## Meta de peso dos assets

Meta inicial:

- imagens genericas: 20 KB a 60 KB por arquivo;
- imagens especificas: 30 KB a 90 KB por arquivo;
- primeira leva generica: ate 1 MB total;
- catalogo especifico inicial: ate 3 MB total.

Se uma imagem passar muito desses limites, otimizar antes de incluir no app.

Formato preferido:

- `webp` para novos assets;
- `jpg` apenas quando o resultado ficar menor ou melhor;
- evitar `png` para ilustracao final, salvo quando transparencia for realmente necessaria.

## Local dos arquivos

Sugestao de estrutura:

```text
src/assets/exercise-guides/
  specific/
    barbell-bench-press.webp
    dumbbell-bench-press.webp
  generic/
    horizontal-push.webp
    horizontal-pull.webp
    vertical-push.webp
    vertical-pull.webp
```

O codigo de resolucao deve continuar em:

```text
src/features/workouts/exerciseGuides.ts
```

Se o catalogo crescer, extrair dados para:

```text
src/features/workouts/exerciseGuideCatalog.ts
```

## Execucoes separadas

### Execucao 1 - Consolidar contrato e catalogo inicial

Objetivo:

- deixar explicito no codigo e nos docs quais `movement_pattern` sao suportados;
- preparar o resolver para imagem generica por padrao de movimento;
- nao gerar muitas imagens ainda.

Contexto necessario:

- `AGENTS.md`;
- `docs/arquitetura/arquitetura-prompt.md`;
- `docs/arquitetura/ux-prototipo-aprovado.md`;
- `src/features/workouts/exerciseGuides.ts`;
- `src/features/workouts/exerciseGuides.test.ts`;
- `src/domain/workoutPlan.ts`;
- `src/assets/prompt-treino-modelo.md`;
- este documento.

Arquivos provaveis:

- `src/features/workouts/exerciseGuides.ts`;
- `src/features/workouts/exerciseGuides.test.ts`;
- `src/assets/prompt-treino-modelo.md`;
- `docs/arquitetura/arquitetura-prompt.md`.

Entregas:

- criar uma lista oficial de `movement_pattern` suportados;
- ajustar o resolver para procurar imagem generica quando nao houver `visual_id`;
- criar testes cobrindo a ordem de resolucao;
- atualizar o prompt para dizer que `movement_pattern` e o fallback visual principal.

Criterios de aceite:

- exercicio sem `visual_id`, mas com `movement_pattern` suportado, retorna guia com `imageUrl`;
- exercicio com `visual_id` conhecido continua usando imagem especifica;
- exercicio sem asset ainda mostra musculos e dicas;
- testes passam.

Checks:

```powershell
pnpm test -- exerciseGuides
pnpm build
```

### Execucao 2 - Criar primeira leva de imagens genericas

Objetivo:

- adicionar imagens genericas suficientes para cobrir os exercicios mais comuns.

Primeira leva:

- `horizontal_push`;
- `horizontal_pull`;
- `vertical_push`;
- `vertical_pull`;
- `squat`;
- `hinge`;
- `elbow_flexion`;
- `elbow_extension`.

Contexto necessario:

- `src/features/workouts/exerciseGuides.ts`;
- `.agents/plano-guias-visuais-exercicios.md`;
- `docs/arquitetura/ux-prototipo-aprovado.md`;
- assets existentes em `src/assets/exercise-guides`.

Arquivos provaveis:

- `src/assets/exercise-guides/generic/*.webp`;
- `src/features/workouts/exerciseGuides.ts`;
- `src/features/workouts/exerciseGuides.test.ts`.

Como executar:

- gerar ou desenhar as 8 imagens no mesmo estilo visual;
- otimizar cada imagem;
- registrar cada import no catalogo;
- validar no app em viewport mobile.

Criterios de aceite:

- todos os 8 padroes retornam imagem;
- imagens sao legiveis em tela de celular;
- nao ha texto cortado, watermark ou cenario poluido;
- build continua com tamanho aceitavel.

Checks:

```powershell
pnpm test -- exerciseGuides
pnpm build
```

### Execucao 3 - Cobrir padroes extras do treino real

Objetivo:

- cobrir os padroes que aparecem no JSON real de treino importado e nao entram na primeira leva.

Segunda leva:

- `lunge`;
- `hip_thrust`;
- `leg_extension`;
- `leg_curl`;
- `calf_raise`;
- `shoulder_abduction`;
- `core_flexion`;
- `core_anti_extension`;
- `core_rotation`.

Contexto necessario:

- JSON real usado no teste manual, se disponivel;
- `src/assets/prompt-treino-modelo.md`;
- `src/features/workouts/exerciseGuides.ts`;
- este documento.

Arquivos provaveis:

- `src/assets/exercise-guides/generic/*.webp`;
- `src/features/workouts/exerciseGuides.ts`;
- `src/features/workouts/exerciseGuides.test.ts`;
- `src/assets/prompt-treino-modelo.md`.

Entregas:

- adicionar imagens genericas para os 9 padroes extras;
- atualizar o prompt com a lista completa de padroes suportados;
- testar importacao de um JSON que usa esses padroes.

Criterios de aceite:

- o treino real importado passa a mostrar representacao visual na maioria dos exercicios;
- nenhum exercicio depende de `visual_id` inventado;
- o prompt informa exatamente os padroes disponiveis.

Checks:

```powershell
pnpm test
pnpm build
```

### Execucao 4 - Catalogo especifico inicial por exercicio

Objetivo:

- melhorar os exercicios mais frequentes com imagens especificas, mantendo o fallback generico para o restante.

Prioridade inicial sugerida:

- `barbell_bench_press`: supino reto com barra;
- `dumbbell_bench_press`: supino com halteres;
- `barbell_row`: remada curvada;
- `lat_pulldown`: puxada na polia;
- `pull_up`: barra fixa;
- `rope_triceps_pushdown`: triceps corda;
- `barbell_biceps_curl`: rosca direta;
- `lateral_raise`: elevacao lateral;
- `romanian_deadlift`: terra romeno;
- `leg_press`: leg press;
- `hip_thrust`: hip thrust;
- `plank`: prancha.

Contexto necessario:

- lista de exercicios reais mais usados;
- `src/assets/prompt-treino-modelo.md`;
- `src/assets/meu-treino-modelo.json`;
- `src/features/workouts/exerciseGuides.ts`;
- este documento.

Arquivos provaveis:

- `src/assets/exercise-guides/specific/*.webp`;
- `src/features/workouts/exerciseGuideCatalog.ts`;
- `src/features/workouts/exerciseGuides.ts`;
- `src/features/workouts/exerciseGuides.test.ts`;
- `src/assets/meu-treino-modelo.json`;
- `src/assets/prompt-treino-modelo.md`.

Entregas:

- criar assets especificos compactos;
- mapear `visual_id` para cada asset;
- atualizar modelo JSON com exemplos reais;
- atualizar prompt com a lista oficial de `visual_id` disponiveis.

Criterios de aceite:

- exercicios com `visual_id` usam imagem especifica;
- exercicios sem `visual_id` continuam com fallback generico;
- prompt deixa claro que a IA so pode usar IDs listados;
- modelo JSON demonstra pelo menos alguns IDs especificos.

Checks:

```powershell
pnpm test
pnpm build
```

### Execucao 5 - Validacao visual no fluxo de treino

Objetivo:

- garantir que o guia visual ajuda durante a execucao e nao atrapalha o registro do treino.

Contexto necessario:

- `src/features/workouts/ActiveWorkoutScreen.tsx`;
- testes visuais existentes;
- `docs/arquitetura/ux-prototipo-aprovado.md`;
- este documento.

Arquivos provaveis:

- `tests/visual/home-mobile.spec.ts`;
- `src/features/workouts/ActiveWorkoutScreen.tsx`;
- CSS/tokens se houver ajuste visual.

Entregas:

- validar guia fechado por padrao;
- validar abertura por `Ver como fazer`;
- validar imagem especifica e generica;
- validar tema claro e escuro quando possivel.

Criterios de aceite:

- painel nao ocupa espaco quando fechado;
- ao abrir, imagem fica legivel em mobile;
- musculo principal e secundarios aparecem com hierarquia visual correta;
- dicas seguem limite de ate 3;
- nao ha quebra de layout.

Checks:

```powershell
pnpm visual:check
pnpm build
```

## Prompt para proximas execucoes

Use este modelo para pedir uma etapa especifica:

```text
Use AGENTS.md, docs/arquitetura/arquitetura-prompt.md,
docs/arquitetura/ux-prototipo-aprovado.md e
.agents/plano-guias-visuais-exercicios.md.

Objetivo: executar a etapa [numero e nome] do plano de guias visuais.
Restricoes: manter app offline/local, nao adicionar backend, manter guia recolhido por padrao,
usar assets compactos e atualizar testes/docs quando necessario.
Pronto quando: criterios de aceite da etapa estiverem cumpridos e os checks indicados passarem.
```

## Riscos e decisoes

- Nao tentar cobrir todos os exercicios do mundo na primeira versao.
- Nao depender de GIFs por causa de peso, manutencao e consistencia visual.
- Nao permitir que a IA invente `visual_id`.
- Priorizar fallback generico por `movement_pattern`, porque ele cobre muitos exercicios com poucos assets.
- Expandir imagens especificas com base nos exercicios que aparecem nos treinos reais.

## Estado atual

- Ja existe imagem especifica para `barbell_bench_press`.
- O guia visual ja fica recolhido por padrao e abre por `Ver como fazer`.
- O JSON ja aceita `primary_muscles`, `secondary_muscles`, `movement_pattern`, `visual_id` e `execution_cues`.
- O proximo passo recomendado e a Execucao 1.
