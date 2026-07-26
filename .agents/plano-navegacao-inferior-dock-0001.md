# Navegação inferior — dock compacto 0001

## Objetivo

Aplicar a direção visual aprovada para a navegação principal: dock flutuante,
compacto e levemente translúcido, sem alterar os quatro destinos ou seus
comportamentos.

## Restrições

- Usar somente roles `md-*` e a semântica Material 3 existente.
- Preservar quatro alvos de toque de no mínimo 48 x 48 px.
- Manter contraste e foco visível nos temas claro e escuro.
- Não encobrir conteúdo ou ações fixas do shell.

## Concluído quando

- A barra aparece como um dock compacto com borda discreta, transparência e
  desfoque de fundo moderados.
- O estado ativo usa uma única superfície de destaque, sem fundos empilhados.
- `color:check`, lint, testes, build e verificação visual passam.
