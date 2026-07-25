# Identidade visual

O app `meu-treino` usa somente dois temas selecionaveis: claro e escuro. O tema escuro e o padrao na primeira abertura. Os tokens implementados em `src/theme/tokens.css` sao a fonte de verdade das cores.

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

A decisao visual vigente e seguir Material Design 3 como sistema de interface,
implementado com componentes React proprios, Tailwind e tokens em `src/theme`.
As paletas abaixo continuam como referencia de identidade e podem servir como
seed para gerar os roles claro/escuro do Material 3, mas nao devem impedir a
migracao para componentes, shapes, tipografia, navegacao e estados do Material 3.

Plano operacional: `.agents/plano-material-3-react-tailwind.md`.

### Tema claro

Base Material 3 em tema claro para ambientes iluminados e leitura clara.

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

Base Material 3 em tema escuro, com superficies grafite, acao principal em
verde-lima e informacoes secundarias em ciano.

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

- O app deve ter uma configuracao de tema com as opcoes `Claro` e `Escuro`.
- Salvar a preferencia localmente no dispositivo.
- Aplicar o tema sem exigir reinicio do app.
- O tema escolhido deve afetar todas as telas principais.
- Componentes devem usar tokens de design, nao cores fixas espalhadas pela UI.
