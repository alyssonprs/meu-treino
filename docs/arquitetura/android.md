# Android com Capacitor

Este projeto mantem a primeira entrega como PWA, mas ja possui alvo Android preparado com Capacitor.

## Configuracao atual

- App name: `Meu Treino`
- App ID / package: `com.meutreino.app`
- Namespace Android: `com.meutreino.app`
- Web build usado pelo Capacitor: `dist`
- Plataforma nativa versionada: `android/`
- Assets de identidade usados a partir de `assets/identity`
- Health Connect opcional no APK Android, com permissao minima `android.permission.health.WRITE_EXERCISE`

## Comandos

Use `pnpm` como gerenciador do projeto.

```bash
pnpm run build
pnpm run android:sync
pnpm run android:open
```

`android:sync` executa o build web e depois `cap sync android`, copiando a PWA compilada para o projeto Android.

Validacao local em 2026-06-15:

```text
pnpm run android:sync
```

Resultado: build Vite concluido e `cap sync android` executado com sucesso, copiando `dist` para `android/app/src/main/assets/public`.

## Geracao de APK/AAB

Depois de `pnpm run android:sync`, abra o projeto nativo:

```bash
pnpm run android:open
```

No Android Studio:

- rodar o app em emulador ou dispositivo fisico;
- gerar APK de instalacao direta em `Build > Build Bundle(s) / APK(s) > Build APK(s)`;
- gerar AAB para publicacao futura em `Build > Generate Signed Bundle / APK > Android App Bundle`;
- criar uma chave de assinatura somente quando a publicacao ou distribuicao exigir.

Para teste local rapido, use APK debug gerado pelo Android Studio. Para Google Play no futuro, use AAB assinado e mantenha a chave de assinatura fora do repositorio.

Antes de publicar na Google Play, seguir `docs/arquitetura/publicacao-google-play.md` e publicar a politica baseada em `docs/arquitetura/privacidade.md` em uma URL HTTPS estavel.

Nao ha configuracao iOS neste projeto nesta fase.
