# Prompt arquitetural - aplicativo local de treino de academia

Voce e um engenheiro de software senior especializado em aplicativos mobile web e Android. Projete e implemente um aplicativo simples, de baixo custo e 100% local no dispositivo para controlar treinos de academia importados por JSON. A primeira entrega deve funcionar como PWA, mas a arquitetura deve permanecer pronta para gerar APK Android e, futuramente, publicar na Google Play.

## Objetivo do produto

Criar um app para o aluno importar um plano de treino em JSON, executar os treinos, registrar progresso, acompanhar cargas usadas em cada exercicio e saber quando ja completou treinos suficientes para pedir um novo plano.

O app tambem deve disponibilizar para download um JSON de modelo, para que o aluno ou professor possa enviar esse modelo a uma IA e pedir a geracao de um novo treino compativel com o aplicativo.

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

### Estrategia de distribuicao

- Primeira entrega: PWA instalavel pelo navegador, com funcionamento offline.
- Android: manter o projeto preparado para gerar APK de instalacao direta e AAB para publicacao futura na Google Play.
- iPhone/iOS: nao publicar na App Store na primeira fase.
- Evitar dependencias exclusivas de iOS ou recursos que compliquem a entrega PWA/Android.
- Toda funcionalidade essencial deve funcionar no PWA antes de ser empacotada como Android.
- Quando houver diferenca entre PWA e Android, isolar a diferenca em adaptadores de plataforma.

Fluxo de build previsto para Android:

```bash
npm run build
npx cap sync android
npx cap open android
```

Para PWA, publicar o build estatico em hospedagem com HTTPS, manifest, service worker e icones do aplicativo.

### Separacao em camadas

Organizar o projeto em camadas simples:

- `src/app`: bootstrap da aplicacao, rotas, providers e configuracao do Capacitor.
- `src/features/workouts`: telas e componentes de treino, rotinas, exercicios e sessao ativa.
- `src/features/import-export`: importacao do JSON, validacao, preview, substituicao do plano ativo e download do modelo.
- `src/features/progress`: historico de cargas, resumo de progresso e aviso de ciclo concluido.
- `src/features/settings`: configuracoes locais, incluindo escolha de tema claro/escuro.
- `src/components`: componentes visuais reutilizaveis.
- `src/components/ui`: componentes primitivos baseados em shadcn/ui.
- `src/domain`: tipos de dominio, regras de negocio e schemas Zod.
- `src/services`: casos de uso locais, como importar plano, iniciar treino, finalizar treino e calcular progressao.
- `src/storage`: repositorios e adaptadores SQLite/IndexedDB.
- `src/platform`: adaptadores para recursos especificos de PWA ou Android, como download, compartilhamento, arquivos e armazenamento.
- `src/theme`: tokens visuais, variaveis CSS e configuracao de tema claro/escuro.
- `src/assets`: arquivo `meu-treino-modelo.json` usado no download do modelo.

### Backend local

Tratar o "backend" como uma camada local de servicos TypeScript dentro do aplicativo:

- `WorkoutImportService`: valida o JSON, cria um novo plano ativo e desativa o plano anterior.
- `WorkoutSessionService`: inicia, atualiza e finaliza uma sessao de treino.
- `RoutineRecommendationService`: identifica a proxima rotina recomendada com base na ultima rotina finalizada no plano ativo.
- `ProgressService`: calcula treinos completos, cargas anteriores e evolucao por exercicio.
- `TemplateExportService`: fornece o JSON de modelo para download ou compartilhamento.
- `ExerciseMatchService`: reaproveita cargas antigas quando o novo plano contem exercicios ja realizados.

Essa camada nao deve depender diretamente da UI. A UI chama servicos e repositorios por interfaces.

## Modelo de dados local

Criar tabelas locais aproximadas:

- `workout_plans`: plano importado, nome, objetivo, nivel, semanas estimadas, dias por semana, ativo, data de importacao.
- `routines`: rotinas do plano, nome, ordem e referencia ao plano.
- `routine_steps`: aquecimento e cooldown, com atividade, duracao, notas e tipo.
- `exercises`: cadastro normalizado do exercicio, com nome, grupo muscular, equipamento, unilateral e chave canonica.
- `planned_exercises`: exercicios de uma rotina especifica, com series, alvo de repeticoes, RIR, descanso, cadencia, tecnica avancada, notas e media_url.
- `workout_sessions`: execucoes de treino, rotina executada, inicio, fim, status e plano ativo no momento.
- `workout_plan_progress`: estado do plano ativo, com total de treinos concluidos, ultima rotina finalizada, ordem da ultima rotina finalizada e data da ultima conclusao.
- `exercise_logs`: execucao de cada exercicio dentro de uma sessao.
- `set_logs`: carga, repeticoes, RIR percebido, observacoes e numero da serie.
- `exercise_load_history`: historico resumido por exercicio para recuperar ultima carga usada e acompanhar progressao.
- `app_settings`: configuracoes locais, versao do schema, tema escolhido e preferencias simples.

## Regras de importacao de treino

O JSON importado deve seguir uma raiz `workout_plan` com metadados do plano, lista de `routines`, aquecimento, exercicios e cooldown.

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
- Quando `treinos_concluidos >= treinos_planejados`, exibir aviso: "Ciclo concluido. Baixe o modelo e gere um novo treino."

## Telas principais

- Inicio: plano ativo, proximo treino sugerido, progresso do ciclo e botao para iniciar treino.
- Treino do dia: lista de aquecimento, exercicios, series, carga sugerida, repeticoes, RIR e descanso.
- Execucao de exercicio: registro rapido de cada serie, com carga, repeticoes e observacoes.
- Historico: treinos concluidos e evolucao de carga por exercicio.
- Importar treino: selecionar JSON, validar, preview e substituir plano atual.
- Baixar modelo: baixar ou compartilhar `meu-treino-modelo.json`.
- Configuracoes: exportar backup local, apagar dados locais e informacoes da versao.

### Direcao de usabilidade aprovada

A primeira versao deve seguir o modelo de usabilidade **Guiada**:

- A tela inicial deve priorizar o proximo treino recomendado.
- O botao principal deve ser iniciar o treino recomendado.
- O plano completo deve existir, mas nao deve competir com a acao principal.
- A tela de execucao deve ser focada no uso durante a academia, com registro rapido de series, timer de descanso e poucos elementos concorrendo por atencao.
- O detalhamento e aprovacao das telas deve seguir `docs/ux-prototipo-aprovado.md` antes da implementacao visual final.

## Experiencia mobile

- Interface pensada primeiro para celular.
- Botoes grandes o suficiente para uso durante o treino.
- Registro de serie em poucos toques.
- Campos numericos com teclado adequado.
- Funcionar offline sempre.
- Evitar textos longos durante a execucao do treino.
- Mostrar descanso com timer simples.
- Usar componentes React customizados e shadcn/ui para uma interface moderna, com comportamento consistente em PWA e Android.
- Garantir instalabilidade como PWA com `manifest.webmanifest`, service worker, icones e suporte offline.

## Identidade visual e temas

O app deve suportar dois temas selecionaveis:

- Tema claro, baseado no `Tema 2 - Energia Clara` de `docs/identidade-visual-opcoes.md`.
- Tema escuro, baseado no `Tema 5 - Hibrido recomendado` de `docs/identidade-visual-opcoes.md`.

Regras:

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
- Baixar o JSON de modelo.
- Visualizar plano ativo e rotinas.
- Recomendar automaticamente a proxima rotina com base na ultima rotina finalizada.
- Escolher entre tema claro e tema escuro.
- Iniciar e finalizar treino.
- Registrar carga e repeticoes por serie.
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

- O usuario consegue baixar o JSON de modelo pelo app.
- O usuario consegue importar um JSON valido seguindo o modelo.
- O app exibe o plano importado com rotinas e exercicios.
- O app recomenda a primeira rotina quando nenhum treino foi finalizado no plano ativo.
- Ao finalizar uma rotina, o app salva essa rotina como a ultima finalizada e passa a recomendar a proxima pela ordem do plano.
- Ao finalizar a ultima rotina da lista, o app recomenda novamente a primeira rotina.
- O usuario consegue alternar entre tema claro e escuro, e a preferencia fica salva localmente.
- O usuario consegue executar um treino e registrar series.
- O app salva carga, repeticoes e status do treino localmente.
- Ao importar um novo plano, o app nao precisa manter o progresso do plano antigo, mas preserva e reaproveita cargas de exercicios ja realizados.
- O app calcula treinos concluidos e avisa quando o ciclo planejado acabou.
- O app funciona offline como PWA.
- O app pode ser empacotado como Android/APK com Capacitor sem reescrever a interface.
