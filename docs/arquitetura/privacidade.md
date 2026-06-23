# Politica de privacidade - Meu Treino

Ultima atualizacao: 2026-06-22

Este texto e a referencia de privacidade do app `Meu Treino` para PWA e para uma publicacao Android futura. Antes de publicar na Google Play, o mesmo conteudo deve estar disponivel em uma URL publica informada na Play Console.

## Resumo

O `Meu Treino` e um app local-first para importar, executar e acompanhar treinos de academia. O app nao exige login, nao usa backend remoto e nao sincroniza os dados do usuario com servidores do projeto.

Os dados principais ficam armazenados no proprio dispositivo do usuario:

- plano de treino importado por JSON;
- rotinas, exercicios, cargas e repeticoes registradas;
- historico local de treinos e progresso;
- preferencias locais, como tema e envio automatico ao Health Connect.

## PWA

Na versao PWA, os dados ficam salvos localmente no navegador, usando armazenamento local do dispositivo. O app deve continuar funcionando offline depois de instalado, respeitando as limitacoes do navegador e do sistema operacional.

A versao PWA nao acessa Health Connect.

## Android e Health Connect

No APK Android, o app pode oferecer uma integracao opcional com Health Connect. Essa integracao serve apenas para enviar sessoes de treino finalizadas no `Meu Treino` ao Health Connect, quando o usuario conceder permissao.

Permissao solicitada nesta fase:

- `android.permission.health.WRITE_EXERCISE`

O app nao solicita permissoes de leitura do Health Connect nesta fase. O app tambem nao le frequencia cardiaca, calorias, passos, distancia, dados do relogio, dados de outros apps ou historico existente no Health Connect.

Quando a integracao estiver ativada, o app envia ao Health Connect somente dados da sessao salva no proprio `Meu Treino`, como:

- titulo ou nome da rotina;
- horario de inicio e fim;
- tipo de exercicio de musculacao;
- identificador local da sessao para evitar duplicidade;
- resumo tecnico local quando necessario.

O treino local e salvo primeiro. Se o Health Connect estiver indisponivel, sem permissao ou falhar, o treino continua salvo no banco local do app.

## Consentimento e controle

A escrita no Health Connect depende de consentimento do usuario no Android. O usuario pode conceder, negar ou revogar a permissao nas configuracoes do Health Connect/Android.

No app, a secao de Configuracoes informa o estado da conexao e permite abrir o gerenciamento de permissoes quando a plataforma suporta isso.

## Compartilhamento de dados

O projeto `Meu Treino` nao recebe, vende, compartilha ou monetiza dados pessoais ou dados de saude do usuario.

Quando o usuario permite a escrita no Health Connect, os dados passam a ser gerenciados tambem pelo Health Connect no dispositivo e podem ser disponibilizados a outros apps autorizados pelo proprio usuario, conforme as configuracoes do Android/Health Connect.

## Retencao e exclusao

Os dados locais permanecem no dispositivo ate que o usuario apague os dados pelo app, limpe os dados do navegador/app, desinstale o app ou remova o armazenamento local pelo sistema operacional.

Excluir dados locais do `Meu Treino` nao garante exclusao automatica de dados ja escritos no Health Connect. O usuario deve gerenciar ou excluir esses dados nas configuracoes do Health Connect quando necessario.

## Fora do escopo atual

Nesta fase, o app nao implementa:

- login ou conta;
- sincronizacao em nuvem;
- backend remoto;
- pagamentos;
- leitura de dados de saude;
- captura de sensores, camera, frequencia cardiaca ou calorias;
- app Wear OS.

