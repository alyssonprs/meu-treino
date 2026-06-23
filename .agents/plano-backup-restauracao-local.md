# Plano - Backup e restauracao local

## Objetivo

Implementar em `UX-13 Configuracoes` um modulo de backup e restauracao para troca de dispositivo ou reinstalacao do app.

## Restricoes

- Manter dados 100% locais e offline-first.
- Nao adicionar backend, login, cloud sync ou novas dependencias.
- Exportar e restaurar o treino vigente e todo o historico de treino.
- Restauracao deve substituir os dados locais atuais pelo backup validado.

## Done when

- Ajustes permite baixar um arquivo JSON de backup local.
- Ajustes permite escolher um arquivo de backup e restaurar os dados.
- O backup inclui planos, rotinas, exercicios, progresso, sessoes, logs, historico de cargas e settings.
- Teste cobre round-trip de exportacao/restauracao preservando plano ativo, sessoes e cargas.
- `pnpm test` e `pnpm build` passam, quando o ambiente permitir.
