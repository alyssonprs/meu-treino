# Execucao 6 - validacao manual no Samsung/Android

Data: 2026-06-22

## Objetivo

Validar em aparelho Android fisico, preferencialmente Galaxy S24 Plus, se o APK do
`meu-treino` consegue pedir permissao de escrita de exercicios no Health Connect e
exportar uma sessao finalizada como treino de musculacao.

## Escopo

- Validar somente escrita de `ExerciseSessionRecord` no Health Connect.
- Confirmar se a sessao aparece no Samsung Health quando a sincronizacao via Health
  Connect estiver habilitada pelo usuario.
- Nao validar frequencia cardiaca, calorias, relogio Galaxy Watch, leitura de dados
  ou sincronizacao em nuvem.

## Pre-check local

Comando tentado:

```powershell
pnpm.cmd android:apk
```

Resultado:

- `pnpm.cmd` nao estava no `PATH` da sessao PowerShell.

Comando tentado com runtime Node gerenciado pelo Codex:

```powershell
$nodeBin = Get-ChildItem "$env:LOCALAPPDATA\OpenAI\Codex\runtimes\cua_node" -Directory |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 |
  ForEach-Object { Join-Path $_.FullName "bin" }
$env:PATH = "$nodeBin;$nodeBin\node_modules\corepack\shims;" + $env:PATH
& "$nodeBin\node_modules\corepack\shims\pnpm.cmd" android:apk
```

Resultado:

- O script falhou porque nao encontrou JDK local em
  `.codex-android-tools/jdk21`.
- Tambem nao foram detectados `java.exe`, Android SDK em
  `$env:LOCALAPPDATA\Android\Sdk` ou Android Studio em `C:\Program Files\Android`.

Status: APK nao gerado nesta maquina. Para executar o roteiro abaixo, instalar ou
apontar JDK 21+ e Android SDK/Android Studio, ou gerar o APK em outra maquina.

## Roteiro manual

1. Gerar o APK debug:

   ```powershell
   pnpm.cmd android:apk
   ```

   APK esperado apos sucesso:

   ```text
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

2. Instalar no Galaxy S24 Plus:

   ```powershell
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. Abrir `meu-treino`.
4. Importar ou manter um plano de treino valido.
5. Abrir `Configuracoes`.
6. Na secao Health Connect, tocar em `Conectar ao Health Connect`.
7. Conceder somente a permissao de escrita de exercicios.
8. Voltar ao app e confirmar que o estado aparece como conectado/pronto.
9. Executar um treino curto de teste.
10. Finalizar o treino.
11. Confirmar que o app mostra feedback discreto de envio ao Health Connect.
12. Abrir Configuracoes do Android > Health Connect.
13. Conferir se a sessao aparece nos dados de exercicio.
14. Abrir Samsung Health > Configuracoes > Health Connect.
15. Permitir a sincronizacao relevante entre Samsung Health e Health Connect.
16. Sincronizar Samsung Health.
17. Verificar se a sessao aparece no Samsung Health, se demora, ou se nao aparece
    para esse tipo de dado.

## Evidencias a coletar

- Modelo do aparelho e versao do Android.
- Versao do Health Connect.
- Versao do Samsung Health.
- Screenshot ou anotacao do estado de permissao no Health Connect.
- Screenshot ou anotacao da sessao gravada em Health Connect.
- Resultado no Samsung Health: `aparece`, `aparece apos atraso`, ou `nao aparece`.
- Horario aproximado de finalizacao do treino e horario em que cada app refletiu a
  sessao.

## Resultado

Status atual: pendente de execucao em aparelho fisico.

| Item | Resultado | Observacoes |
| --- | --- | --- |
| APK gerado | Bloqueado | JDK/Android SDK ausentes nesta maquina |
| APK instalado no Galaxy | Pendente |  |
| Permissao WRITE_EXERCISE concedida | Pendente |  |
| Treino salvo localmente | Pendente |  |
| Treino exportado para Health Connect | Pendente |  |
| Sessao visivel no Health Connect | Pendente |  |
| Sessao visivel no Samsung Health | Pendente |  |

