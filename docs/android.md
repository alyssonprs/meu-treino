# Android com Capacitor

Este projeto mantem a primeira entrega como PWA, mas ja possui alvo Android preparado com Capacitor.

## Configuracao atual

- App name: `Meu Treino`
- App ID / package: `com.meutreino.app`
- Web build usado pelo Capacitor: `dist`
- Plataforma nativa versionada: `android/`
- Assets de identidade usados a partir de `assets/identity`

## Comandos

Use `pnpm` como gerenciador do projeto.

```bash
pnpm run build
pnpm run android:sync
pnpm run android:open
```

`android:sync` executa o build web e depois `cap sync android`, copiando a PWA compilada para o projeto Android.

## Geracao de APK/AAB

Depois de `pnpm run android:open`, use o Android Studio para:

- rodar o app em emulador ou dispositivo fisico;
- gerar APK de instalacao direta;
- gerar AAB para publicacao futura na Google Play.

Nao ha configuracao iOS neste projeto nesta fase.
