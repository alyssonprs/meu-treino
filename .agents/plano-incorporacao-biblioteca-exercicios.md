# Plano de incorporacao da biblioteca de exercicios

## Objetivo

Incorporar a base de exercicios e as midias do repositorio
`hasaneyldrm/exercises-dataset` no `meu-treino`, preservando a estrutura atual
do guia visual:

- painel recolhido por padrao;
- abertura por `Ver como fazer`;
- musculo principal, musculos auxiliares e ate 3 dicas curtas;
- imagem ou GIF somente quando houver correspondencia especifica validada;
- funcionamento offline e 100% local;
- sem backend, login, cloud sync ou busca remota em tempo de uso.
- nenhuma URL do repositorio externo, GitHub, raw.githubusercontent.com, CDN ou
  qualquer origem remota pode ser acessada durante a execucao do aplicativo.

O desafio central e garantir o elo:

```text
prompt + JSON modelo + catalogo de exercicios suportados
  -> JSON final do treino com exercise_id e visual_id corretos
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
- qualquer midia selecionada para um exercicio precisa estar copiada no
  repositorio antes do `visual_id` ser considerado ativo.

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
      "aliases_pt": ["supino reto com barra", "supino reto barra"],
      "exercise_ids": ["supino-reto-barra"],
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
- `exercise_ids` sao os IDs que nosso JSON de treino deve usar para reaproveitar
  historico e encontrar a midia.
- `aliases_pt` existe para orientar prompt, revisao humana e futuras buscas.
- `instructions` e `instruction_steps` nao entram nessa base.

### Midias

Nao colocar `index.html`, `setup.html`, README nem exemplos do repositorio
externo no app.

Diretorio sugerido para a primeira leva:

```text
public/exercise-media/images/
public/exercise-media/videos/
```

Racional:

- arquivos em `public/` podem ser servidos por caminho estavel sem inflar imports
  TypeScript;
- o catalogo aponta para caminhos locais;
- o service worker pode cachear sob demanda ou precachear uma lista controlada;
- evita importar 1.324 GIFs diretamente no bundle inicial.

Importacao completa dos 1.324 exercicios so deve acontecer depois de medir o
tamanho total. A primeira execucao deve importar uma leva pequena e validada.
Mesmo nessa leva pequena, toda midia usada deve ser copiada para o nosso
repositorio; nao pode haver referencia remota no catalogo final.

## Fluxo de ligacao prompt -> JSON -> midia

1. O app passa a disponibilizar um terceiro arquivo para download:

```text
meu-treino-catalogo-exercicios.json
```

Esse arquivo e gerado a partir de `exercise-media-library.json`, contendo apenas
o que a IA precisa para escolher IDs:

```json
[
  {
    "visual_id": "exdb_0025",
    "exercise_id": "supino-reto-barra",
    "name_pt": "Supino reto com barra",
    "source_name": "barbell bench press",
    "equipment": "barbell",
    "target": "pectorals",
    "movement_pattern": "horizontal_push"
  }
]
```

2. O prompt deve instruir:

- quando o exercicio escolhido existir no catalogo, usar exatamente o
  `exercise_id` e o `visual_id` do catalogo;
- se houver duvida entre variantes, omitir `visual_id` e manter musculos/dicas;
- nunca inventar `visual_id`;
- preferir nomes de exercicios em portugues, mas preservar IDs do catalogo.

3. O JSON modelo deve demonstrar alguns exercicios com `visual_id` real da
primeira leva importada.

4. A validacao/importacao deve aceitar JSON sem `visual_id`, mas deve detectar
`visual_id` desconhecido:

- opcao inicial: importar normalmente e mostrar fallback sem imagem;
- melhoria recomendada: exibir aviso no preview de importacao com a contagem de
  `visual_id` desconhecidos.

5. Durante o treino, o resolver faz:

```text
exercise.visual_id conhecido -> midia local
sourceExerciseId/exercise_id com alias exato -> midia local
sem correspondencia -> musculos + dicas, sem imagem
```

`movement_pattern` nunca escolhe imagem sozinho.

## Execucoes sugeridas

### E1 - Auditoria do dataset e decisao de licenca

Objetivo: confirmar se podemos usar as midias e entender o peso real da base.

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
- ha estimativa de tamanho total e tamanho da primeira leva;
- esta claro que `index.html`, `setup.html`, README e instrucoes nao entram no
  app.

Checks:

```powershell
git diff --check
```

### E2 - Criar base derivada enxuta e script de importacao

Objetivo: gerar uma base local limpa com metadados minimos e sem instrucoes.

Contexto necessario:

- este plano;
- `.agents/inventario-exercises-dataset.md`;
- `src/config/exercise-guide-catalog.json`;
- `src/domain/workoutPlan.ts`.

Entregas:

- script em `scripts/import-exercise-media-library.mjs` ou equivalente;
- `src/config/exercise-media-library.json` com primeira leva;
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

### E3 - Mapear exercicios do app para midias reais

Objetivo: resolver o elo entre os exercicios gerados no JSON de treino e as
midias da biblioteca.

Contexto necessario:

- este plano;
- `src/assets/meu-treino-modelo.json`;
- `src/assets/prompt-treino-modelo.md`;
- `src/config/exercise-media-library.json`;
- `src/features/workouts/exerciseGuides.ts`;
- treinos reais ja usados no app, quando disponiveis.

Entregas:

- tabela de aliases aprovados por humano;
- primeira leva de exercicios suportados, priorizando:
  - supino reto com barra;
  - supino com halteres;
  - remada curvada;
  - puxada na polia;
  - barra fixa;
  - triceps corda;
  - rosca direta;
  - elevacao lateral;
  - terra romeno/stiff;
  - leg press;
  - hip thrust;
  - prancha;
  - exercicios que aparecerem nos treinos reais do usuario.

Arquivos provaveis:

- `src/config/exercise-media-library.json`;
- `src/config/exercise-guide-catalog.json`;
- `src/features/workouts/exerciseGuides.test.ts`;
- `.agents/mapeamento-exercicios-midias.md`.

Regras de mapeamento:

- alias exato e aprovado > correspondencia automatica;
- fuzzy matching pode sugerir, mas nao deve entrar no app sem revisao;
- variantes diferentes nao compartilham midia;
- duplicidade de midia so e aceita quando representar exatamente a mesma
  execucao.

Criterios de aceite:

- cada `exercise_id` aprovado aponta para um unico `visual_id`;
- cada `visual_id` aponta para midias existentes;
- nenhum alias amplo causa imagem errada em exercicio diferente;
- ha teste cobrindo alias, asset ausente e fallback sem imagem.

Checks:

```powershell
pnpm test -- exerciseGuides
pnpm build
```

### E4 - Copiar e servir a primeira leva de midias

Objetivo: adicionar somente as imagens/GIFs aprovados na primeira leva.

Contexto necessario:

- este plano;
- `.agents/mapeamento-exercicios-midias.md`;
- `public/sw.js`;
- `src/features/workouts/ActiveWorkoutScreen.tsx`;
- `src/features/workouts/exerciseGuideCatalog.ts`;
- `src/features/workouts/exerciseGuides.ts`.

Entregas:

- arquivos em `public/exercise-media/images/` e
  `public/exercise-media/videos/`;
- resolver retornando `imageUrl` e/ou `animationUrl`;
- UI exibindo GIF quando houver e imagem estatica como fallback;
- service worker sem precache massivo da biblioteca inteira.
- checagem garantindo que o catalogo de midias nao contenha `http://`,
  `https://`, `github.com` ou `raw.githubusercontent.com`.

Arquivos provaveis:

- `public/exercise-media/images/*`;
- `public/exercise-media/videos/*`;
- `src/features/workouts/exerciseGuideCatalog.ts`;
- `src/features/workouts/exerciseGuides.ts`;
- `src/features/workouts/ActiveWorkoutScreen.tsx`;
- `public/sw.js`.

Criterios de aceite:

- a primeira leva aparece corretamente no painel `Ver como fazer`;
- exercicios sem correspondencia continuam sem imagem;
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

Objetivo: garantir que a IA consiga gerar um JSON final com IDs que ligam ao
catalogo de midias.

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
- prompt atualizado para exigir uso exato de `exercise_id` e `visual_id` do
  catalogo;
- modelo JSON com exemplos reais da primeira leva;
- texto deixando claro que IDs fora do catalogo devem ser omitidos.

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
- JSON gerado por IA tem caminho claro para usar IDs validos;
- app nao depende de instrucoes longas do dataset externo.

Checks:

```powershell
pnpm build
```

### E6 - Avisos na importacao e verificacao de qualidade

Objetivo: evitar que JSONs gerados com IDs invalidos silenciosamente parecam
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
- usuario e avisado quando o treino tem IDs sem midia;
- catalogo nao tem alias para asset inexistente;
- `movement_pattern` continua sem escolher imagem sozinho.

Checks:

```powershell
pnpm test
pnpm build
```

## Decisoes a nao repetir

- Nao usar imagem generica por `movement_pattern`.
- Nao aceitar alias amplo sem revisao humana.
- Nao importar `instructions` ou `instruction_steps` do dataset externo para o
  app.
- Nao copiar `index.html`, `setup.html`, README ou exemplos de backend/API do
  repositorio externo.
- Nao importar a biblioteca inteira de GIFs antes de medir peso e impacto no
  PWA.
- Nao usar URL remota como fonte de imagem/GIF durante a execucao do app.
- Nao depender do service worker para transformar asset remoto em asset local.

## Pronto quando

- Existe uma primeira leva de exercicios com midias especificas corretas.
- O usuario consegue baixar modelo, prompt e catalogo para gerar JSON com
  `visual_id` valido.
- O JSON importado consegue ligar `exercise_id`/`visual_id` a uma midia local.
- Exercicios sem correspondencia continuam usando apenas musculos e dicas.
- Nenhuma midia usada vem de URL remota em runtime.
- Os checks de catalogo, testes e build passam.
