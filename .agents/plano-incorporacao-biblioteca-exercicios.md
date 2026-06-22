# Plano de incorporacao da biblioteca de exercicios

## Objetivo

Incorporar a base de exercicios e as midias do repositorio
`hasaneyldrm/exercises-dataset` no `meu-treino`, preservando a estrutura atual
do guia visual:

- painel recolhido por padrao;
- abertura por `Ver como fazer`;
- musculo principal, musculos auxiliares e ate 3 dicas curtas;
- imagem ou GIF somente quando houver `visual_id` existente no catalogo local;
- funcionamento offline e 100% local;
- sem backend, login, cloud sync ou busca remota em tempo de uso.
- nenhuma URL do repositorio externo, GitHub, raw.githubusercontent.com, CDN ou
  qualquer origem remota pode ser acessada durante a execucao do aplicativo.

O desafio central e garantir o elo:

```text
prompt + JSON modelo + catalogo de exercicios disponiveis
  -> JSON final do treino com nome do exercicio e visual_id correto
  -> resolver local encontra a midia correta do exercicio
```

## Contexto consultado

- `.agents/README.md`: planos executaveis ficam em `.agents/`, focados por
  frente de trabalho, com objetivo, contexto, arquivos provaveis, criterios de
  aceite e checks.
- Repositorio externo:
  `https://github.com/hasaneyldrm/exercises-dataset`.
- Estrutura publicada do dataset:
  - `data/exercises.json`: array com 1.324 exercicios;
  - `images/`: 1.324 thumbnails JPG;
  - `videos/`: 1.324 GIFs de demonstracao;
  - `index.html`, `setup.html` e README existem, mas nao devem ser incorporados
    ao nosso app.
- Campos uteis do dataset:
  - `id`, `name`, `category`, `body_part`, `equipment`, `muscle_group`,
    `secondary_muscles`, `target`, `image`, `gif_url`.
- Campos que nao queremos carregar para o app:
  - `instructions`, `instruction_steps`, `created_at`;
  - arquivos de browser/setup/documentacao do repositorio externo.

## Ponto de licenca

O README do repositorio informa uso educacional e de pesquisa nao comercial, e
diz que as imagens e videos pertencem aos respectivos detentores de copyright.

Antes de incorporar midias ao repositorio do app, confirmar uma decisao:

- se o app permanecer estritamente pessoal/educacional/nao comercial, registrar
  essa restricao no plano e seguir;
- se houver intencao de distribuicao comercial ou produto publico monetizado,
  nao incorporar essas midias e buscar fonte com licenca permissiva.

Essa verificacao e bloqueante para a execucao que copia arquivos de midia.

## Estado atual do app

- A UI do guia visual foi mantida.
- `movement_pattern` continua validado e usado para dicas padrao.
- `visual_id` continua aceito no JSON, mas nao ha IDs oficiais ativos.
- O app nao renderiza imagem baseada apenas em `movement_pattern`.
- `src/config/exercise-guide-catalog.json` ficou como catalogo de dicas e como
  ponto futuro para registrar assets especificos validados.
- O prompt atual orienta a omitir `visual_id` quando nao houver ID oficial.

## Direcao de arquitetura

### Regra de midia local

Toda midia do `hasaneyldrm/exercises-dataset` que for usada pelo app deve ser
importada para dentro deste repositorio.

Regras:

- o app nunca deve renderizar `image`, `gif_url`, `media_url` ou qualquer outro
  campo apontando para URL remota desse dataset;
- cachear uma URL remota no service worker nao e suficiente;
- o catalogo em runtime deve apontar apenas para caminhos locais versionados no
  nosso repositorio, como `/exercise-media/...`;
- scripts de importacao podem acessar o repositorio externo durante o
  desenvolvimento, mas o build gerado e a aplicacao em execucao nao podem
  depender desse acesso;
- qualquer midia de exercicio disponivel no catalogo precisa estar copiada no
  repositorio antes do `visual_id` ser considerado ativo;
- o dataset `hasaneyldrm/exercises-dataset` sera tratado como fonte consolidada
  para o vinculo entre `source_id`, `source_name`, imagem e GIF. Nao sera feita
  avaliacao semantica manual da midia exercicio por exercicio.

### Dados internos

Criar uma base local derivada e enxuta, sem instrucoes:

```text
src/config/exercise-media-library.json
```

Formato sugerido:

```json
{
  "source": {
    "repo": "hasaneyldrm/exercises-dataset",
    "commit": "<sha-do-commit-usado>",
    "license_note": "educational and non-commercial only"
  },
  "exercises": [
    {
      "visual_id": "exdb_0025",
      "source_id": "0025",
      "source_name": "barbell bench press",
      "body_part": "chest",
      "target": "pectorals",
      "secondary_muscles": ["triceps", "shoulders"],
      "equipment": "barbell",
      "movement_pattern": "horizontal_push",
      "image_asset": "exercise-media/images/0025-EIeI8Vf.jpg",
      "animation_asset": "exercise-media/videos/0025-EIeI8Vf.gif"
    }
  ]
}
```

Regras:

- `visual_id` e interno do nosso app, derivado do dataset com prefixo `exdb_`.
- `source_id` preserva o ID original do dataset.
- `source_name` preserva o nome oficial do dataset e e a referencia principal
  para a IA escolher o exercicio.
- `aliases_pt` e `exercise_ids` podem existir no futuro para ajustes finos, mas
  nao sao obrigatorios para a importacao inicial da biblioteca inteira.
- `instructions` e `instruction_steps` nao entram nessa base.

### Midias

Nao colocar `index.html`, `setup.html`, README nem exemplos do repositorio
externo no app.

Diretorio sugerido para a biblioteca local:

```text
public/exercise-media/images/
public/exercise-media/videos/
```

Racional:

- arquivos em `public/` podem ser servidos por caminho estavel sem inflar imports
  TypeScript;
- o catalogo aponta para caminhos locais;
- o service worker deve cachear sob demanda, sem precachear a biblioteca inteira;
- evita importar 1.324 GIFs diretamente no bundle inicial.
- a UI deve carregar midia de forma preguicosa: JPG estatico primeiro, GIF
  somente quando o usuario abrir o painel `Ver como fazer`.

A direcao aprovada e importar a biblioteca inteira. A E1 ainda deve medir o
tamanho total para registrar impacto em PWA, Git e deploy. Se a aplicacao ficar
lenta, pesada demais ou ruim de manter, uma execucao futura pode remover lotes
menos usados. Mesmo importando tudo, nao pode haver referencia remota no
catalogo final.

## Fluxo de ligacao prompt -> JSON -> midia

1. O app passa a disponibilizar um terceiro arquivo para download:

```text
meu-treino-catalogo-exercicios.json
```

Esse arquivo e gerado a partir de `exercise-media-library.json`, contendo uma
lista resumida do que a IA precisa para escolher a midia:

```json
[
  {
    "visual_id": "exdb_0025",
    "name": "barbell bench press"
  }
]
```

Esse e o formato minimo preferido para reduzir tamanho e custo de contexto. Se
os testes de geracao mostrarem ambiguidades demais, o catalogo auxiliar pode
incluir campos curtos adicionais, como `equipment`, `body_part` e `target`, sem
incluir instrucoes longas nem caminhos de arquivos.

2. O prompt deve instruir:

- quando o exercicio escolhido existir no catalogo, usar exatamente o
  `visual_id` do catalogo;
- se houver duvida entre variantes, omitir `visual_id` e manter musculos/dicas;
- nunca inventar `visual_id`;
- preferir nomes de exercicios em portugues no treino final, mas preservar o
  `visual_id` do catalogo.

3. O JSON modelo pode demonstrar alguns exercicios com `visual_id` real da
biblioteca importada, mas o modelo oficial nao deve ser usado como base para
priorizar quais midias entram no repositorio.

4. A validacao/importacao deve aceitar JSON sem `visual_id`, mas deve detectar
`visual_id` desconhecido:

- opcao inicial: importar normalmente e mostrar fallback sem imagem;
- melhoria recomendada: exibir aviso no preview de importacao com a contagem de
  `visual_id` desconhecidos.

5. Durante o treino, o resolver faz:

```text
exercise.visual_id conhecido -> midia local
sourceExerciseId/exercise_id com correspondencia exata futura -> midia local
sem correspondencia -> musculos + dicas, sem imagem
```

`movement_pattern` nunca escolhe imagem sozinho.

## Execucoes sugeridas

### E1 - Auditoria do dataset e decisao de licenca

Objetivo: confirmar se podemos usar as midias e entender o peso real da base.

Status: concluida em 2026-06-21. Resultado registrado em
`.agents/inventario-exercises-dataset.md`.

Decisao de licenca: usar as midias do `hasaneyldrm/exercises-dataset` somente
em contexto pessoal, educacional, de pesquisa, demonstracao ou outro uso
estritamente nao comercial. Se o projeto virar produto comercial, monetizado ou
oferta publica comercial, nao incorporar essas midias e trocar por fonte com
licenca permissiva ou autorizacao explicita dos detentores.

Resumo da auditoria:

- commit origem: `f987a7b858d7987c3677e1073ee18b623895f615`;
- dataset: 1.324 exercicios, 1.324 imagens JPG e 1.324 GIFs;
- tamanho medido: `data/` 4,81 MiB, `images/` 8,46 MiB, `videos/` 122,78 MiB,
  total auditado 139,21 MiB sem `.git`;
- imagens/GIFs referenciados no JSON: 0 ausentes no checkout auditado;
- `index.html`, `setup.html`, README, `instructions`, `instruction_steps` e
  `created_at` nao entram no app.

Decisao de experiencia PWA: o tamanho da biblioteca completa e aceitavel apenas
se ela nao entrar no bundle inicial nem no precache do service worker. A
experiencia deve ser lazy: listas e cards usam metadados; o painel `Ver como
fazer` carrega imagem estatica local primeiro e so carrega GIF local sob demanda.
Se deploy, Git ou performance real ficarem ruins, reduzir a biblioteca para um
subconjunto dos exercicios mais comuns em execucao futura.

Contexto necessario:

- `AGENTS.md`;
- `.agents/README.md`;
- este plano;
- README do repositorio `hasaneyldrm/exercises-dataset`;
- `data/exercises.json` do repositorio externo.

Entregas:

- registrar o commit SHA do dataset usado como origem;
- registrar a decisao de licenca/uso nao comercial;
- medir quantidade e tamanho total de `data/`, `images/` e `videos/`;
- listar campos uteis e campos descartados;
- produzir `.agents/inventario-exercises-dataset.md` com resumo e riscos.

Arquivos provaveis:

- `.agents/inventario-exercises-dataset.md`;
- este plano, se a auditoria mudar a estrategia.

Criterios de aceite:

- ha decisao explicita sobre licenca antes de copiar midias;
- ha estimativa de tamanho total da biblioteca completa;
- esta claro que `index.html`, `setup.html`, README e instrucoes nao entram no
  app.

Checks:

```powershell
git diff --check
```

### E2 - Criar base derivada enxuta e script de importacao

Objetivo: gerar uma base local limpa com metadados minimos e sem instrucoes.

Status: concluida em 2026-06-21.

Resultado:

- script repetivel criado em `scripts/import-exercise-media-library.mjs`;
- base derivada criada em `src/config/exercise-media-library.json`;
- origem fixada no commit `f987a7b858d7987c3677e1073ee18b623895f615`;
- 1.324 exercicios gerados com `visual_id` no formato `exdb_<source_id>`;
- 1.324 caminhos locais de imagem e 1.324 caminhos locais de GIF registrados;
- 0 `visual_id` duplicados, 0 `source_id` duplicados, 0 `movement_pattern`
  fora do catalogo oficial e 0 assets remotos no catalogo derivado;
- `instructions`, `instruction_steps`, `created_at`, `gif_url`, URLs remotas e
  arquivos HTML/README do dataset externo nao entram na base derivada.

Observacao: `movement_pattern` e inferido por heuristica conservadora a partir
de nome, alvo, parte do corpo e equipamento. Ele serve para classificacao e
dicas; nao deve escolher imagem sozinho.

Contexto necessario:

- este plano;
- `.agents/inventario-exercises-dataset.md`;
- `src/config/exercise-guide-catalog.json`;
- `src/domain/workoutPlan.ts`.

Entregas:

- script em `scripts/import-exercise-media-library.mjs` ou equivalente;
- `src/config/exercise-media-library.json` com a biblioteca completa;
- nenhuma instrucao textual longa do dataset externo no app;
- IDs internos `visual_id` com prefixo `exdb_`.

Arquivos provaveis:

- `scripts/import-exercise-media-library.mjs`;
- `src/config/exercise-media-library.json`;
- `.agents/inventario-exercises-dataset.md`.

Criterios de aceite:

- a base derivada contem apenas metadados necessarios;
- cada registro tem `visual_id`, `source_id`, `source_name`, equipamento,
  musculos, caminho de imagem e caminho de GIF quando existir;
- o script e repetivel para atualizar a base a partir do mesmo commit origem.

Checks:

```powershell
pnpm build
```

### E3 - Gerar catalogo resumido para IA

Objetivo: permitir que a IA escolha exercicios disponiveis na biblioteca sem
precisar receber metadados longos nem caminhos de midia.

Status: concluida em 2026-06-21.

Resultado:

- script repetivel criado em `scripts/generate-ai-exercise-catalog.mjs`;
- comando `pnpm exercise-media:catalog` adicionado;
- `src/assets/meu-treino-catalogo-exercicios.json` gerado com 1.324 itens;
- cada item contem apenas `visual_id` e `name`;
- o catalogo resumido nao contem URL, caminho de midia, `.jpg` nem `.gif`;
- o prompt foi atualizado para orientar a IA a usar somente `visual_id`
  presente no catalogo resumido e omitir o campo em caso de duvida.

Contexto necessario:

- este plano;
- `src/assets/meu-treino-modelo.json`;
- `src/assets/prompt-treino-modelo.md`;
- `src/config/exercise-media-library.json`;
- `src/features/workouts/exerciseGuides.ts`.

Entregas:

- `src/assets/meu-treino-catalogo-exercicios.json` gerado com itens resumidos;
- formato minimo inicial: `visual_id` e `name`;
- opcionalmente incluir campos curtos como `equipment`, `body_part` e `target`
  se a geracao de treinos ficar ambigua demais;
- prompt atualizado para orientar que a IA escolha exercicios do catalogo e
  preserve exatamente o `visual_id`.

Arquivos provaveis:

- `src/config/exercise-media-library.json`;
- `src/assets/meu-treino-catalogo-exercicios.json`;
- `src/assets/prompt-treino-modelo.md`;
- `src/assets/meu-treino-modelo.json`;
- `src/features/workouts/exerciseGuides.test.ts`;
- `.agents/inventario-exercises-dataset.md`.

Regras:

- o dataset e a fonte de verdade para nome, `source_id`, imagem e GIF;
- nao avaliar visualmente cada midia para confirmar semantica do exercicio;
- nao criar aliases amplos automaticamente;
- nao exigir que o modelo oficial de 3 exercicios defina prioridade de
  importacao.

Criterios de aceite:

- cada item do catalogo resumido aponta para um `visual_id` existente;
- o catalogo resumido nao contem URL nem caminho de arquivo;
- o prompt instrui a IA a usar somente `visual_id` presente no catalogo;
- JSON com `visual_id` desconhecido continua caindo no fallback sem imagem.

Checks:

```powershell
pnpm test -- exerciseGuides
pnpm build
```

### E4 - Copiar e servir a biblioteca completa de midias

Objetivo: adicionar as imagens/GIFs do dataset inteiro ao repositorio e servi-las
como assets locais.

Contexto necessario:

- este plano;
- `.agents/inventario-exercises-dataset.md`;
- `public/sw.js`;
- `src/features/workouts/ActiveWorkoutScreen.tsx`;
- `src/features/workouts/exerciseGuideCatalog.ts`;
- `src/features/workouts/exerciseGuides.ts`.

Entregas:

- arquivos em `public/exercise-media/images/` e
  `public/exercise-media/videos/`;
- resolver retornando `imageUrl` e/ou `animationUrl`;
- UI exibindo imagem estatica primeiro e GIF somente quando o painel do guia
  estiver aberto;
- service worker sem precache massivo da biblioteca inteira.
- checagem garantindo que o catalogo de midias nao contenha `http://`,
  `https://`, `github.com` ou `raw.githubusercontent.com`.
- checagem garantindo que todos os assets referenciados no catalogo existem no
  repositorio.

Arquivos provaveis:

- `public/exercise-media/images/*`;
- `public/exercise-media/videos/*`;
- `src/features/workouts/exerciseGuideCatalog.ts`;
- `src/features/workouts/exerciseGuides.ts`;
- `src/features/workouts/ActiveWorkoutScreen.tsx`;
- `public/sw.js`.

Criterios de aceite:

- exercicios com `visual_id` conhecido aparecem corretamente no painel
  `Ver como fazer`;
- exercicios sem correspondencia continuam sem imagem;
- listas, Home e detalhe de rotina nao carregam GIFs;
- GIFs carregam apenas sob demanda quando o guia do exercicio esta aberto;
- imagem estatica funciona como preview/fallback antes do GIF;
- GIFs nao quebram layout mobile;
- bundle inicial nao cresce por import acidental de todas as midias.
- nenhuma midia usada no app e carregada de URL remota em runtime;
- todo asset usado por `image_asset` ou `animation_asset` existe no repositorio.

Checks:

```powershell
pnpm test -- exerciseGuides
pnpm build
rg -n "https?://|github.com|raw.githubusercontent.com" src/config public/exercise-media
```

### E5 - Atualizar prompt, modelo e downloads auxiliares

Objetivo: garantir que a IA consiga gerar um JSON final com `visual_id` que liga ao
catalogo de midias.

Status em 2026-06-21: concluida. O app baixa modelo, prompt e catalogo; o
prompt orienta anexar os tres arquivos e usar somente `visual_id` do catalogo;
o modelo JSON usa exemplos reais da biblioteca importada. Checks executados:
`pnpm build`, `pnpm test -- exerciseGuides`, `pnpm lint` e
`pnpm visual:check tests/visual/home-mobile.spec.ts`.

Contexto necessario:

- este plano;
- `src/assets/meu-treino-modelo.json`;
- `src/assets/prompt-treino-modelo.md`;
- `src/features/home/HomeScreen.tsx`;
- `src/features/settings/SettingsScreen.tsx`;
- `src/features/import-export/ImportErrorScreen.tsx`.

Entregas:

- `src/assets/meu-treino-catalogo-exercicios.json`;
- botoes/links de download do catalogo junto de modelo e prompt;
- prompt atualizado para exigir uso exato de `visual_id` do catalogo;
- modelo JSON com exemplos reais da biblioteca importada;
- texto deixando claro que `visual_id` fora do catalogo deve ser omitido.

Arquivos provaveis:

- `src/assets/meu-treino-catalogo-exercicios.json`;
- `src/assets/meu-treino-modelo.json`;
- `src/assets/prompt-treino-modelo.md`;
- `src/features/home/HomeScreen.tsx`;
- `src/features/settings/SettingsScreen.tsx`;
- `src/features/import-export/ImportErrorScreen.tsx`.

Criterios de aceite:

- usuario consegue baixar modelo, prompt e catalogo;
- prompt explica o processo de anexar os tres arquivos na geracao do treino;
- JSON gerado por IA tem caminho claro para usar `visual_id` valido;
- app nao depende de instrucoes longas do dataset externo.

Checks:

```powershell
pnpm build
```

### E6 - Avisos na importacao e verificacao de qualidade

Objetivo: evitar que JSONs gerados com `visual_id` invalido silenciosamente parecam
corretos.

Contexto necessario:

- este plano;
- `src/domain/workoutPlan.ts`;
- `src/services/workoutImportService.ts`;
- `src/features/import-export`;
- `src/config/exercise-media-library.json`.

Entregas:

- preview de importacao informa `visual_id` desconhecido quando existir;
- testes para JSON com `visual_id` valido, invalido e ausente;
- script/teste de consistencia do catalogo.

Arquivos provaveis:

- `src/services/workoutImportService.ts`;
- `src/features/import-export/*`;
- `src/features/workouts/exerciseGuides.test.ts`;
- `src/config/exercise-media-library.json`.

Criterios de aceite:

- `visual_id` desconhecido nao quebra importacao;
- usuario e avisado quando o treino tem `visual_id` sem midia;
- catalogo nao referencia asset inexistente;
- `movement_pattern` continua sem escolher imagem sozinho.

Checks:

```powershell
pnpm test
pnpm build
```

## Decisoes a nao repetir

- Nao usar imagem generica por `movement_pattern`.
- Nao criar alias amplo automaticamente.
- Nao importar `instructions` ou `instruction_steps` do dataset externo para o
  app.
- Nao copiar `index.html`, `setup.html`, README ou exemplos de backend/API do
  repositorio externo.
- Nao avaliar manualmente a semantica de cada GIF/imagem; confiar no vinculo
  interno do dataset e validar consistencia tecnica.
- Nao precachear a biblioteca inteira no service worker.
- Nao usar URL remota como fonte de imagem/GIF durante a execucao do app.
- Nao depender do service worker para transformar asset remoto em asset local.

## Pronto quando

- A biblioteca completa foi importada como assets locais ou houve decisao
  explicita posterior para reduzir o escopo por peso/performance.
- O usuario consegue baixar modelo, prompt e catalogo para gerar JSON com
  `visual_id` valido.
- O JSON importado consegue ligar `visual_id` a uma midia local.
- Exercicios sem correspondencia continuam usando apenas musculos e dicas.
- Nenhuma midia usada vem de URL remota em runtime.
- Os checks de catalogo, testes e build passam.
