# Plano - integracao Health Connect no Android

Data: 2026-06-22

Status: E7 documentada; aguardando validacao nativa com JDK/dispositivo Android

## Objetivo

Adicionar ao APK Android do `meu-treino` uma integracao simples e funcional com Health Connect: quando o usuario finalizar um treino no app, a sessao sera gravada no Health Connect como treino de musculacao, mantendo o app offline-first e sem backend remoto.

## Decisao de escopo

- Usar Health Connect como primeira integracao Android.
- Nao integrar diretamente com Samsung Health Data SDK nesta fase.
- Nao criar app Wear OS nesta fase.
- Nao capturar frequencia cardiaca, calorias, VO2, passos, distancia ou dados do relogio nesta fase.
- Manter PWA sem Health Connect; a integracao existe somente no APK Android via Capacitor.
- Exportar para Health Connect depois que a sessao local for salva com sucesso.
- Nunca bloquear o salvamento local do treino por erro de Health Connect.

## Como deve funcionar para o usuario

1. Usuario instala o APK no Android.
2. Usuario abre Configuracoes no `meu-treino`.
3. Usuario toca em "Conectar ao Health Connect".
4. Android mostra a tela de permissao do Health Connect.
5. Usuario concede permissao de escrita de exercicios.
6. Usuario inicia e executa o treino normalmente no `meu-treino`.
7. Ao finalizar o treino, o app salva a sessao no banco local.
8. Se a integracao estiver ativa e a permissao existir, o app exporta a sessao para Health Connect.
9. O app mostra sucesso discreto, por exemplo: "Treino enviado ao Health Connect".
10. Se Samsung Health estiver conectado ao Health Connect pelo usuario, o treino podera aparecer tambem no ecossistema Samsung conforme a sincronizacao do Samsung Health.

## Dados exportados no MVP

Obrigatorio:

- `ExerciseSessionRecord`
- tipo de exercicio: `EXERCISE_TYPE_WEIGHTLIFTING`
- titulo: nome da rotina, por exemplo "Treino A - Peito e triceps"
- inicio: `workout_sessions.startedAt`
- fim: `workout_sessions.completedAt`
- `clientRecordId`: `meu-treino:workout-session:{sessionId}`
- `clientRecordVersion`: timestamp/versionamento local da sessao
- metadata de dispositivo: telefone, registro manual/ativo pelo app

Desejavel se a modelagem e o SDK ficarem consistentes:

- `ExerciseSegment` para exercicios registrados no treino.
- peso em kg quando informado.
- repeticoes quando informadas.
- `setIndex` quando houver dados suficientes.

Fallback aceitavel no primeiro corte:

- Exportar a sessao sem segmentos e incluir um resumo curto em `notes`.
- So adicionar segmentos depois de garantir timestamps nao sobrepostos por exercicio/set.

## Dados fora do MVP

- Frequencia cardiaca do Galaxy Watch.
- Calorias calculadas pelo relogio.
- Leitura de dados existentes do Health Connect.
- Mesclagem automatica entre uma sessao do Samsung Health e uma sessao do `meu-treino`.
- Exclusao remota em Health Connect quando uma sessao local for apagada.
- App Wear OS.
- Sincronizacao em nuvem.

## Referencias oficiais a carregar antes da implementacao

- Health Connect get started: https://developer.android.com/health-and-fitness/health-connect/get-started
- Health Connect data types: https://developer.android.com/health-and-fitness/health-connect/data-types
- Health Connect write data: https://developer.android.com/health-and-fitness/health-connect/write-data
- Health Connect sync data: https://developer.android.com/health-and-fitness/health-connect/sync-data
- Samsung Health via Health Connect: https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect
- Samsung Health Data SDK overview: https://developer.samsung.com/health/data/overview.html

## Dependencias e permissoes previstas

Dependencia Android a confirmar no inicio da execucao:

- `androidx.health.connect:connect-client`

Regra do projeto:

- Esta e uma nova dependencia Android de producao. Antes de implementar, confirmar a versao atual nos docs oficiais e registrar a justificativa no PR/commit.

Permissoes Android previstas:

- `android.permission.health.WRITE_EXERCISE`

Nao pedir no MVP:

- `READ_EXERCISE`
- `READ_HEART_RATE`
- `WRITE_HEART_RATE`
- `READ_TOTAL_CALORIES_BURNED`
- `WRITE_TOTAL_CALORIES_BURNED`
- `WRITE_EXERCISE_ROUTE`

Justificativa: pedir somente o minimo necessario para gravar a sessao criada pelo proprio app.

Tambem sera necessario:

- declarar `com.google.android.apps.healthdata` em `<queries>` para verificar disponibilidade;
- criar uma tela/activity nativa de explicacao de permissoes do Health Connect quando exigido;
- manter uma politica de privacidade curta e coerente com uso local de dados de saude se o app for para Google Play;
- preencher declaracoes de Health Apps/Data Safety no Google Play se houver publicacao futura.

## Arquitetura alvo

Camadas:

- `src/platform/health-connect`: contrato TypeScript e adaptadores PWA/Android.
- `src/services`: caso de uso local para montar payload exportavel a partir da sessao finalizada.
- `src/features/settings`: UI para conectar, ver status e gerenciar permissao.
- `src/features/workouts`: gatilho pos-finalizacao de treino.
- `src/storage`: estado minimo de preferencia/exportacao, se necessario.
- `android/app/src/main/java/com/meutreino/app/...`: plugin nativo Capacitor para Health Connect.

Principio:

- A UI chama um contrato TypeScript.
- O contrato usa um adaptador no PWA que retorna `unsupported-platform`.
- No Android, o contrato chama um plugin Capacitor nativo.
- O plugin nativo conversa com Health Connect.
- O banco local continua sendo a fonte da verdade.

## Modelo TypeScript sugerido

```ts
export type HealthConnectStatus =
  | "unsupported-platform"
  | "unavailable"
  | "requires-install"
  | "available"
  | "permission-missing"
  | "ready";

export type HealthConnectWorkoutExport = {
  sessionId: string;
  clientRecordId: string;
  clientRecordVersion: number;
  title: string;
  notes: string | null;
  startedAt: string;
  completedAt: string;
  exerciseType: "weightlifting";
  segments: HealthConnectWorkoutSegment[];
};

export type HealthConnectWorkoutSegment = {
  exerciseName: string;
  startedAt: string;
  completedAt: string;
  repetitions: number | null;
  weightKg: number | null;
  setIndex: number | null;
};

export type HealthConnectAdapter = {
  getStatus(): Promise<HealthConnectStatus>;
  requestPermissions(): Promise<HealthConnectStatus>;
  openSettings(): Promise<void>;
  exportWorkoutSession(input: HealthConnectWorkoutExport): Promise<{
    success: boolean;
    recordIds?: string[];
    message?: string;
  }>;
};
```

## Execucoes

### E1 - Contrato, mapeamento e no-op PWA

Objetivo:

- Criar o contrato TypeScript da integracao.
- Criar adaptador PWA que deixa claro que Health Connect nao esta disponivel fora do APK Android.
- Criar funcao pura que transforma uma sessao finalizada do `meu-treino` em `HealthConnectWorkoutExport`.

Arquivos provaveis:

- `src/platform/health-connect/healthConnectAdapter.ts`
- `src/platform/health-connect/webHealthConnectAdapter.ts`
- `src/platform/health-connect/index.ts`
- `src/services/healthConnectExportService.ts`
- `src/services/healthConnectExportService.test.ts`

Cuidados:

- Nao adicionar dependencia JS se nao for necessario.
- Nao chamar Health Connect antes de a sessao local estar salva.
- Usar `sessionId` local no `clientRecordId`.
- Usar timestamps ISO validos.
- Se nao houver timestamps confiaveis por exercicio/set, gerar `segments: []` e colocar resumo em `notes`.

Pronto quando:

- Testes unitarios cobrem exportacao de uma sessao com um ou mais exercicios.
- Testes cobrem fallback sem segmentos.
- PWA retorna `unsupported-platform` sem quebrar a UI.

Checks:

- `pnpm test src/services/healthConnectExportService.test.ts`
- `pnpm lint`

### E2 - Estado local de preferencia e exportacao

Objetivo:

- Guardar localmente se o usuario quer exportacao automatica ao Health Connect.
- Guardar estado minimo de exportacao por sessao quando isso for util para suporte e retry.

Arquivos provaveis:

- `src/storage/workoutPlanRepository.ts`
- `src/storage/pwa/workoutDatabase.ts`
- `src/storage/pwa/dexieWorkoutPlanRepository.ts`
- testes do repositorio Dexie

Decisao a tomar no inicio da execucao:

- Opcao simples: salvar somente preferencia `healthConnectAutoExportEnabled` em `app_settings`.
- Opcao robusta: adicionar tabela `external_exports` com `sessionId`, `provider`, `status`, `exportedAt`, `recordIdsJson`, `lastError`.

Recomendacao:

- Comecar pela opcao simples se nao houver botao de retry no historico.
- Se for exibir "exportado/pendente/falhou" no historico, usar tabela `external_exports`.

Pronto quando:

- Preferencia sobrevive a reload do app.
- Migracao do banco local e coberta por teste.
- Nenhuma logica de treino depende de Health Connect para concluir.

Checks:

- `pnpm test src/storage/pwa/dexieWorkoutPlanRepository.test.ts`
- `pnpm build`

### E3 - Plugin nativo Android Health Connect

Objetivo:

- Implementar plugin Capacitor nativo para verificar disponibilidade, pedir permissao e gravar `ExerciseSessionRecord`.

Arquivos provaveis:

- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/meutreino/app/MainActivity.java`
- `android/app/src/main/java/com/meutreino/app/healthconnect/HealthConnectPlugin.kt`
- possivel activity nativa para rationale/permissoes

Tarefas:

1. Confirmar versao atual de `androidx.health.connect:connect-client` nos docs oficiais.
2. Adicionar dependencia no Gradle.
3. Declarar permissao `WRITE_EXERCISE`.
4. Declarar `<queries>` para Health Connect.
5. Declarar activity/alias de rationale exigida pelo Android/Health Connect.
6. Implementar `getStatus`.
7. Implementar `requestPermissions`.
8. Implementar `openSettings`.
9. Implementar `exportWorkoutSession`.
10. Usar `insertRecords` com `clientRecordId` e `clientRecordVersion` para comportamento idempotente/upsert.
11. Retornar `recordIds` quando o SDK fornecer resposta.

Cuidados:

- Usar Kotlin somente se o projeto Android estiver configurado para Kotlin; se nao estiver, avaliar Java para evitar configurar plugin Kotlin. Se Kotlin for necessario, registrar a mudanca.
- Tratar Health Connect indisponivel em Android antigo.
- Tratar permissao revogada antes da exportacao.
- Nao pedir permissoes de leitura no MVP.
- Nao escrever calorias ou frequencia cardiaca.
- Nao escrever dados importados de outro app de volta ao Health Connect.

Pronto quando:

- APK compila.
- `getStatus` retorna estados distintos para disponivel, indisponivel e permissao ausente.
- `requestPermissions` abre o fluxo do Health Connect.
- `exportWorkoutSession` grava uma sessao de musculacao em um aparelho Android real.

Checks:

- `pnpm android:sync`
- `cd android && .\gradlew.bat :app:assembleDebug`
- teste manual em Galaxy S24 Plus

Registro de execucao em 2026-06-22:

- Versao AndroidX confirmada nos docs oficiais em 2026-06-22: `androidx.health.connect:connect-client:1.1.0` e a versao estavel atual; existe `1.2.0-alpha04`, mas o corte E3 usa a versao estavel para reduzir risco no APK.
- Kotlin foi adicionado ao modulo Android porque o SDK Health Connect expoe operacoes suspensas e contracts de permissao pensados para Kotlin/coroutines; isso evita uma ponte Java manual mais fragil.
- Implementado plugin Capacitor nativo `HealthConnect` com `getStatus`, `requestPermissions`, `openSettings` e `exportWorkoutSession`.
- Declarada apenas a permissao `android.permission.health.WRITE_EXERCISE`, alem de `<queries>` para `com.google.android.apps.healthdata` e activity/alias de rationale exigidos pelo Health Connect.
- `pnpm android:sync` passou usando o runtime Node gerenciado pelo Codex.
- `pnpm lint` passou.
- `cd android && .\gradlew.bat :app:assembleDebug` nao iniciou nesta maquina porque `JAVA_HOME` nao esta configurado e nao ha `java.exe` no PATH; validar assim que um JDK/JBR estiver disponivel.

### E4 - UI de Configuracoes

Objetivo:

- Adicionar uma secao "Health Connect" em Configuracoes.

Arquivos provaveis:

- `src/features/settings/SettingsScreen.tsx`
- possivel componente `HealthConnectSettingsCard.tsx`
- `src/app/App.tsx`

Comportamento:

- No PWA: mostrar "Disponivel apenas no app Android" ou esconder a secao.
- No APK Android sem Health Connect disponivel: mostrar orientacao para abrir/instalar/atualizar Health Connect.
- No APK Android com permissao ausente: mostrar botao "Conectar ao Health Connect".
- Com permissao concedida: mostrar "Conectado" e acao "Gerenciar permissoes".
- Explicar em texto curto: "Ao finalizar um treino, o app envia a sessao para o Health Connect. Frequencia cardiaca e calorias do relogio ficam para uma etapa futura."

Pronto quando:

- Usuario entende que e opt-in.
- Usuario consegue conceder permissao.
- Usuario consegue abrir configuracoes/permissoes do Health Connect.
- PWA nao fica com botao quebrado.

Checks:

- `pnpm lint`
- `pnpm build`
- verificacao visual mobile da tela Configuracoes

### E5 - Exportacao ao finalizar treino

Objetivo:

- Chamar Health Connect depois que `finishWorkoutSession` salvar o treino local.

Arquivos provaveis:

- `src/features/workouts/ActiveWorkoutScreen.tsx`
- `src/features/workouts/WorkoutFinishedScreen.tsx`
- `src/services/workoutSessionService.ts`
- `src/app/App.tsx`
- `src/services/healthConnectExportService.ts`

Fluxo:

1. Usuario toca em finalizar treino.
2. App chama servico local de finalizacao.
3. Repositorio salva `workout_sessions`, `exercise_logs`, `set_logs`, historico e progresso.
4. App recebe `sessionId`.
5. App monta `HealthConnectWorkoutExport`.
6. Se autoexport ativo e status `ready`, app chama `exportWorkoutSession`.
7. Sucesso: mostrar feedback curto.
8. Falha: mostrar feedback nao bloqueante e manter treino local salvo.

Cuidados:

- Exportacao nao deve atrasar perceptivelmente a tela de finalizacao.
- Erro de Health Connect nao deve reverter sessao local.
- Se usuario finalizar duas vezes por falha/retry, `clientRecordId` deve evitar duplicacao.
- Se ainda nao houver permissao, orientar a conectar nas Configuracoes.

Pronto quando:

- Treino local finaliza mesmo sem Health Connect.
- Com Health Connect conectado, treino aparece no Health Connect.
- Sem permissao, app finaliza localmente e mostra mensagem adequada.
- Reenviar a mesma sessao nao cria duplicata visivel.

Checks:

- testes de servico para payload/exportacao
- `pnpm build`
- `pnpm lint`
- teste manual no Galaxy S24 Plus

Registro de execucao em 2026-06-22:

- `finishWorkoutSession` continua salvando a sessao local primeiro e agora retorna o input validado da sessao concluida para permitir exportacao posterior.
- Criado orquestrador `autoExportCompletedWorkoutToHealthConnect`, que verifica preferencia local, checa status do Health Connect e chama `exportWorkoutSession` somente quando o status e `ready`.
- A tela `UX-06` mostra feedback discreto de Health Connect: verificando, exportado, desativado, sem permissao/nao conectado, indisponivel ou falha nao bloqueante.
- A exportacao e disparada depois que a tela de finalizacao ja recebeu o resumo do treino, evitando bloquear o feedback principal.
- Testes direcionados de servico passaram: `pnpm test src/services/healthConnectExportService.test.ts src/services/workoutSessionService.test.ts`.
- `pnpm lint` e `pnpm build` passaram; o build manteve apenas o aviso existente de chunk acima de 500 kB.
- Validacao manual em aparelho Android/Health Connect real ainda fica para E6.

### E6 - Validacao manual no Samsung/Android

Objetivo:

- Confirmar o comportamento real em aparelho fisico.

Registro de execucao: `.agents/execucao-6-validacao-manual-samsung-android.md`.

Roteiro:

1. Instalar APK debug/release no Galaxy S24 Plus.
2. Abrir `meu-treino`.
3. Configuracoes > conectar Health Connect.
4. Conceder `WRITE_EXERCISE`.
5. Executar um treino curto de teste.
6. Finalizar no `meu-treino`.
7. Abrir Health Connect nas Configuracoes do Android.
8. Conferir se a sessao aparece em dados de exercicio.
9. Abrir Samsung Health > Configuracoes > Health Connect.
10. Permitir sincronizacao relevante entre Samsung Health e Health Connect.
11. Sincronizar Samsung Health e verificar se a sessao aparece ou se a limitacao fica documentada.

Pronto quando:

- Existe evidencia do treino no Health Connect.
- O comportamento do Samsung Health fica anotado: aparece, demora, ou nao aparece para esse tipo de dado.
- Qualquer diferenca entre Health Connect e Samsung Health fica documentada para o usuario.

Registro de execucao em 2026-06-22:

- Roteiro manual e campos de evidencia criados em `.agents/execucao-6-validacao-manual-samsung-android.md`.
- `pnpm android:apk` foi tentado pelo runtime Node gerenciado pelo Codex, mas falhou porque o JDK local esperado em `.codex-android-tools/jdk21` nao existe.
- Nao foram detectados `java.exe`, Android SDK local nem Android Studio nesta maquina.
- Validacao em Galaxy/Health Connect/Samsung Health continua pendente ate haver APK gerado e aparelho fisico disponivel.

### E7 - Preparacao para distribuicao futura

Objetivo:

- Deixar claro o que muda se o app for publicado na Google Play.

Tarefas:

- Criar/atualizar politica de privacidade local-first explicando Health Connect.
- Declarar Health Apps/Data Safety na Play Console quando publicar.
- Solicitar apenas `WRITE_EXERCISE`.
- Documentar que dados sao locais e que a escrita no Health Connect depende de consentimento do usuario.
- Garantir que package name e assinatura usados no APK final estejam estaveis.

Pronto quando:

- O repo tem checklist de publicacao para Health Connect.
- O texto de privacidade do app corresponde ao que aparece no fluxo de permissao.

Registro de execucao em 2026-06-22:

- Criada politica local-first em `docs/arquitetura/privacidade.md`, cobrindo PWA, Android, Health Connect, consentimento, retencao e escopo fora do MVP.
- Criado checklist de publicacao futura em `docs/arquitetura/publicacao-google-play.md`, incluindo Play Console, Data Safety, Health Apps, permissoes, package name e assinatura.
- Confirmado que `capacitor.config.ts`, `android/app/build.gradle` e `android/app/src/main/res/values/strings.xml` usam o package/applicationId `com.meutreino.app`.
- Confirmado que o manifesto Android solicita apenas `android.permission.health.WRITE_EXERCISE` para Health Connect.
- O texto da activity nativa de justificativa de permissoes permanece coerente com a politica: escrita de exercicio com consentimento, dados locais e sem frequencia cardiaca/calorias/leitura do relogio nesta etapa.

## Criterios de aceite da integracao

- No PWA, o app continua funcionando offline e sem Health Connect.
- No APK Android, o usuario consegue conectar o Health Connect pelas Configuracoes.
- O app pede somente permissao necessaria para escrever exercicio.
- Ao finalizar treino, a sessao local e salva primeiro.
- A exportacao para Health Connect acontece somente depois do salvamento local.
- Se Health Connect falhar, o treino local permanece salvo.
- A sessao exportada usa `clientRecordId` estavel baseado no `sessionId`.
- A mesma sessao pode ser reenviada sem criar duplicidade.
- O usuario ve feedback claro de conectado, exportado ou nao exportado.
- Frequencia cardiaca e calorias do relogio nao aparecem como promessa no MVP.

## Riscos e mitigacoes

| Risco | Mitigacao |
| --- | --- |
| Health Connect indisponivel ou desatualizado | Detectar status e orientar usuario a atualizar/abrir configuracoes |
| Permissao revogada | Checar permissao antes de cada exportacao |
| Duplicidade de sessoes | Usar `clientRecordId` e `clientRecordVersion` |
| Samsung Health nao exibir imediatamente | Documentar que a sincronizacao e controlada pelo Samsung Health |
| Segmentos com timestamps imprecisos | Comecar com sessao sem segmentos ou registrar timestamps por exercicio antes de exportar segmentos |
| Politica Google Play | Pedir permissao minima e preparar declaracao Health Apps/Data Safety |

## Futuro: frequencia cardiaca e calorias do relogio

Quando esta fase estiver validada, abrir um plano separado para uma das abordagens:

1. Integracao indireta: ler do Health Connect a sessao/dados escritos pelo Samsung Health e correlacionar por horario.
2. Integracao Wear OS: criar app/companion no relogio usando Health Services para capturar dados durante o treino.

A primeira tende a ser mais simples para historico; a segunda e melhor para dados ao vivo durante o treino.
