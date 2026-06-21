# Inventario do exercises-dataset

## Escopo

Auditoria da E1 para avaliar o repositorio externo
`hasaneyldrm/exercises-dataset` antes de copiar qualquer midia para o
`meu-treino`.

Fonte auditada:

- Repositorio: https://github.com/hasaneyldrm/exercises-dataset
- Commit `main` auditado: `f987a7b858d7987c3677e1073ee18b623895f615`
- Data da auditoria: 2026-06-21
- Metodo: clone raso local em `.tmp/exercises-dataset-audit`, somente para
  medicao e inspecao.

## Decisao de licenca

Decisao: as midias desse dataset so podem ser usadas no app enquanto o projeto
permanecer em contexto pessoal, educacional, de pesquisa, demonstracao ou outro
uso estritamente nao comercial.

Motivo: o README do repositorio declara uso educacional e de pesquisa nao
comercial, proibe uso comercial e informa que imagens e videos pertencem aos
respectivos detentores de copyright. Nao ha arquivo de licenca permissiva no
repositorio auditado.

Implicacoes para o projeto:

- Pode seguir para E2/E3/E4 apenas se a distribuicao continuar nao comercial.
- Nao usar essas midias em produto comercial, app monetizado, assinatura,
  venda, publicidade paga ou oferta comercial.
- Antes de qualquer uso comercial, substituir esta fonte por uma biblioteca com
  licenca permissiva ou obter autorizacao dos detentores dos direitos.
- Manter atribuicao e nota de origem no catalogo derivado.
- Nao incorporar `instructions` ou `instruction_steps`; usar apenas metadados
  curtos e caminhos de assets locais.

Esta decisao nao e parecer juridico. E uma regra operacional conservadora para
evitar incorporar midias com restricao conhecida em escopos incompativeis.

## Tamanho e contagem

Medicao do checkout auditado, excluindo `.git`:

| Area | Arquivos | Tamanho |
| --- | ---: | ---: |
| `data/` | 1 | 4.81 MiB |
| `images/` | 1,324 | 8.46 MiB |
| `videos/` | 1,324 | 122.78 MiB |
| Total do conteudo auditado | 2,653 | 139.21 MiB |

Arquivos de apoio no repositorio externo:

| Arquivo | Tamanho |
| --- | ---: |
| `README.md` | 16.44 KiB |
| `index.html` | 3.09 MiB |
| `setup.html` | 58.28 KiB |
| `.gitignore` | 47 B |

Decisao para o app: `index.html`, `setup.html`, README e exemplos de integracao
nao entram no app. Eles servem apenas como documentacao da fonte.

## Integridade tecnica

Resumo do `data/exercises.json`:

- Registros: 1,324
- Imagens JPG referenciadas: 1,324
- GIFs referenciados: 1,324
- Imagens ausentes no checkout: 0
- GIFs ausentes no checkout: 0
- Extensoes de imagem: `.jpg`
- Extensoes de animacao: `.gif`

Campos encontrados no JSON:

- `id`
- `name`
- `category`
- `body_part`
- `equipment`
- `instructions`
- `instruction_steps`
- `muscle_group`
- `secondary_muscles`
- `target`
- `image`
- `gif_url`
- `created_at`

Campos uteis para a base derivada:

- `id`: origem para `source_id` e `visual_id` interno com prefixo `exdb_`.
- `name`: nome oficial da fonte.
- `category` e `body_part`: classificacao geral.
- `equipment`: equipamento.
- `muscle_group`, `secondary_muscles` e `target`: musculos e alvo.
- `image` e `gif_url`: caminhos relativos para copiar midias como assets
  locais.

Campos descartados:

- `instructions`
- `instruction_steps`
- `created_at`

Motivo do descarte: evitar trazer textos longos e instrucoes externas para o
runtime do app; o app ja usa dicas curtas vindas do JSON importado ou fallback
local por `movement_pattern`.

## Cobertura do dataset

Registros por `body_part`:

| Body part | Exercicios |
| --- | ---: |
| `upper arms` | 292 |
| `upper legs` | 227 |
| `back` | 203 |
| `waist` | 169 |
| `chest` | 163 |
| `shoulders` | 143 |
| `lower legs` | 59 |
| `lower arms` | 37 |
| `cardio` | 29 |
| `neck` | 2 |

Principais equipamentos por volume:

| Equipment | Exercicios |
| --- | ---: |
| `body weight` | 325 |
| `dumbbell` | 294 |
| `cable` | 157 |
| `barbell` | 154 |
| `leverage machine` | 81 |
| `band` | 54 |
| `smith machine` | 48 |
| `kettlebell` | 41 |
| `weighted` | 36 |
| `stability ball` | 28 |
| `ez barbell` | 23 |
| `sled machine` | 15 |
| `assisted` | 15 |
| `medicine ball` | 13 |
| `rope` | 10 |

## Riscos

- Licenca: nao permissiva para uso comercial. Este e o principal bloqueio para
  qualquer monetizacao futura.
- Copyright de midia: o repositorio externo informa que imagens e videos
  pertencem aos respectivos detentores. A fonte pode receber pedidos de remocao.
- Peso do repositorio: importar a biblioteca completa adiciona cerca de 131 MiB
  apenas em imagens e GIFs, antes de overhead de Git e deploy.
- PWA: nao precachear a biblioteca inteira no service worker; as midias devem
  ser cacheadas sob demanda.
- UX/performance: GIFs podem pesar no carregamento da tela de treino; a UI deve
  carregar somente a midia do exercicio aberto e manter fallback estatico quando
  necessario.
- Qualidade semantica: a E1 validou consistencia tecnica, nao revisao manual de
  cada imagem/GIF.

## Decisoes para proximas execucoes

- E2 pode gerar `src/config/exercise-media-library.json` a partir do commit
  auditado, sem instrucoes longas e com nota de uso nao comercial.
- E4 so pode copiar midias como assets locais em `public/exercise-media/`.
- O app nunca deve usar `image`, `gif_url`, `media_url` ou URL remota em
  runtime.
- Se o escopo mudar para comercial, interromper a incorporacao deste dataset e
  substituir a fonte.
