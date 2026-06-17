# Opcoes de identidade visual

Este documento apresenta caminhos visuais possiveis para o app `meu-treino` antes do inicio da implementacao da interface.

O app deve parecer uma ferramenta de treino real: rapido, legivel, direto, bom de usar na academia e sem cara de landing page.

## Criterios para escolher o tema

- Deve funcionar bem em celular.
- Deve ter bom contraste em ambiente de academia.
- Deve facilitar leitura rapida durante o treino.
- Deve destacar a rotina recomendada, exercicios, cargas e progresso.
- Deve evitar excesso de decoracao.
- Deve transmitir energia sem ficar cansativo.

## Tema 1 - Performance Escura

Sensacao: forte, moderna, focada e parecida com apps fitness premium.

### Direcao visual

- Fundo principal escuro.
- Superficies em grafite.
- Acentos em verde-lima ou ciano.
- Texto branco/cinza claro.
- Barras de progresso com cor vibrante.

### Paleta sugerida

- Fundo: `#101214`
- Superficie: `#1A1D21`
- Superficie elevada: `#242832`
- Texto principal: `#F4F7FA`
- Texto secundario: `#AAB2BD`
- Acento: `#B6F000`
- Acento alternativo: `#00D4FF`
- Alerta: `#FFB020`
- Erro: `#FF4D4F`

### Melhor para

- Uso noturno ou em academia.
- Visual mais "treino serio".
- Sensacao de produto premium.

### Risco

- Se exagerar, pode ficar pesado ou parecido com muitos apps fitness escuros.

## Tema 2 - Energia Clara

Sensacao: limpo, leve, motivador e facil de ler.

### Direcao visual

- Fundo claro.
- Cards brancos ou cinza muito claro.
- Acentos em azul intenso e verde.
- Progresso bem visivel.
- Visual menos agressivo.

### Paleta sugerida

- Fundo: `#F6F8FA`
- Superficie: `#FFFFFF`
- Superficie secundaria: `#EEF2F6`
- Texto principal: `#161A1D`
- Texto secundario: `#667085`
- Acento: `#2563EB`
- Acento alternativo: `#16A34A`
- Alerta: `#F59E0B`
- Erro: `#DC2626`

### Melhor para

- App simples e amigavel.
- Leitura muito clara.
- Sensacao mais acessivel para aluno iniciante.

### Risco

- Pode parecer mais comum se nao tiver bons detalhes visuais.

## Tema 3 - Academia Industrial

Sensacao: concreto, metal, treino pesado, mas ainda organizado.

### Direcao visual

- Fundo cinza escuro ou quase preto.
- Superficies com contraste moderado.
- Acentos em vermelho controlado ou amarelo.
- Elementos retos, compactos e objetivos.
- Tipografia forte para numeros de carga, series e progresso.

### Paleta sugerida

- Fundo: `#151515`
- Superficie: `#222222`
- Superficie elevada: `#2F3133`
- Texto principal: `#F2F2F2`
- Texto secundario: `#B0B0B0`
- Acento: `#E11D48`
- Acento alternativo: `#FACC15`
- Alerta: `#F97316`
- Erro: `#EF4444`

### Melhor para

- Identidade mais forte e memoravel.
- Publico que gosta de treino intenso.
- Interface com bastante destaque para performance.

### Risco

- Vermelho demais pode ficar agressivo ou parecer app de alerta.

## Tema 4 - Tecnico Minimalista

Sensacao: preciso, calmo, profissional e muito funcional.

### Direcao visual

- Fundo cinza claro ou escuro neutro.
- Poucas cores.
- Acento em teal/verde-azulado.
- Muito foco em hierarquia, dados e controles.
- Visual proximo de ferramenta, nao de rede social.

### Paleta sugerida

- Fundo: `#F3F5F7`
- Superficie: `#FFFFFF`
- Superficie secundaria: `#E7EBEF`
- Texto principal: `#111827`
- Texto secundario: `#5B6472`
- Acento: `#0F766E`
- Acento alternativo: `#0891B2`
- Alerta: `#D97706`
- Erro: `#B91C1C`

### Melhor para

- App de uso frequente.
- Professor e aluno usando sem distracao.
- Interface mais duravel e menos "modinha".

### Risco

- Pode parecer frio se nao houver bons detalhes de progresso e motivacao.

## Tema 5 - Hibrido recomendado

Sensacao: app fitness moderno, mas sem exagero.

Este e o caminho que eu recomendaria para a primeira versao: base escura, energia controlada e telas bem praticas.

### Direcao visual

- Fundo escuro para reduzir brilho durante treino.
- Cards compactos para rotinas e exercicios.
- Acento verde-lima para acao principal e progresso.
- Ciano para informacoes secundarias, como descanso e historico.
- Numeros grandes para carga, repeticoes e series.
- Layout direto: Inicio, Treino, Historico, Importar.

### Paleta sugerida

- Fundo: `#0F1115`
- Superficie: `#191C22`
- Superficie elevada: `#232832`
- Borda: `#343A46`
- Texto principal: `#F7FAFC`
- Texto secundario: `#A7B0BE`
- Texto fraco: `#737D8C`
- Acao principal: `#A3E635`
- Informacao: `#22D3EE`
- Alerta: `#F59E0B`
- Erro: `#F43F5E`

### Componentes-chave

- Botao principal verde-lima.
- Botao secundario escuro com borda.
- Barra de progresso do ciclo em verde-lima.
- Badge de rotina recomendada em ciano.
- Timer de descanso com numeros grandes.
- Inputs de carga e repeticoes grandes, com controles de incremento.

### Melhor para

- Primeira versao do produto.
- Uso real em academia.
- Visual moderno sem depender de imagens ou ilustracoes.

### Risco

- Precisa cuidar para nao virar uma interface escura generica.

## Minha recomendacao

Para este app, a decisao oficial e oferecer dois temas selecionaveis:

- **Tema claro**, baseado no **Tema 2 - Energia Clara**.
- **Tema escuro**, baseado no **Tema 5 - Hibrido recomendado**.

O tema escuro deve ser o padrao inicial, porque combina melhor com uso em academia e reduz brilho durante o treino. O usuario deve poder trocar para o tema claro nas configuracoes.

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

### Tema claro

Baseado no Tema 2 - Energia Clara.

Usar quando o usuario preferir uma interface mais leve e com leitura clara em ambientes iluminados.

Paleta oficial:

- Fundo: `#F6F8FA`
- Superficie: `#FFFFFF`
- Superficie secundaria: `#EEF2F6`
- Borda: `#D8DEE6`
- Texto principal: `#161A1D`
- Texto secundario: `#667085`
- Texto fraco: `#98A2B3`
- Acao principal: `#2563EB`
- Sucesso/progresso: `#16A34A`
- Informacao: `#0891B2`
- Alerta: `#F59E0B`
- Erro: `#DC2626`

### Tema escuro

Baseado no Tema 5 - Hibrido recomendado.

Usar como tema padrao para a primeira abertura do app.

Paleta oficial:

- Fundo: `#0F1115`
- Superficie: `#191C22`
- Superficie elevada: `#232832`
- Borda: `#343A46`
- Texto principal: `#F7FAFC`
- Texto secundario: `#A7B0BE`
- Texto fraco: `#737D8C`
- Acao principal: `#A3E635`
- Informacao: `#22D3EE`
- Alerta: `#F59E0B`
- Erro: `#F43F5E`

### Regra funcional

- O app deve ter uma configuracao de tema com as opcoes `Claro`, `Escuro` e, futuramente, `Sistema`.
- Na primeira versao, implementar pelo menos `Claro` e `Escuro`.
- Salvar a preferencia localmente no dispositivo.
- Aplicar o tema sem exigir reinicio do app.
- O tema escolhido deve afetar todas as telas principais.
- Componentes devem usar tokens de design, nao cores fixas espalhadas pela UI.

## Decisao pendente

Nao ha mais decisao pendente sobre direcao visual principal. A primeira versao deve suportar tema claro e escuro.

Depois da escolha, atualizar:

- `AGENTS.md`, para o Codex seguir o tema em todas as telas.
- `docs/arquitetura/arquitetura-prompt.md`, se a identidade visual virar uma decisao oficial do produto.
- O roteiro de execucoes, para incluir uma etapa de design tokens antes do scaffold visual.
