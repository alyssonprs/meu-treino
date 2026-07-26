# Plano de padronizacao de usabilidade e UX

## Objetivo

Padronizar a estrutura, a navegacao, os avisos, as confirmacoes, os
componentes e as cores do `meu-treino`, preservando a experiencia mobile-first
e a maior densidade necessaria durante o treino.

Este plano deve ser executado em etapas pequenas. Cada execucao termina com
verificacao, commit e push antes de iniciar a seguinte.

## Contexto obrigatorio

Antes de cada execucao, ler:

- `AGENTS.md`;
- `docs/arquitetura/arquitetura-prompt.md`;
- `docs/arquitetura/identidade-visual.md`;
- este plano;
- os arquivos listados na execucao.

Nao adicionar dependencia de producao. Nao redesenhar a marca. Nao alterar
regras de treino, persistencia ou dominio fora do necessario para manter a
navegacao e os feedbacks.

## Decisoes ja definidas

Estas decisoes nao devem ser reabertas durante a implementacao:

1. Toda tela segue `header -> conteudo -> footer`.
2. Existem dois headers da mesma familia visual:
   - principal, para Inicio, Treino, Historico e Ajustes;
   - contextual, para telas filhas e fluxos focados.
3. A barra de navegacao inferior aparece somente nas quatro telas principais.
4. O shell e o unico responsavel por viewport, safe area e espaco de barras
   fixas.
5. Aviso que exige ciencia usa dialogo com `Entendi`.
6. Confirmacao usa dialogo com acao segura e acao final de nome especifico.
7. Validacao ligada ao conteudo e estado persistente podem continuar inline.
8. Telas de treino podem ter maior densidade, mas usam os mesmos tokens,
   headers, estados e primitivos das demais telas.
9. As telas de produto devem convergir para roles Material 3 `md-*`, sem
   misturar aliases genericos no mesmo nivel.
10. Nenhuma execucao adiciona uma biblioteca de rotas ou de UI.

## Diagnostico da implementacao atual

### Espaco inferior de UX-0003 e UX-0009

A causa esta na soma de quatro reservas de layout:

- `AppShell` usa `min-h-screen` e padding inferior;
- `ActiveWorkoutScreen` usa `min-h-screen pb-28`;
- `ActiveExerciseScreen` usa `min-h-screen pb-24`;
- `ScreenIdentifier` usa `mt-auto`.

O resultado pode criar uma segunda altura minima dentro da primeira e empurrar
o footer, deixando rolagem e espaco vazio no final.

### Diferenca percebida entre as familias de telas

Inicio, Historico e Ajustes:

- usam muitos cards `outlined`;
- misturam `bg-muted`, `bg-secondary`, `text-info`,
  `text-muted-foreground` e roles `md-*`;
- usam tamanhos livres como `text-2xl`, `text-3xl`, `text-sm` e `text-base`;
- repetem cabecalhos de secao e cards de metrica localmente.

Lista da rotina e exercicio atual:

- usam diretamente roles `md-*`;
- usam superficies `surface-container-*` mais densas;
- usam `rounded-xl` e listas agrupadas;
- implementam headers dentro da propria tela;
- aplicam altura e padding de viewport fora do shell.

A padronizacao deve corrigir o vocabulario visual, nao transformar todas as
telas no mesmo tipo de card.

### Navegacao

- O header global e ocultado em telas focadas, mas nem todas elas recebem um
  header contextual.
- O cancelamento da importacao sempre retorna para Inicio, mesmo quando o fluxo
  foi iniciado em Ajustes.
- O detalhe de exercicio no Historico controla o Voltar localmente, fora do
  padrao das demais telas.
- O Voltar visivel, o historico do navegador e o Voltar do Android ainda nao
  usam uma regra central unica.

### Avisos e confirmacoes

- UX-0003 e UX-0009 ja usam `ModalDialog` em parte do fluxo.
- UX-0006 confirma a limpeza com um bloco expandido dentro do card.
- Backup e Health Connect mostram mensagens transitorias com `Notice`.
- A restauracao substitui os dados depois da escolha do arquivo sem uma
  confirmacao dedicada.
- Avisos e resultados usam componentes e tons diferentes conforme a tela.

## Matriz de telas

| Tela | Tipo de header | Footer | Navegacao inferior | Destino de Voltar |
| --- | --- | --- | --- | --- |
| UX-0001 Inicio | principal | padrao | visivel | nao se aplica |
| UX-0002 Treino | principal | padrao | visivel | nao se aplica |
| UX-0005 Historico | principal | padrao | visivel | nao se aplica |
| UX-0006 Ajustes | principal | padrao | visivel | nao se aplica |
| UX-0003 Rotina ativa | contextual | padrao + acao | oculta | UX-0002 |
| UX-0009 Exercicio atual | contextual | padrao | oculta | UX-0003 |
| UX-0004 Treino concluido | contextual de resultado | padrao | oculta | Inicio |
| UX-0007 Preview de importacao | contextual | padrao + acao | oculta | origem |
| UX-0008 Erro de importacao | contextual | padrao | oculta | origem |
| Detalhe de exercicio | contextual | padrao | oculta | UX-0005 |

Na UX-0004, o header nao precisa exibir seta se as acoes de Inicio e Historico
estiverem visiveis. O Voltar do sistema deve ir para Inicio e nunca reabrir uma
sessao ja finalizada.

## Ordem das execucoes

### Execucao 0 - Consolidar o contrato duravel

Status: concluida nesta preparacao.

Entregas:

- registrar os padroes em `docs/arquitetura/identidade-visual.md`;
- fazer `AGENTS.md` e `docs/arquitetura/arquitetura-prompt.md` apontarem para
  esse contrato;
- corrigir referencias ao nome removido
  `identidade-visual-opcoes.md`.

Esta execucao nao altera a interface.

### Execucao 1 - Capturar baseline e inventario visual

Objetivo: registrar o estado anterior com capturas novas da mesma execucao que
implementara as mudancas.

Capturar em viewport Pixel 5 e tema escuro:

1. UX-0001 com plano ativo;
2. UX-0002;
3. UX-0003 no topo e no fim da rolagem;
4. UX-0009 no topo e no fim da rolagem;
5. UX-0005;
6. UX-0006 antes e depois de pedir uma confirmacao;
7. UX-0007;
8. UX-0008;
9. UX-0004.

Salvar as capturas de trabalho em:

`test-results/auditoria-padronizacao-ux/baseline/`.

Registrar junto de cada captura:

- header presente;
- footer presente;
- barra inferior visivel ou oculta;
- primeira e ultima superficie da tela;
- role de cor dominante;
- espaco entre o ultimo conteudo e o footer;
- qualquer sobreposicao com safe area, timer ou barra fixa.

Done when:

- cada tela possui captura valida ou blocker nomeado;
- UX-0003 e UX-0009 possuem evidencia do espaco inferior;
- nenhuma conclusao visual usa screenshot antigo como se fosse captura nova.

Arquivos de apoio:

- `tests/visual/home-mobile.spec.ts`;
- `playwright.visual.config.ts`.

Commit sugerido: nenhum, salvo se o inventario textual for versionado.

### Execucao 2 - Centralizar header, footer e reservas de layout

Objetivo: fazer o shell envolver o conteudo de todas as telas e remover o
espaco inferior de UX-0003 e UX-0009.

Arquivos provaveis:

- `src/features/navigation/AppShell.tsx`;
- `src/features/navigation/appNavigation.ts`;
- `src/components/ScreenIdentifier.tsx`;
- `src/components/ui/top-app-bar.tsx`;
- `src/features/workouts/ActiveWorkoutScreen.tsx`;
- `src/features/workouts/ActiveExerciseScreen.tsx`;
- `src/features/workouts/WorkoutFinishedScreen.tsx`;
- `src/features/import-export/ImportPreviewScreen.tsx`;
- `src/features/import-export/ImportErrorScreen.tsx`;
- `src/features/progress/ProgressScreen.tsx`.

Passos:

1. Criar metadados de apresentacao por `AppScreen`:
   - tipo de header;
   - titulo;
   - subtitulo/contexto opcional;
   - presenca da navegacao inferior;
   - presenca de acao inferior.
2. Fazer `AppShell` renderizar o header principal ou contextual.
3. Mover os headers de UX-0003 e UX-0009 para o padrao compartilhado, ou
   compo-los pelo shell sem duplicar markup.
4. Garantir header contextual em UX-0004, UX-0007 e UX-0008.
5. Fazer `ScreenIdentifier` permanecer no fluxo normal e remover `mt-auto`.
6. Remover `min-h-screen pb-28` de UX-0003 e `min-h-screen pb-24` de UX-0009.
7. Fazer o shell calcular uma unica reserva inferior para:
   - navegacao principal;
   - barra de acao contextual;
   - timer flutuante;
   - safe area.
8. Manter a acao `Finalizar treino` acessivel sem criar uma viewport extra.

Done when:

- todas as telas da matriz possuem exatamente um header e um footer;
- UX-0003 e UX-0009 nao usam `min-h-screen`;
- `ScreenIdentifier` nao usa `mt-auto`;
- no fim da rolagem de UX-0003 e UX-0009 existe apenas o espacamento previsto
  pelo shell;
- barra fixa e timer nao cobrem o ultimo controle;
- navegacao inferior continua visivel somente nas quatro telas principais.

Verificacao minima:

- teste visual direcionado a UX-0003 e UX-0009;
- `pnpm lint`;
- `pnpm build`.

Commit sugerido:

`fix: padronizar shell e remover espaco inferior`

### Execucao 3 - Centralizar o comportamento de navegacao

Objetivo: garantir que todo Voltar e toda entrada/saida contextual tenham
destino previsivel.

Arquivos provaveis:

- `src/app/App.tsx`;
- `src/features/navigation/appNavigation.ts`;
- `src/features/navigation/AppShell.tsx`;
- `src/features/progress/ProgressScreen.tsx`;
- `src/features/import-export/ImportPreviewScreen.tsx`;
- `src/features/import-export/ImportErrorScreen.tsx`.

Passos:

1. Registrar a origem ao iniciar importacao por Inicio ou Ajustes.
2. Retornar preview e erro de importacao para a origem correta.
3. Centralizar as acoes:
   - UX-0009 -> UX-0003;
   - UX-0003 -> UX-0002;
   - detalhe do Historico -> UX-0005;
   - UX-0004 -> Inicio no Voltar do sistema.
4. Fazer header, Voltar do navegador e Voltar do Android chamarem a mesma
   intencao de navegacao.
5. Preservar treino ativo, exercicio atual e timer ao visitar uma tela
   principal permitida e ao retornar pelo timer.
6. Nao deixar fechamento de dialogo alterar rota ou tab.
7. Manter hashes das quatro telas principais e evitar nova dependencia.

Done when:

- iniciar importacao em Ajustes e cancelar retorna para Ajustes;
- iniciar importacao em Inicio e cancelar retorna para Inicio;
- os destinos da matriz funcionam por botao e por Voltar do sistema;
- finalizar uma sessao impede retorno para um draft concluido;
- nenhum fluxo principal perde dados por navegar.

Testes direcionados:

- origem da importacao;
- cadeia UX-0009 -> UX-0003 -> UX-0002;
- detalhe do Historico;
- Voltar depois de UX-0004;
- timer global preservado.

Commit sugerido:

`refactor: centralizar navegacao contextual`

### Execucao 4 - Criar os padroes de dialogo

Objetivo: oferecer primitivos unicos para aviso, confirmacao e formularios
modais existentes.

Arquivos provaveis:

- `src/components/ui/dialog.tsx`;
- `src/components/ModalDialog.tsx`;
- novos componentes pequenos em `src/components/`;
- `src/components/ui/button.tsx`;
- `src/theme/tokens.css`.

Primitivos esperados:

- `AlertDialog`: titulo, descricao, tom, `Entendi` ou acao de recuperacao;
- `ConfirmationDialog`: titulo, descricao, acao segura, acao final, tom e
  estado pendente;
- `ModalDialog`: continua disponivel para formularios como
  `Registrar resultado`.

Nao criar um gerenciador global complexo se estado local resolver. Um estado
global simples em `App` e aceitavel apenas para mensagens que precisam
sobreviver a uma navegacao, como o resultado de apagar dados.

Comportamento:

- `role="alertdialog"` em aviso bloqueante e confirmacao de risco;
- `role="dialog"` em formulario ou escolha comum;
- foco inicial na acao segura em operacao destrutiva;
- foco devolvido ao controle de origem;
- Escape, backdrop e Voltar cancelam quando seguro;
- durante processamento, nao fechar nem reenviar;
- botoes com pelo menos 48 px;
- acao segura primeiro e acao final por ultimo;
- texto do botao descreve a operacao.

Inventario minimo a migrar:

- finalizar treino incompleto em UX-0003;
- avisos de importacao e substituicao de plano;
- falhas de carregamento/salvamento que hoje aparecem como `Notice`;
- confirmacoes de UX-0006;
- manter `Registrar resultado` como dialogo de formulario.

Done when:

- nenhuma confirmacao nova usa bloco inline;
- aviso bloqueante tem acao explicita de ciencia;
- dialogos preservam foco, teclado e leitores de tela;
- tons usam diretamente os roles Material 3.

Testes direcionados:

- abrir/fechar por botao, Escape e backdrop;
- ciclo de foco;
- foco devolvido;
- processamento bloqueia duplo clique;
- nome, descricao e role acessiveis.

Commit sugerido:

`feat: padronizar dialogos de aviso e confirmacao`

### Execucao 5 - Corrigir avisos e confirmacoes da UX-0006

Objetivo: aplicar os novos dialogos em Ajustes sem transformar estados
persistentes em popups repetitivos.

Arquivos provaveis:

- `src/features/settings/SettingsScreen.tsx`;
- `src/features/settings/HealthConnectSettingsCard.tsx`;
- `src/app/App.tsx`;
- `tests/visual/home-mobile.spec.ts`.

Regras por acao:

#### Apagar dados locais

1. Tocar em `Apagar dados locais` abre `ConfirmationDialog`.
2. Titulo: `Apagar todos os dados de treino?`.
3. Consequencia informa plano, progresso, historico e cargas.
4. Acoes: `Cancelar` e `Apagar dados`.
5. Enquanto apaga, manter dialogo aberto, desabilitar acoes e mostrar
   `Apagando...`.
6. Depois do sucesso, ir para Inicio e mostrar `AlertDialog` de sucesso com
   `Entendi`.
7. Em falha, permanecer em Ajustes e mostrar `AlertDialog` de erro.

Remover completamente o bloco de confirmacao expandido dentro do card.

#### Restaurar backup

1. Escolher o arquivo apenas prepara a restauracao.
2. Abrir `ConfirmationDialog` com nome do arquivo e consequencia da
   substituicao.
3. Acoes: `Cancelar` e `Restaurar backup`.
4. So chamar o servico depois da segunda acao.
5. Resultado de sucesso ou falha aparece em `AlertDialog`.
6. Erros de validacao podem listar ate tres detalhes dentro do dialogo.

#### Baixar backup

- Resultado transitorio de sucesso ou falha aparece em `AlertDialog`.
- O estado `Gerando backup...` continua no botao durante processamento.

#### Health Connect

- Status persistente continua no card.
- Falha ao conectar, abrir configuracoes, salvar preferencia ou atualizar
  status usa `AlertDialog`.
- Alteracao bem-sucedida do switch pode ser confirmada pelo proprio estado do
  controle, sem popup extra.
- Mensagens de instalacao ou indisponibilidade que descrevem o estado atual
  continuam inline.

#### Tema e informacoes

- Trocar tema nao exige confirmacao.
- Informacoes de versao e armazenamento continuam inline.

Done when:

- UX-0006 nao usa `Notice` para feedback transitorio de backup;
- limpeza e restauracao possuem confirmacao modal;
- nenhuma acao destrutiva ocorre ao selecionar o arquivo;
- todas as falhas transitorias de UX-0006 exigem `Entendi`;
- status persistentes nao abrem popup a cada render;
- o fluxo funciona em tema claro e escuro.

Testes direcionados:

- cancelar e confirmar limpeza;
- falha e sucesso de limpeza;
- cancelar e confirmar restauracao;
- backup invalido;
- sucesso e falha de exportacao;
- falhas do Health Connect.

Commit sugerido:

`fix: aplicar dialogos nos avisos de ajustes`

### Execucao 6 - Unificar componentes, tipografia e cores

Objetivo: aproximar visualmente Inicio, Treino, Historico, Ajustes, UX-0003 e
UX-0009 sem remover a densidade funcional das telas de execucao.

Arquivos provaveis:

- `src/features/home/HomeScreen.tsx`;
- `src/features/workouts/RoutineListScreen.tsx`;
- `src/features/workouts/ActiveWorkoutScreen.tsx`;
- `src/features/workouts/ActiveExerciseScreen.tsx`;
- `src/features/workouts/WorkoutFinishedScreen.tsx`;
- `src/features/progress/ProgressScreen.tsx`;
- `src/features/settings/SettingsScreen.tsx`;
- `src/features/settings/HealthConnectSettingsCard.tsx`;
- `src/features/import-export/ImportPreviewScreen.tsx`;
- `src/features/import-export/ImportErrorScreen.tsx`;
- `src/components/ui/card.tsx`;
- novos componentes pequenos em `src/components/ui/`.

Componentes a consolidar, somente quando houver pelo menos dois usos reais:

- `SectionHeader`: icone, label e titulo;
- `MetricCard`: icone, valor e label;
- `InteractiveListItem`: titulo, apoio, estado e indicador de destino;
- `BottomActionBar`: acao persistente de tela contextual;
- `StatusChip`: estado curto sem comportamento de botao.

Passos:

1. Substituir, nas features, aliases como `bg-muted`, `bg-secondary`,
   `text-info`, `bg-card`, `border-border` e `text-muted-foreground` pelos
   roles `md-*` correspondentes.
2. Nao remover aliases dos tokens nesta execucao; apenas deixar de usa-los em
   telas de produto.
3. Trocar tamanhos arbitrarios pelos tokens:
   - `label-*`;
   - `body-*`;
   - `title-*`;
   - `headline-*`.
4. Padronizar:
   - padding de card;
   - gap entre secoes;
   - raio por tipo de superficie;
   - tamanho de icones;
   - alvo minimo de 48 px.
5. Remover cabecalhos introdutorios duplicados quando o header da tela ja
   comunica o mesmo titulo.
6. Usar a mesma semantica de cor:
   - primary para acao/progresso/selecionado;
   - secondary para apoio;
   - tertiary para aviso;
   - error para falha/destrutivo.
7. Preservar nas telas ativas:
   - lista densa;
   - midia do exercicio;
   - progresso de series;
   - entrada rapida;
   - timer;
   - poucas distracoes.
8. Em cards detalhados, manter icone/titulo em header compacto e liberar o
   restante do conteudo para a largura total.

Done when:

- as seis telas citadas usam a mesma familia de header, card, lista, metrica,
  chip e tipografia;
- nenhuma feature principal mistura alias generico com role Material 3;
- cor nunca e o unico indicador de estado;
- temas claro e escuro mantem hierarquia equivalente;
- nenhuma regra de treino ou persistencia muda.

Verificacao minima:

- busca por aliases nas features migradas;
- `pnpm lint`;
- `pnpm test`;
- `pnpm build`.

Commit sugerido:

`refactor: unificar componentes e roles visuais`

### Execucao 7 - Regressao visual, usabilidade e acessibilidade

Objetivo: provar que o contrato foi aplicado sem regressao de fluxo.

Capturar novamente as mesmas telas da Execucao 1 em:

`test-results/auditoria-padronizacao-ux/final/`.

Comparar baseline e final na mesma viewport e estado.

Checklist visual:

- um header por tela;
- conteudo com inicio consistente;
- um footer por tela;
- barra inferior somente nas quatro raizes;
- sem espaco inferior artificial em UX-0003 e UX-0009;
- sem conteudo coberto;
- cores com a mesma funcao em todas as telas;
- tipografia e raios da mesma familia;
- dialogs centralizados e legiveis em claro/escuro.

Checklist funcional:

- importar por Inicio e Ajustes;
- cancelar preview/erro para a origem;
- iniciar rotina, abrir exercicio e voltar;
- usar timer global e retornar ao exercicio;
- finalizar treino incompleto com confirmacao;
- registrar resultado;
- abrir detalhe do Historico e voltar;
- exportar, restaurar e apagar dados;
- fechar todos os dialogos por acao segura;
- alternar tema sem reiniciar.

Checklist acessivel:

- ordem de headings;
- nomes de headers e navegacao;
- `aria-current` na tab ativa;
- `dialog`/`alertdialog` com nome e descricao;
- foco preso e restaurado;
- alvos de 48 x 48 px;
- estados nao dependem somente de cor;
- sem overflow horizontal a 320 px;
- zoom/reflow sem perda de acao principal.

Automacao:

- ampliar `tests/visual/home-mobile.spec.ts`;
- manter `assertNoHorizontalOverflow`;
- manter `assertBottomNavDoesNotCoverActionableContent`;
- adicionar verificacao do fim da pagina para UX-0003 e UX-0009;
- testar dialogos por role e nome;
- testar a origem da importacao.

Comandos finais:

```powershell
pnpm test
pnpm lint
pnpm build
pnpm visual:check
```

Done when:

- todos os checks passam;
- capturas finais foram inspecionadas;
- qualquer limite de verificacao foi registrado;
- o APK nao e necessario, pois nao houve alteracao nativa;
- commit final foi enviado ao remoto.

Commit sugerido:

`test: validar padroes de navegacao e dialogos`

## Regra de entrega por execucao

Ao final de cada execucao:

1. revisar `git diff`;
2. executar os checks mais estreitos;
3. atualizar o status desta etapa no plano;
4. criar um commit somente com a etapa;
5. fazer push para o remoto configurado;
6. informar arquivos alterados, checks e riscos restantes.

Nao agrupar as Execucoes 2 a 6 em um unico commit.

## Fora do escopo

- mudar a paleta aprovada;
- adicionar nova identidade ou icones de marca;
- adicionar backend, login ou sync;
- alterar o modelo de dados de treino;
- mudar registro por exercicio para registro por serie;
- adicionar biblioteca de UI ou roteamento;
- redesenhar a experiencia de treino alem da padronizacao descrita.
