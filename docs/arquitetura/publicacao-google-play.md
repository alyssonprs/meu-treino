# Publicacao futura na Google Play

Este checklist prepara o `Meu Treino` para uma distribuicao Android futura sem mudar o escopo atual: PWA primeiro, dados 100% locais e Health Connect opcional apenas no APK Android.

## Identidade do app

- Nome publico: `Meu Treino`
- Package name / applicationId estavel: `com.meutreino.app`
- Capacitor appId: `com.meutreino.app`
- Namespace Android: `com.meutreino.app`
- App signing: criar e guardar a chave de release fora do repositorio quando a publicacao for aprovada.
- Arte oficial: usar somente os assets aprovados em `assets/identity`.

Nao trocar o package name depois de publicar. Na Google Play, o package name identifica o app de forma permanente.

## Permissoes Android

Permissoes esperadas para o MVP Android:

- `android.permission.INTERNET`, necessaria ao shell web/Capacitor e ao carregamento normal do PWA empacotado;
- `android.permission.health.WRITE_EXERCISE`, usada apenas para escrever sessoes finalizadas no Health Connect.

Nao solicitar nesta fase:

- permissoes de leitura do Health Connect;
- frequencia cardiaca;
- calorias;
- rota de exercicio;
- sensores corporais;
- localizacao;
- camera;
- contatos;
- login ou contas.

Antes de enviar um AAB, revisar `android/app/src/main/AndroidManifest.xml` e confirmar que nenhuma permissao extra foi introduzida por engano.

## Health Connect e Health Apps

Antes da publicacao com Health Connect ativo:

1. Validar em aparelho Android fisico que o app solicita apenas escrita de exercicio.
2. Confirmar que o fluxo nativo de permissao mostra uma justificativa coerente com `docs/arquitetura/privacidade.md`.
3. Confirmar que o treino local e salvo antes de qualquer exportacao.
4. Confirmar que erro de Health Connect nao bloqueia a conclusao do treino.
5. Preencher na Play Console as declaracoes de Health Apps exigidas para `WRITE_EXERCISE`.
6. Declarar que o app escreve sessoes de treino criadas pelo usuario no proprio app.
7. Declarar que o app nao le dados do Health Connect nesta fase.
8. Declarar que frequencia cardiaca, calorias e dados do relogio estao fora do MVP.

## Data Safety

Declaracao esperada enquanto o app permanecer local-first e sem backend:

- o projeto nao coleta dados em servidores proprios;
- o projeto nao compartilha dados com terceiros;
- dados de treino ficam no dispositivo;
- dados podem ser escritos no Health Connect somente com consentimento do usuario;
- dados escritos no Health Connect passam a seguir o controle de permissoes do Android/Health Connect;
- o usuario pode apagar dados locais pelo app ou pelo sistema operacional.

A declaracao final na Play Console deve ser revisada contra o binario real enviado, incluindo dependencias Android e permissoes efetivas.

## Politica de privacidade

Antes de publicar:

1. Publicar o conteudo de `docs/arquitetura/privacidade.md` em uma URL HTTPS estavel.
2. Informar essa URL na Play Console.
3. Conferir que o texto publico menciona Health Connect, `WRITE_EXERCISE`, dados locais e ausencia de leitura de dados de saude.
4. Atualizar a data da politica quando houver mudanca de escopo.

## Build de release

Checklist operacional:

1. Rodar `pnpm build`.
2. Rodar `pnpm android:sync`.
3. Abrir o projeto Android ou executar Gradle com JDK/Android SDK configurados.
4. Gerar AAB assinado para Play Console.
5. Guardar keystore, senha e credenciais de assinatura fora do Git.
6. Registrar `versionCode` e `versionName` enviados.
7. Testar instalacao e fluxo Health Connect em aparelho fisico antes de promover release.

## Bloqueios conhecidos

Em 2026-06-22, esta maquina ainda nao possui JDK/Android SDK local validado para gerar APK/AAB. A validacao nativa segue pendente ate configurar ambiente Android ou usar uma maquina com Android Studio.

