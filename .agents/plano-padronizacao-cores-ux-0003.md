# Padronização de cores — referência UX-0003

## Objetivo

Manter UX-0001 a UX-0009 visualmente coerentes nos temas claro e escuro. A
UX-0003 é a referência da hierarquia de superfícies, estados de lista e foco;
ela não substitui os roles semânticos de aviso e erro.

## Contrato obrigatório

| Papel | Token e aplicação |
| --- | --- |
| Canvas do app | `bg-md-background` + `text-md-on-background` |
| Lista principal | `bg-md-surface-container` + `border-md-outline-variant` |
| Bloco de apoio | `bg-md-surface-container-low` |
| Card isolado | `bg-md-surface-container-lowest` + `border-md-outline-variant` |
| Texto principal e apoio | `text-md-on-surface` e `text-md-on-surface-variant` |
| Label informativo | `text-md-secondary` |
| Linha atual | `bg-md-secondary-container/40` + indicador `bg-md-primary` |
| Concluído, em andamento e pendente | `primary`, `secondary` e `on-surface-variant` |
| Atenção e erro | `tertiary-container` e `error-container` com seus `on-*` |
| Foco, hover e pressed | `ring-md-primary` e opacidades `--md-sys-state-*` |

`--exercise-media-canvas` é a única exceção de cor local: mantém a mídia de
exercício em canvas branco para preservar a imagem de origem.

## Inventário e aplicação

| UX | Superfícies e estados aplicados | Prioridade |
| --- | --- | --- |
| UX-0001 | cards, recomendação, textos auxiliares e atalhos | Alta |
| UX-0002 | lista de rotinas convertida ao padrão de lista UX-0003 | Alta |
| UX-0003 | referência compartilhada por `ListSurface` e status de linha | Alta |
| UX-0004 | conclusão usa `primary-container`; atenção preserva `tertiary` | Média |
| UX-0005 | histórico e cargas usam superfícies e textos explícitos | Alta |
| UX-0006 | blocos auxiliares e ação destrutiva seguem os roles semânticos | Média |
| UX-0007/UX-0008 | preview e erro usam containers `primary`, `tertiary` e `error` | Média |
| UX-0009 | badges e conclusão removem tints arbitrários em favor de containers | Alta |

Componentes transversais (`AppShell`, `Card`, `Button`, `Chip`, campos,
navegação, diálogos, avisos e timer) devem manter somente classes `md-*`.

## Prevenção

- Não usar `muted`, `info`, `primary`, `secondary`, `success`, `warning`,
  `destructive`, `background`, `foreground`, `card`, `border` ou `ring` como
  aliases de cor Tailwind.
- Não usar paletas Tailwind fixas nem hex/RGB/HSL em componentes.
- Usar `ListSurface`, `listRowClassName`, `listCurrentRowClassName` e
  `listStatusClassName` para listas equivalentes à UX-0003.
- Executar `pnpm color:check`, `pnpm lint`, `pnpm test` e `pnpm build` antes
  do handoff. Para mudanças visuais, executar também `pnpm visual:check` nos
  temas claro e escuro.

## Critérios de aceite

- Nenhuma classe de cor legada em `src`.
- Toda lista de rotinas, exercícios e histórico usa a mesma hierarquia de
  superfície, borda, foco, texto de apoio e estado atual.
- Os dois temas preservam os mesmos papéis semânticos e contraste adequado.
- A checagem automática bloqueia regressões de aliases e cores fixas.
