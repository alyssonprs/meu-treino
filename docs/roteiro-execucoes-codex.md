# Roteiro de execucoes no Codex

Este roteiro organiza o desenvolvimento do app `meu-treino` em execucoes pequenas. A ideia e economizar tokens, melhorar qualidade e manter cada mudanca facil de revisar.

Use sempre este padrao no inicio de cada prompt:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: [descrever uma entrega pequena].
Restricoes: PWA primeiro, Android preparado, dados 100% locais, sem backend remoto.
Pronto quando: [criterios objetivos de conclusao].
```

## Como usar

- Faca uma execucao por etapa.
- Deixe o Codex implementar, rodar checks e resumir o que mudou.
- Revise o diff antes de pedir a proxima etapa.
- Sempre que uma execucao for finalizada e validada, atualize este roteiro marcando a etapa com `Status: concluida em AAAA-MM-DD` e um resumo curto do que foi entregue.
- Se uma etapa ficar grande demais, peca para o Codex dividir em subetapas.
- Evite pedir "faca o app inteiro" em uma unica execucao.
- Antes de criar a interface final, aprove o fluxo e as telas em `docs/ux-prototipo-aprovado.md`.

## Execucao -1 - Prototipar UX antes do desenvolvimento

Objetivo: validar todas as telas principais antes de codar a interface.

Status: concluida em 2026-06-15. As telas `UX-01` a `UX-14` foram aprovadas em `docs/ux-prototipo-aprovado.md`.

Prompt sugerido:

```text
Use AGENTS.md, docs/arquitetura-prompt.md, docs/identidade-visual-opcoes.md e docs/ux-prototipo-aprovado.md como referencia.
Objetivo: conduzir a prototipacao UX da primeira versao, com mapa de telas, wireframes, prototipo visual e checklist de aprovacao.
Restricoes: nao crie codigo de aplicacao ainda; use o modelo Guiada como base; PWA primeiro; mobile-first.
Pronto quando: as telas principais estiverem desenhadas, revisadas e marcadas como aprovadas ou aprovadas com ajustes em docs/ux-prototipo-aprovado.md.
```

Notas:

- Use Excalidraw como ferramenta principal para os wireframes e prototipos iniciais.
- Use imagens geradas pelo Codex para explorar telas especificas antes de desenhar no Excalidraw.
- Use Penpot somente se for necessario um prototipo visual de alta fidelidade antes do codigo.
- So avance para a Execucao 1 quando as telas principais estiverem aprovadas.

## Execucao 0 - Preparar o projeto

Objetivo: confirmar que o repositorio tem os documentos de trabalho corretos.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: revisar a organizacao inicial do projeto e apontar se falta algum documento ou decisao antes de criar o app.
Restricoes: nao crie codigo de aplicacao ainda.
Pronto quando: houver uma lista curta de ajustes recomendados ou a confirmacao de que podemos iniciar o scaffold.
```

## Execucao 1 - Criar o scaffold PWA

Objetivo: criar o projeto base React + Vite + TypeScript.

Status: concluida em 2026-06-15. O scaffold React + Vite + TypeScript foi criado com Tailwind CSS, base shadcn/ui, lucide-react, estrutura inicial de pastas, scripts de verificacao e uma primeira tela mobile de estado vazio.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: criar o scaffold inicial do app com React, Vite, TypeScript, Tailwind CSS, shadcn/ui e lucide-react, preparado para PWA.
Restricoes: PWA primeiro, Android preparado depois, sem backend remoto e sem tela de marketing.
Pronto quando: o app abrir localmente, tiver estrutura inicial de pastas, scripts de build/lint quando viavel, e uma primeira tela mobile simples.
```

Notas:

- Esta etapa pode exigir instalacao de dependencias.
- Se o Codex pedir permissao para baixar pacotes, aprove apenas se o comando fizer sentido.

## Execucao 2 - Preparar PWA

Objetivo: deixar a instalabilidade PWA pronta desde cedo.

Status: concluida em 2026-06-15. A base PWA foi configurada com manifest, icones oficiais de `assets/identity`, service worker, registro em producao e cache offline inicial.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: configurar manifest, icones, service worker e suporte offline basico para PWA.
Restricoes: nao implementar regra de treino ainda; foque na base PWA.
Pronto quando: o build gerar uma PWA instalavel com manifest valido, usando os assets de `assets/identity`, e cache offline inicial.
```

## Execucao 3 - Design tokens e temas

Objetivo: preparar a base visual antes das telas principais.

Status: concluida em 2026-06-15. Foram criados tokens de tema em `src/theme`, suporte a tema claro/escuro com escuro como padrao, persistencia local da preferencia e controle simples de alternancia na tela inicial.

Prompt sugerido:

```text
Use AGENTS.md, docs/arquitetura-prompt.md e docs/identidade-visual-opcoes.md como referencia.
Objetivo: implementar tokens de design e suporte a tema claro/escuro.
Restricoes: tema escuro deve ser o padrao; tema claro baseado no modelo 2; tema escuro baseado no modelo 5; usar Tailwind/shadcn com tokens; nao espalhar cores fixas nos componentes.
Pronto quando: existir uma estrutura de tema em src/theme, variaveis CSS para claro/escuro, persistencia local da preferencia e um controle simples para alternar o tema.
```

## Execucao 4 - Preparar Capacitor Android

Objetivo: deixar o app pronto para virar APK no futuro.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: adicionar e configurar Capacitor para Android sem mudar o foco da primeira entrega PWA.
Restricoes: nao configurar iOS/App Store; manter Android como alvo nativo futuro.
Pronto quando: existir configuracao Capacitor, o comando de sync Android estiver documentado, e a estrutura estiver pronta para abrir no Android Studio quando necessario.
```

## Execucao 5 - Tipos e validacao do JSON

Objetivo: modelar o dominio do plano de treino.

Prompt sugerido:

```text
Use AGENTS.md, docs/arquitetura-prompt.md e o JSON modelo como referencia.
Objetivo: criar os tipos TypeScript e schemas Zod para validar o JSON de treino importado.
Restricoes: validar antes de gravar, manter tipos em src/domain, nao criar armazenamento ainda.
Pronto quando: houver schemas, tipos inferidos, mensagens de erro basicas e testes de validacao com JSON valido e invalido.
```

## Execucao 6 - Armazenamento local PWA

Objetivo: implementar a primeira persistencia real usando IndexedDB/Dexie.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: implementar repositorios locais para PWA usando IndexedDB/Dexie.
Restricoes: acesso ao banco deve passar por interfaces em src/storage; nao acoplar UI ao Dexie.
Pronto quando: for possivel salvar, consultar e substituir plano ativo localmente com testes ou verificacao automatizada.
```

## Execucao 7 - Importar treino e baixar modelo

Objetivo: criar o fluxo principal de entrada de dados.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: implementar importacao de JSON de treino, validacao, preview e substituicao do plano ativo; tambem disponibilizar download do JSON modelo.
Restricoes: tudo local no dispositivo; ao substituir plano, preservar historico de cargas existente.
Pronto quando: o usuario conseguir baixar o modelo, importar um JSON valido, ver preview e ativar o novo plano.
```

## Execucao 8 - Proxima rotina recomendada

Objetivo: implementar a logica de recomendacao da rotina.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: implementar controle da ultima rotina finalizada e recomendacao automatica da proxima rotina.
Restricoes: usar a ordem das rotinas do plano ativo; apos a ultima rotina, voltar para a primeira.
Pronto quando: a tela inicial mostrar a proxima rotina correta e existirem testes para primeiro treino, treino seguinte, ciclo reiniciado e rotina anterior ausente.
```

## Execucao 9 - Executar treino

Objetivo: permitir que o aluno registre um treino real.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: implementar a tela de execucao de treino com aquecimento, exercicios, series, carga, repeticoes, RIR, observacoes e finalizacao.
Restricoes: interface mobile-first, poucos toques durante o treino, dados locais.
Pronto quando: o usuario conseguir iniciar a rotina recomendada, registrar series e finalizar a sessao salvando tudo localmente.
```

## Execucao 10 - Historico de cargas

Objetivo: preservar e exibir evolucao de carga.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: implementar historico de cargas por exercicio e sugestao da ultima carga usada.
Restricoes: historico deve sobreviver a importacao de novo plano; matching por exercise_id ou chave canonica.
Pronto quando: exercicios ja realizados mostrarem ultima carga, maior carga e evolucao basica.
```

## Execucao 11 - Progresso do ciclo

Objetivo: mostrar quando esta na hora de gerar novo treino.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: implementar progresso do ciclo do plano ativo.
Restricoes: calcular treinos planejados com estimated_duration_weeks * days_per_week.
Pronto quando: a tela inicial mostrar treinos concluidos, total planejado e aviso de ciclo concluido.
```

## Execucao 12 - Ajustes mobile e revisao visual

Objetivo: polir a experiencia de uso no celular.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: revisar e melhorar layout mobile, estados vazios, carregamento, erros de importacao e usabilidade durante o treino.
Restricoes: nao adicionar landing page; manter interface direta para uso no treino.
Pronto quando: as telas principais estiverem responsivas, sem texto cortado, com estados vazios claros, fluxo principal ergonomico e boa aparencia nos temas claro e escuro.
```

## Execucao 13 - Build e pacote Android

Objetivo: validar o caminho para APK.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: validar o build PWA e preparar instrucoes de build Android com Capacitor.
Restricoes: nao publicar em loja; nao configurar iOS.
Pronto quando: o build web passar, o sync Android estiver funcional ou documentado, e houver instrucoes para gerar APK/AAB no Android Studio.
```

## Execucao 14 - Revisao final da primeira versao

Objetivo: revisar riscos antes de considerar a primeira versao pronta.

Prompt sugerido:

```text
Use AGENTS.md e docs/arquitetura-prompt.md como referencia.
Objetivo: fazer uma revisao de codigo e produto da primeira versao.
Restricoes: priorize bugs, perda de dados locais, falhas de importacao, problemas offline e regressoes mobile.
Pronto quando: houver uma lista de achados priorizados, correcoes aplicadas para problemas criticos e checks finais executados.
```

## Quando atualizar AGENTS.md

Atualize `AGENTS.md` quando uma regra precisar valer para todas as proximas execucoes, por exemplo:

- uma decisao de arquitetura mudou;
- o Codex repetiu o mesmo erro;
- surgiu um comando padrao de teste/build;
- uma dependencia foi escolhida oficialmente;
- uma regra de produto virou permanente.

## Quando atualizar arquitetura-prompt.md

Atualize `docs/arquitetura-prompt.md` quando a decisao afetar o produto ou a arquitetura, por exemplo:

- novo requisito funcional;
- nova regra de progresso ou carga;
- mudanca na estrategia PWA/Android;
- alteracao no modelo de dados;
- mudanca de escopo.

## Quando abrir nova thread

Use uma nova thread quando:

- a etapa for grande e independente;
- a thread atual estiver muito longa;
- voce quiser comparar duas abordagens;
- o Codex estiver preso em um caminho ruim.

Continue na mesma thread quando:

- for uma correcao pequena da etapa atual;
- voce quiser que o Codex aproveite o contexto imediato;
- estiver revisando o diff que acabou de ser criado.
