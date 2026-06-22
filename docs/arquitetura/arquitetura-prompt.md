# Prompt arquitetural - aplicativo local de treino de academia

Voce e um engenheiro de software senior especializado em aplicativos mobile web e Android. Projete e implemente um aplicativo simples, de baixo custo e 100% local no dispositivo para controlar treinos de academia importados por JSON. A primeira entrega deve funcionar como PWA, mas a arquitetura deve permanecer pronta para gerar APK Android e, futuramente, publicar na Google Play.

## Objetivo do produto

Criar um app para o aluno importar um plano de treino em JSON, executar os treinos, registrar progresso por exercicio, acompanhar cargas usadas em cada exercicio e saber quando ja completou treinos suficientes para pedir um novo plano.

O app tambem deve disponibilizar um prompt recomendado copiavel, com instrucao para a IA buscar por GET o JSON de modelo e o catalogo resumido de exercicios com `visual_id` e metadados de escolha. Assim, o aluno ou professor pode colar um unico prompt em uma IA e pedir a geracao de um novo treino compativel com o aplicativo.

## Decisoes arquiteturais

### Stack principal

- Usar React + Vite + TypeScript como base da aplicacao.
- Usar Tailwind CSS para estilos, responsividade e tokens visuais.
- Usar shadcn/ui como base de componentes modernos, acessiveis e customizaveis.
- Usar lucide-react para icones.
- Nao usar Ionic Framework como biblioteca visual na primeira versao.
- Usar Capacitor apenas para manter a mesma aplicacao pronta para empacotamento Android.
- Usar SQLite local no Android empacotado por meio de `@capacitor-community/sqlite`.
- Usar IndexedDB no modo web/PWA, com Dexie, mantendo a mesma interface de repositorio.
- Usar Zod para validar o JSON importado antes de gravar no banco.
- Usar Zustand para estado de UI simples e TanStack Query apenas se a camada de dados ficar mais complexa.
- Nao usar backend remoto, servidor, login obrigatorio, API externa ou banco em nuvem.
- Toda implementacao deve respeitar a metodologia [Twelve-Factor App](https://12factor.net/) onde ela se aplica a este codigo PWA/Android: dependencias declaradas explicitamente, configuracao de deploy via ambiente, separacao clara entre build/release/run, processos descartaveis e logs como fluxo de eventos. Essa regra nao muda o escopo de dados 100% locais no dispositivo nem autoriza backend remoto sem pedido explicito.

### Estrategia de distribuicao

- Primeira entrega: PWA instalavel pelo navegador, com funcionamento offline.
- Android: manter o projeto preparado para gerar APK de instalacao direta e AAB para publicacao futura na Google Play.
- iPhone/iOS: nao publicar na App Store na primeira fase.
- Evitar dependencias exclusivas de iOS ou recursos que compliquem a entrega PWA/Android.
- Toda funcionalidade essencial deve funcionar no PWA antes de ser empacotada como Android.
- Quando houver diferenca entre PWA e Android, isolar a diferenca em adaptadores de plataforma.
- Hospedagem PWA escolhida: Cloudflare Pages conectado ao repositorio GitHub, com deploy automatico por push e previews para pull requests.

Fluxo de build previsto para Android:

```bash
npm run build
npx cap sync android
npx cap open android
```

Para PWA, publicar o build estatico em Cloudflare Pages com HTTPS, manifest, service worker e icones do aplicativo. A configuracao operacional fica em `docs/arquitetura/deploy-cloudflare.md`.

### Assets de identidade

Os assets oficiais de identidade visual ficam em `assets/identity` e devem ser usados quando a aplicacao precisar de marca, logo, icones de instalacao, icones Android ou splash screens.

Arquivos disponiveis:

- `brand-mark.svg`: marca principal aprovada.
- `logo-horizontal.svg`: logo horizontal com o texto "Meu Treino".
- `app-icon-source.png`: fonte raster principal do icone do app, em 1024 x 1024 px.
- `pwa-icon-any-192.png` e `pwa-icon-any-512.png`: icones PWA comuns para o manifest.
- `pwa-icon-maskable-512.png` e `pwa-icon-maskable-1024.png`: icones PWA maskable para instalacao.
- `android-icon-foreground.png`: camada frontal do icone adaptativo Android.
- `android-icon-background.png`: camada de fundo do icone adaptativo Android.
- `android-icon-monochrome.svg`: versao monocromatica para icone tematico Android.
- `splash.png` e `splash-dark.png`: splash screens claro e escuro.

Regras:

- Reutilizar esses arquivos antes de gerar ou desenhar novos assets de marca.
- Usar esses arquivos no `manifest.webmanifest`, na configuracao PWA e na configuracao Android/Capacitor quando aplicavel.
- Nao usar os assets de marca como substitutos para icones internos de interface; a UI deve continuar usando `lucide-react` para navegacao, botoes e acoes.
- Se a identidade visual mudar, atualizar `assets/identity`, este documento e `docs/arquitetura/identidade-visual-opcoes.md`.

### Separacao em camadas

Organizar o projeto em camadas simples:

- `src/app`: bootstrap da aplicacao, rotas, providers e configuracao do Capacitor.
- `src/features/workouts`: telas e componentes de treino, rotinas, exercicios e sessao ativa.
- `src/features/import-export`: importacao do JSON, validacao, preview, substituicao do plano ativo e copia do prompt recomendado para gerar novo treino.
- `src/features/progress`: historico de cargas, resumo de progresso e aviso de ciclo concluido.
- `src/features/settings`: configuracoes locais, incluindo escolha de tema claro/escuro.
- `src/components`: componentes visuais reutilizaveis.
- `src/components/ui`: componentes primitivos baseados em shadcn/ui.
- `src/domain`: tipos de dominio, regras de negocio e schemas Zod.
- `src/services`: casos de uso locais, como importar plano, iniciar treino, finalizar treino e calcular progressao.
- `src/storage`: repositorios e adaptadores SQLite/IndexedDB.
- `src/platform`: adaptadores para recursos especificos de PWA ou Android, como download, compartilhamento, arquivos e armazenamento.
- `src/theme`: tokens visuais, variaveis CSS e configuracao de tema claro/escuro.
- `src/assets`: arquivos fonte `meu-treino-modelo.json`, `prompt-treino-modelo.md` e `meu-treino-catalogo-exercicios.json` usados para copiar o prompt recomendado e manter os contratos auxiliares.
- `public`: deve expor `meu-treino-modelo.json` e `meu-treino-catalogo-exercicios.json` em URLs estaveis para GET pela IA. No dominio de producao atual, as URLs sao `https://meu-treino-8gq.pages.dev/meu-treino-modelo.json` e `https://meu-treino-8gq.pages.dev/meu-treino-catalogo-exercicios.json`.
- O catalogo publico de exercicios deve ser gerado a partir de `src/config/exercise-media-library.json`, mas deve expor somente dados seguros para a IA escolher o exercicio: `visual_id`, `name`, `equipment`, `body_part`, `target`, `secondary_muscles` e `movement_pattern`. Ele nao deve expor `image_asset`, `animation_asset`, paths internos, URLs de midia ou metadados de origem/licenca.

### Backend local

Tratar o "backend" como uma camada local de servicos TypeScript dentro do aplicativo:

- `WorkoutImportService`: valida o JSON, cria um novo plano ativo e desativa o plano anterior.
- `WorkoutSessionService`: inicia, atualiza e finaliza uma sessao de treino, registrando carga e repeticoes uma vez por exercicio na primeira versao.
- `RoutineRecommendationService`: identifica a proxima rotina recomendada com base na ultima rotina finalizada no plano ativo.
- `ProgressService`: calcula treinos completos, cargas anteriores e evolucao por exercicio.
- `TemplateExportService`: fornece o prompt recomendado para copia/compartilhamento e mantem o JSON de modelo e o catalogo resumido de exercicios acessiveis por GET publico.
- `ExerciseMatchService`: reaproveita cargas antigas quando o novo plano contem exercicios ja realizados.

Essa camada nao deve depender diretamente da UI. A UI chama servicos e repositorios por interfaces.

## Modelo de dados local

Criar tabelas locais aproximadas:

- `workout_plans`: plano importado, nome, objetivo, nivel, semanas estimadas, dias por semana, ativo, data de importacao.
- `routines`: rotinas do plano, nome, ordem e referencia ao plano.
- `routine_steps`: aquecimento e cooldown, com atividade, duracao, notas e tipo.
- `exercises`: cadastro normalizado do exercicio, com nome, grupo muscular, equipamento, unilateral e chave canonica.
- `planned_exercises`: exercicios de uma rotina especifica, com series planejadas, alvo de repeticoes, RIR alvo opcional, descanso, cadencia, tecnica avancada, notas, orientacao visual opcional e media_url.
- `workout_sessions`: execucoes de treino, rotina executada, inicio, fim, status e plano ativo no momento.
- `workout_plan_progress`: estado do plano ativo, com total de treinos concluidos, ultima rotina finalizada, ordem da ultima rotina finalizada e data da ultima conclusao.
- `exercise_logs`: execucao de cada exercicio dentro de uma sessao.
- `set_logs`: registro tecnico local com carga, repeticoes, RIR opcional/nulo, observacoes e numero do registro. Na primeira versao, a UI registra uma vez por exercicio e pode persistir um registro tecnico unico com `set_number = 1` para manter compatibilidade com o historico.
- `exercise_load_history`: historico resumido por exercicio para recuperar ultima carga usada e acompanhar progressao.
- `app_settings`: configuracoes locais, versao do schema, tema escolhido e preferencias simples.

## Regras de importacao de treino

O JSON importado deve seguir uma raiz `workout_plan` com metadados do plano, lista de `routines`, aquecimento, exercicios e cooldown.

Contrato inicial validado pelo app:

- Raiz obrigatoria: `workout_plan`.
- Metadados obrigatorios do plano: `name`, `objective`, `level`, `estimated_duration_weeks`, `days_per_week` e `routines`.
- Metadado opcional do plano: `plan_id`.
- Cada rotina deve conter `routine_id`, `name`, `order` e pelo menos um item em `exercises`.
- Cada rotina pode conter `warmup` e `cooldown` como listas de passos com `activity`, `duration_minutes`, `type` opcional (`warmup` ou `cooldown`) e `notes` opcional.
- Cada exercicio planejado deve conter `name`, `muscle_group`, `equipment`, `is_unilateral`, `sets` e `target_reps`.
- Campos opcionais do exercicio: `exercise_id`, `target_rir`, `rest_seconds`, `tempo`, `advanced_technique`, `primary_muscles`, `secondary_muscles`, `movement_pattern`, `visual_id`, `execution_cues`, `notes` e `media_url`.
- `primary_muscles`, `secondary_muscles` e `execution_cues` devem ser listas de textos curtos quando informados.
- `movement_pattern` deve usar somente um identificador presente nos exercicios de `src/config/exercise-media-library.json`.
- O app usa `movement_pattern` para validar o padrao do movimento; ele nao deve renderizar imagem por conta propria nem substituir `execution_cues`.
- A lista efetivamente validada pelo app vem de `src/config/exercise-media-library.json`, que e a fonte unica de exercicios aceitos, `visual_id` conhecidos e padroes de movimento suportados.
- `visual_id` deve ser informado somente quando houver correspondencia exata em `src/config/exercise-media-library.json`; se nao houver correspondencia, o JSON importado e invalido.
- `estimated_duration_weeks`, `days_per_week`, `order`, `duration_minutes`, `sets` e `rest_seconds` devem ser inteiros positivos.
- `target_rir` deve ser inteiro maior ou igual a zero quando informado.

Fluxo esperado:

1. Usuario escolhe um arquivo `.json`.
2. App le o arquivo localmente.
3. App valida com Zod.
4. App mostra um preview com nome do plano, objetivo, nivel, semanas estimadas, dias por semana e quantidade de rotinas/exercicios.
5. Usuario confirma a substituicao do treino atual.
6. App desativa o plano ativo anterior.
7. App grava o novo plano, rotinas e exercicios.
8. App reaproveita a ultima carga conhecida para exercicios equivalentes.

Nao e necessario preservar a sequencia/progresso do plano antigo, mas a carga usada anteriormente deve continuar disponivel. Para isso, historico de carga deve ser salvo por exercicio normalizado, nao apenas por plano.

Para identificar exercicios equivalentes:

- Preferir `exercise_id` quando ele for estavel entre planos.
- Se o `exercise_id` mudar, usar uma chave canonica com `name + muscle_group + equipment + is_unilateral`, normalizada em minusculas, sem acentos e sem espacos extras.
- Se houver conflito, mostrar sugestao de equivalencia para o usuario confirmar em versao futura. Na primeira versao, aplicar a melhor correspondencia automaticamente.

## Controle de progresso

O app deve controlar:

- Quantidade de treinos finalizados no plano ativo.
- Quantidade de vezes que cada rotina foi concluida.
- Ultima carga usada por exercicio.
- Maior carga registrada por exercicio.
- Evolucao de carga entre sessoes.
- Indicacao de que esta na hora de montar novo treino.
- Ultima rotina finalizada no plano ativo.
- Proxima rotina recomendada.

### Controle da proxima rotina recomendada

O app deve salvar qual foi a ultima rotina finalizada para recomendar automaticamente o proximo treino.

Regras:

- Ao importar um novo plano, criar um registro em `workout_plan_progress` com `last_completed_routine_id = null`, `last_completed_routine_order = null` e `completed_sessions_count = 0`.
- Quando o usuario finalizar uma sessao de treino, atualizar `workout_plan_progress` com a rotina finalizada, a ordem da rotina e a data de conclusao.
- Para recomendar a proxima rotina, ordenar as rotinas do plano ativo pelo campo `order`.
- Se ainda nao houver rotina finalizada no plano ativo, recomendar a primeira rotina pela ordem.
- Se houver uma ultima rotina finalizada, recomendar a rotina com `order` imediatamente maior.
- Se a ultima rotina finalizada for a ultima da lista, recomendar novamente a primeira rotina, reiniciando o ciclo.
- Se a rotina salva como ultima finalizada nao existir mais no plano ativo, recomendar a primeira rotina pela ordem.

Assinatura sugerida do caso de uso:

```ts
type NextRoutineRecommendation = {
  routineId: string;
  routineName: string;
  routineOrder: number;
  reason: "first-workout" | "after-last-completed" | "cycle-restarted" | "missing-last-routine";
};

async function getNextRecommendedRoutine(activePlanId: string): Promise<NextRoutineRecommendation | null>;
```

Ao finalizar treino, o app deve chamar uma funcao equivalente a:

```ts
async function markRoutineAsCompleted(input: {
  planId: string;
  routineId: string;
  routineOrder: number;
  completedAt: string;
}): Promise<void>;
```

Regra simples para aviso de novo treino:

- Calcular `treinos_planejados = estimated_duration_weeks * days_per_week`.
- Calcular `treinos_concluidos` do plano ativo.
- Quando `treinos_concluidos >= treinos_planejados`, exibir aviso: "Ciclo concluido. Copie o prompt e gere um novo treino."

## Telas principais

- Inicio: plano ativo, proximo treino sugerido, progresso do ciclo e botao para iniciar o treino recomendado.
- Treino: lista todas as rotinas do plano ativo para o usuario escolher qual rotina quer executar no dia, com a rotina recomendada destacada.
- Execucao de treino: mostrar a lista completa da rotina dentro da propria execucao, com separacao visual para aquecimento, exercicios e cooldown; permitir escolher o exercicio inicial ou alternar exercicios pela lista; exercicios nao selecionados devem ficar compactos, sem series, progresso, descanso ou RIR alvo; o exercicio selecionado deve expandir no proprio item da lista com meta, guia visual, series, descanso, registro final de carga/reps e carga sugerida/ultima carga quando houver.
- Execucao de exercicio: marcar series concluidas durante o exercicio para disparar descanso entre series; registrar carga e repeticoes apenas no fim do exercicio; mostrar orientacao visual opcional em painel recolhido por padrao, abrindo por `Ver como fazer`; RIR nao aparece como campo obrigatorio na primeira versao e fica reservado para melhoria futura.
- Historico: treinos concluidos e evolucao de carga por exercicio.
- Importar treino: acao contextual na Home sem treino ou em Configuracoes com treino ativo; selecionar JSON, validar, mostrar preview e substituir plano atual.
- Criar treino com IA: acao contextual na Home sem treino ou em Configuracoes com treino ativo; copia o conteudo de `prompt-treino-modelo.md`. O prompt deve instruir a IA a buscar por GET `meu-treino-modelo.json` e `meu-treino-catalogo-exercicios.json` nas URLs publicas do app. Se o GET de qualquer um desses arquivos falhar, a IA deve interromper a geracao do treino e pedir ao usuario para corrigir o acesso aos arquivos auxiliares antes de continuar.
- Configuracoes: exportar backup local, apagar dados locais e informacoes da versao.

### Direcao de usabilidade aprovada

A primeira versao deve seguir o modelo de usabilidade **Guiada**:

- A tela inicial deve priorizar o proximo treino recomendado.
- O botao principal deve ser iniciar o treino recomendado.
- O plano completo deve existir, mas nao deve competir com a acao principal da tela inicial.
- O item `Treino` da navegacao inferior deve listar todas as rotinas do plano ativo, permitindo escolher uma rotina diferente da recomendada quando fizer sentido para o usuario.
- Ao tocar em uma rotina na lista do menu `Treino`, o app deve abrir a execucao da rotina com a lista completa de exercicios visivel na propria `UX-04`.
- A tela de execucao deve ser focada no uso durante a academia, com registro rapido por exercicio, timer de descanso e poucos elementos concorrendo por atencao.
- A orientacao visual da tela de execucao deve ficar recolhida por padrao para nao competir com o treino; quando aberta, deve priorizar musculo principal, musculos auxiliares em cor mais fria, movimento do exercicio quando houver asset e ate 3 dicas curtas.
- A evolucao do guia visual deve seguir `.agents/plano-incorporacao-biblioteca-exercicios.md`: usar somente assets especificos validados por exercicio ou alias confiavel; `movement_pattern` permanece para dicas e classificacao, nao como imagem generica.
- Toda midia de exercicio usada a partir de bibliotecas externas deve ser importada para este repositorio e servida como asset local. O app nao deve acessar GitHub, raw.githubusercontent.com, CDN ou qualquer URL remota de midia durante a execucao.
- O detalhamento e aprovacao das telas deve seguir `docs/arquitetura/ux-prototipo-aprovado.md` antes da implementacao visual final.

## Experiencia mobile

- Interface pensada primeiro para celular.
- Botoes grandes o suficiente para uso durante o treino.
- Registro do exercicio em poucos toques.
- Campos numericos com teclado adequado.
- Funcionar offline sempre.
- Evitar textos longos durante a execucao do treino.
- Mostrar descanso com timer simples.
- Usar componentes React customizados e shadcn/ui para uma interface moderna, com comportamento consistente em PWA e Android.
- Garantir instalabilidade como PWA com `manifest.webmanifest`, service worker, icones e suporte offline.

## Identidade visual e temas

O app deve suportar dois temas selecionaveis:

- Tema claro, baseado no `Tema 2 - Energia Clara` de `docs/arquitetura/identidade-visual-opcoes.md`.
- Tema escuro, baseado no `Tema 5 - Hibrido recomendado` de `docs/arquitetura/identidade-visual-opcoes.md`.

Regras:

- A identidade de marca oficial ja possui arquivos prontos em `assets/identity` e eles devem ser usados para branding, icones PWA, icones Android e splash screens.
- Usar o tema escuro como padrao na primeira abertura.
- Permitir que o usuario alterne entre claro e escuro nas configuracoes.
- Salvar a preferencia localmente em `app_settings`.
- Aplicar a troca de tema sem reiniciar o app.
- Implementar cores por tokens/variaveis CSS em `src/theme`, evitando cores fixas nos componentes.
- A UI deve manter contraste adequado nos dois temas.
- A tela inicial, execucao de treino, importacao, historico e configuracoes devem respeitar o tema escolhido.

## Requisitos funcionais

- Importar um novo JSON de treino.
- Validar estrutura antes de salvar.
- Substituir o treino ativo atual.
- Copiar o prompt recomendado para IA, com URLs GET do JSON de modelo e do catalogo resumido de exercicios, bloqueando a geracao quando qualquer GET falhar.
- Visualizar plano ativo e rotinas.
- Recomendar automaticamente a proxima rotina com base na ultima rotina finalizada.
- Escolher entre tema claro e tema escuro.
- Iniciar e finalizar treino.
- Marcar series concluidas durante a execucao, ver descanso entre series e registrar carga e repeticoes por exercicio apenas ao finalizar o exercicio.
- Ver orientacao visual opcional do exercicio durante a execucao, com painel recolhivel e fallback baseado em musculos/dicas do JSON.
- Manter RIR como dado opcional/nulo no dominio e storage, sem exigir preenchimento visivel na primeira versao.
- Recuperar ultima carga usada em exercicios ja conhecidos.
- Contar treinos concluidos no ciclo atual.
- Avisar quando o ciclo terminou.
- Consultar historico de cargas por exercicio.

## Requisitos nao funcionais

- Aplicacao offline-first.
- Dados 100% locais no dispositivo.
- Primeira versao distribuivel como PWA.
- Projeto preparado para build Android via Capacitor.
- Tema visual implementado por tokens reutilizaveis.
- Baixo custo de desenvolvimento e manutencao.
- Sem dependencia de backend remoto.
- Codigo tipado em TypeScript.
- Validacao forte do JSON.
- Banco local versionado com migrations.
- Possibilidade futura de backup/exportacao dos dados.

## Fora do escopo da primeira versao

- Login de usuario.
- Sincronizacao em nuvem.
- Painel web para professores.
- Publicacao na App Store/iPhone na primeira fase.
- Pagamentos.
- Chat com IA dentro do app.
- Geracao automatica de treino dentro do app.
- Analise com camera ou sensores.
- Prescricao medica/nutricional.

## Criterios de aceite da primeira versao

- O usuario consegue copiar o prompt recomendado pelo app, e esse prompt contem as URLs GET do JSON de modelo e do catalogo resumido de exercicios, com instrucao para interromper a geracao se qualquer GET falhar.
- O usuario consegue importar um JSON valido seguindo o modelo.
- O app exibe o plano importado com rotinas e exercicios.
- O app recomenda a primeira rotina quando nenhum treino foi finalizado no plano ativo.
- Ao finalizar uma rotina, o app salva essa rotina como a ultima finalizada e passa a recomendar a proxima pela ordem do plano.
- Ao finalizar a ultima rotina da lista, o app recomenda novamente a primeira rotina.
- O usuario consegue alternar entre tema claro e escuro, e a preferencia fica salva localmente.
- O usuario consegue executar um treino, marcar series concluidas, ver descanso entre series e registrar carga e repeticoes ao final de cada exercicio.
- Durante a execucao, o usuario consegue abrir e ocultar um guia visual do exercicio quando houver metadados ou mapeamento local disponivel.
- O app salva carga, repeticoes e status do treino localmente.
- Ao importar um novo plano, o app nao precisa manter o progresso do plano antigo, mas preserva e reaproveita cargas de exercicios ja realizados.
- O app calcula treinos concluidos e avisa quando o ciclo planejado acabou.
- O app funciona offline como PWA.
- O app pode ser empacotado como Android/APK com Capacitor sem reescrever a interface.
