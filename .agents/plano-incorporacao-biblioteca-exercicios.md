# Plano de incorporacao da biblioteca de exercicios

## Objetivo

Substituir os assets visuais imprecisos por imagens ou GIFs especificos de uma
biblioteca externa de exercicios, preservando a estrutura atual do app:

- painel recolhido por padrao;
- abertura por `Ver como fazer`;
- musculo principal, musculos auxiliares e ate 3 dicas curtas;
- funcionamento offline e 100% local;
- sem backend, login, cloud sync ou busca remota em tempo de uso.

## Estado atual apos rollback

- A UI do guia visual foi mantida.
- `movement_pattern` continua validado e usado para dicas padrao.
- `visual_id` continua aceito no JSON, mas nao ha IDs oficiais ativos.
- O app nao renderiza imagem baseada apenas em `movement_pattern`.
- Os assets genericos WebP e SVGs especificos locais foram removidos.
- `src/config/exercise-guide-catalog.json` ficou como catalogo de dicas e como
  ponto futuro para registrar assets especificos validados.

## Repositorio externo

Pendente: o usuario vai informar o repositorio GitHub da biblioteca de imagens e
GIFs.

Antes de copiar qualquer asset, verificar:

- licenca e permissao de uso em app distribuido como PWA/APK;
- formatos disponiveis, tamanho medio e quantidade de arquivos;
- se ha IDs ou nomes estaveis para exercicios;
- se ha GIFs pesados demais para uso offline;
- se existem variantes por equipamento, pegada, inclinacao, unilateralidade ou
  maquina.

## Estrategia tecnica recomendada

1. Criar um inventario local da biblioteca externa.
   - Gerar uma tabela com `external_id`, nome original, arquivo, formato,
     tamanho e tags quando existirem.
   - Separar imagem estatica de GIF animado.
   - Nao importar a biblioteca inteira sem filtro.

2. Definir um catalogo explicito de exercicios suportados.
   - Usar `visual_id` para cada exercicio especifico aprovado.
   - Mapear aliases de `exercise_id` para `visual_id` em
     `exercise_visual_aliases`.
   - Evitar aliases amplos como "remada" quando a imagem representa uma variante
     especifica.

3. Incorporar assets de forma incremental.
   - Comecar pelos exercicios que aparecem no JSON modelo e nos treinos reais
     usados pelo app.
   - Preferir WebP ou imagem otimizada quando uma foto/ilustracao estatica for
     suficiente.
   - Usar GIF apenas quando a animacao for decisiva para entender o movimento.
   - Medir tamanho total adicionado ao bundle.

4. Atualizar o resolver sem voltar ao fallback visual generico.
   - Ordem: `visual_id` conhecido, alias exato de `exercise_id`, fallback sem
     imagem com musculos/dicas.
   - `movement_pattern` pode fornecer dicas, mas nao pode escolher imagem.

5. Atualizar o prompt e o modelo JSON somente com IDs aprovados.
   - Listar `visual_id` oficiais ativos.
   - Instruir a IA a omitir `visual_id` quando nao houver correspondencia exata.
   - Manter `primary_muscles`, `secondary_muscles`, `movement_pattern` e
     `execution_cues` como fallback textual/anatomico.

6. Verificar duplicidade e coerencia.
   - Criar teste garantindo que cada alias aponta para um asset existente.
   - Criar teste ou script simples que liste assets usados por mais de um
     `visual_id`.
   - Permitir duplicidade apenas quando documentada como alias real da mesma
     execucao.

## Criterios de aceite

- Nenhum exercicio mostra imagem se nao houver correspondencia especifica
  validada.
- Exercicios diferentes nao compartilham imagem por fallback amplo.
- `movement_pattern` nunca seleciona imagem sozinho.
- O modelo JSON e o prompt nao anunciam `visual_id` inexistente.
- Os assets incorporados funcionam offline no PWA.
- `pnpm test -- exerciseGuides` e `pnpm build` passam.

## Proxima execucao sugerida

Quando o repositorio GitHub for informado:

1. Ler a licenca e a estrutura da biblioteca.
2. Criar inventario dos assets disponiveis.
3. Propor a primeira leva de exercicios a importar.
4. Implementar apenas essa primeira leva com testes e atualizacao do prompt.
