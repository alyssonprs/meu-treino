# Identidade visual

O app `meu-treino` usa somente dois temas selecionaveis: claro e escuro. O tema escuro e o padrao na primeira abertura. Os tokens implementados em `src/theme/tokens.css` sao a fonte de verdade das cores.

## Assets oficiais de identidade

A identidade visual aprovada possui arquivos prontos em `assets/identity`.

Usar esses arquivos como fonte oficial para marca, logo, icones de instalacao, Android adaptive icon e splash screens:

- `brand-mark.svg`
- `logo-horizontal.svg`
- `app-icon-source.png`
- `pwa-icon-any-192.png`
- `pwa-icon-any-512.png`
- `pwa-icon-maskable-512.png`
- `pwa-icon-maskable-1024.png`
- `android-icon-foreground.png`
- `android-icon-background.png`
- `android-icon-monochrome.svg`
- `splash.png`
- `splash-dark.png`

Regra: nao criar uma nova identidade visual, novos icones de marca ou novas imagens promocionais quando esses arquivos atenderem ao uso. Para icones internos da interface, como navegacao, acoes, treino, historico, importar e configuracoes, usar `lucide-react`, nao imagens geradas.

## Decisao oficial de tema

A decisao visual vigente e seguir Material Design 3 como sistema de interface,
implementado com componentes React proprios, Tailwind e tokens em `src/theme`.
As paletas abaixo continuam como referencia de identidade e podem servir como
seed para gerar os roles claro/escuro do Material 3, mas nao devem impedir a
migracao para componentes, shapes, tipografia, navegacao e estados do Material 3.

Plano operacional de cores: `.agents/plano-padronizacao-cores-ux-0003.md`.

## Padrões de usabilidade e navegação

Estes padrões são obrigatórios para todas as interfaces do app. Eles existem
para que uma nova tela pareça parte do mesmo produto, inclusive durante o uso
rápido na academia.

### Estrutura de tela

- Toda tela é renderizada dentro de `AppShell`, com conteúdo em uma coluna de
  até `max-w-md`, margem lateral de 16 px e identificação da interface no
  rodapé técnico.
- Telas principais (`Início`, `Treino`, `Histórico` e `Ajustes`) usam o mesmo
  header global de marca, um `PageHeader` no início do conteúdo e a barra de
  navegação inferior fixa.
- Telas de tarefa ou detalhe usam uma barra contextual no topo com voltar,
  título e progresso/ação de apoio. Elas não exibem a navegação inferior para
  evitar que o usuário abandone uma tarefa por engano.
- Uma tela de tarefa que tenha ação principal deve mantê-la em rodapé
  contextual fixo, respeitando a área segura do dispositivo. Não usar
  `min-h-screen` dentro de um shell que já ocupa a altura da janela, pois isso
  cria espaço vazio antes do rodapé.
- O conteúdo começa após o header e termina antes do footer contextual ou da
  navegação inferior. Espaçamentos entre blocos usam 20 px; dentro de cards,
  usar 12, 16 ou 20 px conforme a densidade.

### Navegação

- A navegação inferior contém exatamente quatro destinos de primeiro nível:
  `Início`, `Treino`, `Histórico` e `Ajustes`. O item ativo usa indicador em
  pill e `aria-current="page"`.
- `Início` mostra o próximo treino recomendado; `Treino` lista todas as
  rotinas; `Histórico` mostra progresso e cargas; `Ajustes` concentra tema,
  importação, backup e integrações locais.
- Cartões, linhas e atalhos que abrem uma tela devem ser botões ou links reais,
  ter alvo de toque mínimo de 48 px e foco visível.
- A sequência é `Treino` → lista da rotina (UX-0003) → exercício ativo
  (UX-0009). Voltar em UX-0009 retorna à lista da rotina; voltar em UX-0003
  retorna à lista de rotinas. A barra inferior não é mostrada nessa sequência.
- Resultado de ação, importação e conclusão devem oferecer uma saída explícita
  no próprio diálogo ou na tela seguinte; nunca depender somente do gesto de
  voltar do navegador.

### Avisos, confirmações e erros

- Resultados de ações, avisos que exigem ciência e confirmações aparecem em
  `ConfirmationDialog`, sobre a tela atual. O diálogo tem título objetivo,
  ícone e cor semântica, texto curto e um botão de confirmação explícito.
- Ações destrutivas ou que substituem dados têm os botões `Cancelar` e uma
  ação nomeada pelo efeito, como `Apagar dados`, `Restaurar backup` ou
  `Importar plano`. O foco inicial fica em `Cancelar`.
- Não usar `window.confirm`, toast, banner temporário ou confirmação inline
  para essas ações. Status persistentes que ajudam a leitura do conteúdo — por
  exemplo, a situação do ciclo dentro do cartão de progresso — podem ficar na
  tela, mas não substituem um retorno de ação.
- O diálogo fecha por `Escape`, toque no fundo ou botão secundário quando a
  ação é cancelável; o foco retorna ao controle que o abriu.

### Componentes e cores

- `PageHeader` é o cabeçalho de conteúdo das telas principais: ícone em
  `secondary-container`, label em `secondary`, título em `on-surface` e
  descrição em `on-surface-variant`.
- Usar `Card` para agrupamentos: `outlined` para blocos de conteúdo e listas,
  `filled` para informação secundária e `elevated` somente quando a elevação
  comunica prioridade. Não criar variações locais de borda, raio ou sombra.
- A cor comunica papel, não preferência: `primary` para ação e conclusão,
  `secondary` para navegação e informação, `tertiary` para atenção e `error`
  para falha ou destruição. Usar somente tokens `md-*`; aliases genéricos e
  cores fixas são proibidos nos componentes.
- Cards de lista devem ter superfície, borda, ícone, texto secundário e foco
  iguais entre listas de rotinas, exercícios e histórico. O conteúdo detalhado
  ocupa a largura inteira do card após o cabeçalho compacto.

### Tema claro

Base Material 3 em tema claro para ambientes iluminados e leitura clara.

Usar quando o usuario preferir uma interface mais leve e com leitura clara em ambientes iluminados.

Os valores oficiais ficam em `src/theme/tokens.css`; telas e componentes não
devem replicá-los como hexadecimais.

### Tema escuro

Base Material 3 em tema escuro, com superficies grafite, acao principal em
verde-lima e informacoes secundarias em ciano.

Usar como tema padrao para a primeira abertura do app.

Os valores oficiais ficam em `src/theme/tokens.css`; os roles são equivalentes
ao tema claro, ainda que seus valores sejam diferentes.

### Regra funcional

- O app deve ter uma configuracao de tema com as opcoes `Claro` e `Escuro`.
- Salvar a preferencia localmente no dispositivo.
- Aplicar o tema sem exigir reinicio do app.
- O tema escolhido deve afetar todas as telas principais.
- Componentes devem usar tokens de design, nao cores fixas espalhadas pela UI.

## Composicao padrao das telas

Toda interface deve usar uma unica moldura de tela, nesta ordem:

1. header;
2. conteudo principal;
3. footer.

O `AppShell` deve ser o unico responsavel por altura minima da viewport,
safe areas e espaco reservado para navegacao ou acoes fixas. Telas individuais
nao devem repetir `min-h-screen`, padding de navegacao ou outra reserva global,
pois a soma dessas camadas cria espacos vazios e rolagem artificial.

### Header principal

Usar nas quatro telas da navegacao principal: Inicio, Treino, Historico e
Ajustes.

- Manter a mesma altura, alinhamento, padding lateral e safe area.
- Mostrar o nome da tela atual como titulo.
- Manter a identidade do app em posicao secundaria, sem competir com o titulo.
- Nao mostrar botao Voltar em uma raiz da navegacao principal.
- A troca entre essas telas acontece somente pela barra de navegacao inferior
  ou por um atalho que leve explicitamente a uma delas.

### Header contextual

Usar em fluxos focados ou hierarquicos, como lista de exercicios da rotina,
exercicio atual, detalhe do historico, preview/erro de importacao e resultado
do treino.

- Manter a mesma base visual do header principal.
- Usar a acao Voltar no inicio do header quando houver uma tela-pai.
- Mostrar o contexto no titulo ou subtitulo, sem criar um segundo header dentro
  do conteudo.
- Permitir uma informacao curta no final do header, como progresso `2/6`.
- O botao Voltar visivel, o gesto/tecla Voltar do Android e o Voltar do
  navegador devem produzir o mesmo destino.

### Footer

- Toda tela deve terminar com o mesmo footer de identificacao da interface.
- O footer fica no fluxo normal depois do conteudo; nao deve usar `mt-auto`
  para fabricar espaco vazio.
- Nas telas principais, a barra de navegacao inferior aparece depois do footer
  como elemento fixo do shell.
- Nas telas focadas, a navegacao inferior nao aparece. Quando houver uma acao
  persistente, usar uma barra de acao inferior propria do shell.
- Conteudo, footer, timer flutuante e barras inferiores devem respeitar a safe
  area e nunca se sobrepor.

## Padrao de navegacao

A navegacao principal possui exatamente quatro destinos:

- Inicio;
- Treino;
- Historico;
- Ajustes.

Regras:

- A barra inferior aparece somente nas quatro telas principais.
- Lista da rotina, exercicio atual, detalhe de historico, importacao e
  finalizacao sao destinos contextuais e nao criam novos itens na barra
  inferior.
- Abrir um destino contextual preserva a tela de origem e o estado da tarefa.
- Fechar preview ou erro de importacao retorna para a tela que iniciou o fluxo,
  seja Inicio ou Ajustes.
- UX-0009 volta para UX-0003; UX-0003 volta para a lista de rotinas; detalhe de
  exercicio do historico volta para Historico.
- Um dialogo nunca muda a navegacao por conta propria. Cancelar ou fechar
  mantem o usuario na mesma tela.
- Nao adicionar nova biblioteca de rotas apenas para aplicar essas regras; a
  navegacao pode continuar centralizada no estado atual do app.

## Avisos, confirmacoes e feedback

Avisos e confirmacoes que exigem decisao ou ciencia do usuario devem aparecer
em dialogo modal, nunca como bloco de confirmacao expandido dentro de um card.

Existem dois padroes:

### Dialogo de confirmacao

Usar antes de uma acao destrutiva, substitutiva ou de conclusao arriscada.

- Exibir titulo em forma de decisao, consequencia curta e duas acoes.
- A acao segura vem primeiro: `Cancelar`, `Continuar treino` ou equivalente.
- A acao final usa verbo especifico: `Apagar dados`, `Restaurar backup`,
  `Substituir plano` ou `Finalizar treino`.
- A confirmacao destrutiva usa os roles de erro; nao usar vermelho em
  confirmacoes comuns.
- Durante processamento, impedir novo envio e impedir fechamento acidental.

### Dialogo de aviso

Usar para erro, risco ou informacao importante que precisa ser reconhecida.

- Exibir titulo curto, explicacao objetiva e uma acao `Entendi`.
- Quando existir recuperacao imediata, a acao pode usar um verbo especifico,
  como `Escolher outro arquivo`, mantendo `Fechar` ou `Cancelar` como acao
  secundaria.
- Erros usam `error-container`; alertas usam `tertiary-container`; informacao
  usa `secondary-container`.

Todos os dialogos devem:

- bloquear interacao com o conteudo ao fundo;
- receber foco ao abrir, prender a navegacao por teclado e devolver o foco ao
  controle de origem ao fechar;
- ter nome e descricao acessiveis;
- tratar Escape, toque fora e Voltar como cancelamento quando cancelar for
  seguro;
- manter alvos de toque com pelo menos 48 x 48 px.

Estados persistentes, como o status atual do Health Connect, podem continuar
visiveis no card correspondente. Validacao ligada a um campo ou arquivo pode
permanecer junto do conteudo para permitir correcao. Feedback passivo de
sucesso pode usar status nao bloqueante. Essas excecoes nao substituem o
dialogo quando uma decisao, risco ou falha precisa de confirmacao.

## Consistencia de componentes e cores

Todas as telas devem usar os roles Material 3 de forma semantica:

- `background`: fundo geral da aplicacao;
- `surface` e `surface-container-*`: headers, cards, listas e areas agrupadas;
- `primary`: acao principal, progresso e estado selecionado;
- `secondary`: informacao de apoio, icones e contexto;
- `tertiary`: aviso que nao seja erro;
- `error`: falha e acao destrutiva;
- `on-*`: texto e icone sobre o respectivo container;
- `outline-variant`: divisores e bordas discretas.

Nao misturar aliases genericos como `bg-muted`, `text-info` e `bg-secondary`
com roles `md-*` dentro das telas de produto. Os aliases podem continuar
existindo para compatibilidade dos primitivos, mas novas interfaces e
migracoes devem usar diretamente os roles Material 3.

Padroes de composicao:

- Cards de conteudo usam `Card` e a mesma familia de raio, borda e padding.
- Cabecalhos de secao usam um unico componente com icone, label e titulo.
- Metricas usam um unico componente de card.
- Itens acionaveis de lista usam um unico componente com estado normal,
  pressionado, selecionado, desabilitado e indicador de destino.
- Chips representam estado curto; nao substituem botoes.
- A tipografia usa as escalas `label-*`, `body-*`, `title-*` e `headline-*`
  definidas no tema, evitando tamanhos arbitrarios por tela.
- O espacamento entre secoes, cards e acoes deve vir de uma escala comum.
- Telas de treino podem ser mais densas que Inicio, Historico e Ajustes, mas
  devem manter os mesmos headers, roles de cor, componentes, tipografia,
  estados e regras de navegacao.

Plano operacional:
`.agents/plano-padronizacao-usabilidade-ux.md`.
