# UX e prototipo aprovado

Este documento organiza a fase de prototipacao visual do app `meu-treino` antes do inicio do desenvolvimento da interface.

Objetivo: validar fluxo, telas, estados e comportamento mobile antes de implementar, reduzindo retrabalho de layout e economizando tokens nas etapas de codigo.

## Decisao de usabilidade

A primeira versao deve seguir o modelo **Guiada**:

- A tela inicial abre direto no proximo treino recomendado.
- O usuario deve ter uma acao principal clara: iniciar o treino recomendado.
- A execucao do treino deve usar uma experiencia focada, parecida com o modelo **Modo Treino**, com timer, registro rapido por exercicio e poucos elementos concorrendo por atencao.
- O plano completo e o historico ficam acessiveis, mas nao competem com a acao principal.

## Ferramenta recomendada

Usar **Excalidraw** para os wireframes e prototipos iniciais.

Razoes:

- E gratuito para o fluxo deste projeto.
- Funciona no navegador.
- E simples para desenhar e ajustar telas rapidamente.
- Evita gastar tempo cedo demais com detalhes visuais.
- E bom para validar fluxo, hierarquia, textos e componentes antes do codigo.
- Permite exportar imagens para anexar neste documento.

Ferramentas auxiliares:

- Imagens geradas pelo Codex: usar como referencia visual para redesenhar ou refinar no Excalidraw.
- Penpot: opcional no futuro, somente se precisarmos de um prototipo visual de alta fidelidade antes do desenvolvimento.
- Este documento: usar como contrato de aprovacao antes de desenvolver.

Arquivo editavel principal:

- `docs/arquitetura/prototipos/meu-treino-wireframes-v2.excalidraw`

Versao atual:

- V2 final aprovada.
- Contem os wireframes finais das telas da primeira versao, com `UX-09` e `UX-12` removidas como telas independentes.
- Todas as telas foram organizadas em quadros mobile de 390 x 844 px.
- Arquivo auxiliar para regeneracao: `docs/arquitetura/prototipos/generate-wireframes-v2.mjs`.

Como usar:

1. Acesse `https://excalidraw.com`.
2. Use `Open` ou arraste o arquivo `docs/arquitetura/prototipos/meu-treino-wireframes-v2.excalidraw` para a tela.
3. Edite os quadros das telas.
4. Atualize o status da tela neste documento quando houver nova decisao aprovada.

Regra importante: o Excalidraw valida estrutura e fluxo. A fidelidade visual final sera ajustada no desenvolvimento usando os tokens de tema.

## Processo de aprovacao

1. Definir mapa de telas.
2. Criar wireframes simples no Excalidraw.
3. Aprovar fluxo sem foco em beleza.
4. Aplicar identidade visual do modelo Guiada.
5. Exportar imagens das telas aprovadas para este documento.
6. Revisar em tamanho de celular.
7. Marcar telas como aprovadas neste documento.
8. So iniciar desenvolvimento visual depois da aprovacao das telas principais.

## Status possiveis

- `Pendente`: ainda nao foi desenhada.
- `Em desenho`: esta sendo criada no prototipo.
- `Em revisao`: precisa de avaliacao do usuario.
- `Aprovada com ajustes`: pode seguir, mas tem pequenos ajustes anotados.
- `Aprovada`: pode guiar desenvolvimento.

## Mapa de telas da primeira versao

| ID | Tela | Objetivo | Status |
| --- | --- | --- | --- |
| UX-01 | Inicio sem treino importado | Explicar estado vazio e levar para importar JSON ou baixar modelo | Aprovada |
| UX-02 | Inicio com treino ativo | Mostrar plano ativo, proximo treino recomendado, progresso do ciclo e botao iniciar | Aprovada |
| Treino | Lista de rotinas do plano | Listar todas as rotinas pelo menu Treino e destacar a rotina recomendada | Aprovada |
| UX-03 | Detalhe da rotina selecionada | Mostrar aquecimento, exercicios, cargas sugeridas e abrir execucao ao tocar em um exercicio | Aprovada |
| UX-04 | Execucao do treino | Marcar series concluidas, ver descanso entre series e registrar carga/reps apenas ao final do exercicio | Aprovada com ajustes |
| UX-05 | Descanso integrado na UX-04 | Nao criar tela separada; controlar descanso entre series dentro da UX-04 | Substituida pela UX-04 |
| UX-06 | Finalizacao do treino | Confirmar treino concluido, salvar ultima rotina e mostrar proxima recomendacao | Aprovada |
| UX-07 | Historico | Listar treinos concluidos e evolucao basica de carga | Aprovada |
| UX-08 | Detalhe de exercicio no historico | Mostrar ultima carga, maior carga e progresso por exercicio | Aprovada |
| UX-10 | Preview do JSON importado | Mostrar resumo do plano e confirmar substituicao do treino atual | Aprovada |
| UX-11 | Erro de importacao | Explicar problema no JSON e orientar nova tentativa | Aprovada |
| UX-13 | Configuracoes | Trocar tema, substituir treino atual, baixar modelo, exportar backup, apagar dados e ver versao | Aprovada |
| UX-14 | Tema claro | Validar a aparencia das telas principais no tema claro | Aprovada |

## Fluxos principais

### Primeiro uso

1. Usuario abre o app.
2. App mostra `Inicio sem treino importado`.
3. Usuario pode baixar modelo JSON por acao direta na propria tela.
4. Usuario importa um treino.
5. App valida e mostra preview.
6. Usuario confirma.
7. App mostra `Inicio com treino ativo`.

### Treino recomendado

1. Usuario abre o app.
2. App mostra proximo treino recomendado.
3. Usuario toca em `Iniciar treino`.
4. App abre a `UX-03` da rotina recomendada.
5. Usuario toca no exercicio que vai fazer.
6. App abre a `UX-04` diretamente naquele exercicio.
7. Usuario inicia o exercicio sem preencher carga e reps.
8. Entre as series, usuario marca a serie como concluida e ve o descanso integrado.
9. Ao terminar as series do exercicio, usuario registra carga e reps uma vez.
10. App salva carga e reps; RIR permanece opcional para melhoria futura.
11. Usuario finaliza treino.
12. App salva a ultima rotina finalizada.
13. App recomenda a proxima rotina pela ordem.

### Escolha manual de rotina

1. Usuario toca em `Treino` na navegacao inferior.
2. App lista todas as rotinas do plano ativo.
3. App destaca a rotina recomendada, sem bloquear as outras rotinas.
4. Usuario toca na rotina que quer executar no dia.
5. App abre a `UX-03` da rotina selecionada.
6. Usuario toca no exercicio que vai fazer.
7. App abre a `UX-04` diretamente naquele exercicio.

### Troca de treino

1. Usuario toca em `Importar JSON` na Home sem treino ou em `Substituir treino atual` na area de JSON em Configuracoes.
2. App valida novo plano.
3. App mostra preview.
4. Usuario confirma substituicao.
5. App descarta progresso da sequencia antiga.
6. App preserva historico de cargas de exercicios equivalentes.
7. App recomenda a primeira rotina do novo plano.

### Tema

1. Usuario acessa configuracoes.
2. Usuario alterna entre claro e escuro.
3. App aplica tema sem reiniciar.
4. Preferencia fica salva localmente.

## Componentes que precisam aparecer no prototipo

- Header compacto com nome do app, status offline/local e alternancia de tema quando fizer sentido.
- Card ou bloco principal de proximo treino recomendado.
- Barra de progresso do ciclo.
- Botao primario grande para iniciar treino.
- Lista de rotinas do plano acessivel pelo item `Treino` da navegacao inferior.
- Selo visual para a rotina recomendada dentro da lista de rotinas.
- Lista compacta de exercicios.
- Controle de series concluidas durante o exercicio.
- Guia visual recolhivel durante o exercicio, aberto por `Ver como fazer`, com musculo principal, musculos auxiliares e dicas curtas.
- Registro de exercicio com carga e reps no fim do exercicio, uma vez por exercicio na primeira versao.
- Controles de incremento/decremento para carga e reps.
- Card de descanso dentro da execucao.
- Estado vazio para nenhum treino importado.
- Preview de importacao do JSON apos seletor de arquivo acionado pela Home ou por Configuracoes.
- Mensagem de erro de JSON invalido.
- Historico resumido de cargas.
- Configuracoes com tema claro/escuro.
- Navegacao inferior simples.

## Regras visuais para aprovar telas

- Mobile-first em 390 x 844 px.
- Tema escuro como padrao.
- Tema claro validado nas telas principais.
- Texto curto e legivel durante o treino.
- Botoes principais com area de toque grande.
- Numeros de carga, repeticoes e timer com destaque.
- Nada de landing page.
- Nada de excesso de cards empilhados.
- Sem texto cortado.
- Sem controles pequenos demais para uso na academia.
- Visual baseado no modelo 1 aprovado pelo usuario.

## Prompt base para gerar telas de referencia

Use este prompt quando quiser pedir ao Codex para gerar uma tela visual antes de desenhar ou refinar no Excalidraw:

```text
Use AGENTS.md, docs/arquitetura/arquitetura-prompt.md, docs/arquitetura/identidade-visual-opcoes.md e docs/arquitetura/ux-prototipo-aprovado.md como referencia.
Objetivo: gerar uma proposta visual para a tela [ID e nome da tela].
Direcao: seguir o modelo Guiada aprovado, mobile-first, tema escuro como padrao, com possibilidade de tema claro.
Restricoes: nao criar funcionalidades fora do escopo; nao fazer landing page; manter textos curtos; priorizar uso real durante treino.
Pronto quando: houver uma imagem da tela em 390 x 844 px e uma lista curta do que precisa ser aprovado.
```

## Prompt base para implementar tela aprovada

Use este prompt somente depois que a tela estiver aprovada:

```text
Use AGENTS.md, docs/arquitetura/arquitetura-prompt.md, docs/arquitetura/identidade-visual-opcoes.md e docs/arquitetura/ux-prototipo-aprovado.md como referencia.
Objetivo: implementar a tela [ID e nome da tela] conforme o prototipo aprovado.
Restricoes: manter React + Vite + TypeScript + Tailwind + shadcn/ui; usar tokens de tema; PWA primeiro; dados 100% locais.
Pronto quando: a tela estiver funcional, responsiva em mobile, coerente com o prototipo aprovado e verificada em viewport mobile.
```

## Registro de aprovacoes

Atualize esta tabela quando cada tela for aprovada.

| ID | Decisao | Observacoes | Data |
| --- | --- | --- | --- |
| UX-00 | Modelo Guiada escolhido como base | Combinar tela inicial do modelo 1 com execucao focada inspirada no modelo 3 | 2026-06-15 |
| UX-01..UX-14 | Prototipo V2 final aprovado, com UX-09 e UX-12 removidas como telas independentes | Usar `docs/arquitetura/prototipos/meu-treino-wireframes-v2.excalidraw` como unico guia editavel vigente | 2026-06-17 |
| Treino e UX-03 | Fluxo de escolha manual de rotina aprovado | O menu `Treino` lista todas as rotinas do plano, destaca a recomendada e abre a `UX-03` da rotina escolhida; a Home continua abrindo a `UX-03` da recomendada | 2026-06-19 |
| UX-04 | Registro por exercicio aprovado | A primeira versao registra carga e repeticoes uma vez por exercicio, sem RIR obrigatorio na UI; RIR pode continuar opcional/nulo no dominio e storage para evolucao futura | 2026-06-19 |
| UX-04 | Ajuste apos primeiro uso real | Usuario deve conseguir marcar cada serie como concluida para acompanhar descanso entre series; carga e repeticoes continuam sendo informadas apenas no fim do exercicio; remover pausa e cancelar do topo da tela de exercicio | 2026-06-19 |
| UX-04 | Guia visual do exercicio aprovado | Orientacao fica recolhida por padrao e abre por `Ver como fazer`; quando aberta, prioriza musculo principal, secundarios em cor mais fria, seta de movimento quando houver asset e ate 3 dicas curtas | 2026-06-20 |
| UX-04 | Evolucao do guia visual | Seguir `.agents/plano-incorporacao-biblioteca-exercicios.md`: imagem aparece somente quando houver asset especifico validado; `movement_pattern` fica restrito a classificacao e dicas, sem imagem generica | 2026-06-21 |

## Prototipos aprovados

Os wireframes finais da primeira versao estao consolidados no arquivo editavel `docs/arquitetura/prototipos/meu-treino-wireframes-v2.excalidraw`. A implementacao visual deve seguir esse arquivo, respeitando os tokens definidos em `docs/arquitetura/identidade-visual-opcoes.md`. No fluxo V2, `UX-09` e `UX-12` nao existem como telas: selecionar JSON e baixar modelo sao acoes diretas a partir de `UX-01` ou `UX-13`.

### UX-01 - Inicio sem treino importado

Pontos aprovados:

- A acao principal `Importar JSON` esta clara.
- A acao secundaria `Baixar modelo` aparece no momento certo.
- O estado vazio transmite que os dados ficam locais.
- Ajuste sugerido: trocar o status `Local Offline` por algo menos ambiguo, como `Dados locais` ou `Offline pronto`.

### UX-02 - Inicio com treino ativo

Pontos aprovados:

- O proximo treino recomendado esta claro.
- O botao `Iniciar treino` e a acao principal da tela.
- O progresso do ciclo esta facil de entender.
- Seguir com a composicao aprovada no wireframe do Excalidraw; elementos ilustrativos podem ser refinados no desenvolvimento sem mudar o fluxo.

### UX-04 - Execucao do treino

Pontos aprovados:

- O card de descanso deve aparecer entre series depois de marcar uma serie como concluida.
- O exercicio atual tem destaque suficiente.
- Os controles de carga e reps parecem confortaveis para uso com uma mao.
- A navegacao inferior some durante o treino para reduzir distracao.
- A experiencia final da primeira versao deve manter carga e reps como unicos campos obrigatorios de conclusao do exercicio; RIR nao deve ser reintroduzido como campo visivel obrigatorio.
- O topo da tela de exercicio nao deve exibir botoes de pausa nem de cancelar com `X`.
- A lista de exercicios da rotina em progresso deve indicar `Pendente`, `Em progresso` e `Concluido`.
- A orientacao visual do exercicio deve iniciar recolhida, abrir por `Ver como fazer` e poder ser ocultada sem mudar o estado do treino.
- Quando houver dados do JSON, mostrar musculo principal com maior destaque, musculos secundarios com tom mais frio e ate 3 dicas curtas de execucao; quando houver `visual_id` mapeado para asset validado, mostrar tambem a imagem do exercicio.
