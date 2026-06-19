# Prompt para gerar treino compativel com o Meu Treino

Use este prompt para pedir a uma IA que gere um plano de treino em JSON compativel com o aplicativo **Meu Treino**.

## Objetivo

Gere um plano de treino de academia em JSON valido, usando exatamente a estrutura descrita abaixo.

O resultado deve ser usado em um aplicativo local de treino. Portanto:

- Retorne apenas JSON valido.
- Nao inclua comentarios.
- Nao inclua texto antes ou depois do JSON.
- Use a raiz obrigatoria `workout_plan`.
- Preencha todos os campos obrigatorios.
- Use IDs estaveis em `plan_id`, `routine_id` e `exercise_id`.
- Use nomes claros e consistentes para exercicios, grupos musculares e equipamentos.

## Dados do aluno

Preencha ou adapte as informacoes abaixo antes de gerar o treino:

- Objetivo principal: hipertrofia
- Nivel: intermediario
- Dias de treino por semana: 4
- Duracao estimada do plano: 8 semanas
- Local de treino: academia
- Equipamentos disponiveis: barra, halteres, maquinas e polias
- Restricoes, lesoes ou exercicios a evitar: nenhuma
- Preferencias: progressao de carga, treinos objetivos e faceis de registrar

## Regras do JSON

### Raiz

O JSON deve ter a seguinte raiz:

```json
{
  "workout_plan": {}
}
```

### Campos obrigatorios do plano

Dentro de `workout_plan`, inclua:

- `name`: nome do plano.
- `objective`: objetivo do plano.
- `level`: nivel do aluno.
- `estimated_duration_weeks`: duracao estimada em semanas, como numero inteiro positivo.
- `days_per_week`: dias de treino por semana, como numero inteiro positivo.
- `routines`: lista de rotinas de treino.

Campo opcional recomendado:

- `plan_id`: identificador estavel do plano.

### Campos obrigatorios de cada rotina

Cada item em `routines` deve conter:

- `routine_id`: identificador estavel da rotina.
- `name`: nome da rotina.
- `order`: ordem da rotina no ciclo, como numero inteiro positivo.
- `exercises`: lista com pelo menos um exercicio.

Campos opcionais:

- `warmup`: lista de passos de aquecimento.
- `cooldown`: lista de passos de desaceleracao ou alongamento.

### Campos de aquecimento e cooldown

Cada item em `warmup` ou `cooldown` pode conter:

- `type`: `warmup` ou `cooldown`.
- `activity`: atividade proposta.
- `duration_minutes`: duracao em minutos, como numero inteiro positivo.
- `notes`: observacoes opcionais.

### Campos obrigatorios de cada exercicio

Cada item em `exercises` deve conter:

- `name`: nome do exercicio.
- `muscle_group`: grupo muscular principal.
- `equipment`: equipamento usado.
- `is_unilateral`: `true` ou `false`.
- `sets`: numero de series, como numero inteiro positivo.
- `target_reps`: alvo de repeticoes, como texto.

Campos opcionais recomendados:

- `exercise_id`: identificador estavel do exercicio.
- `target_rir`: RIR alvo, como numero inteiro maior ou igual a zero.
- `rest_seconds`: descanso em segundos, como numero inteiro positivo.
- `tempo`: cadencia do exercicio.
- `advanced_technique`: tecnica avancada, se houver.
- `notes`: observacoes uteis para execucao.
- `media_url`: URL de midia demonstrativa, se houver.

## Exemplo de formato esperado

```json
{
  "workout_plan": {
    "plan_id": "modelo-hipertrofia-4-dias",
    "name": "Hipertrofia 4 dias",
    "objective": "Ganho de massa muscular com progressao de cargas",
    "level": "intermediario",
    "estimated_duration_weeks": 8,
    "days_per_week": 4,
    "routines": [
      {
        "routine_id": "treino-a",
        "name": "Treino A - Peito e triceps",
        "order": 1,
        "warmup": [
          {
            "type": "warmup",
            "activity": "Esteira leve",
            "duration_minutes": 8,
            "notes": "Ritmo confortavel"
          }
        ],
        "exercises": [
          {
            "exercise_id": "supino-reto-barra",
            "name": "Supino reto",
            "muscle_group": "Peitoral",
            "equipment": "Barra",
            "is_unilateral": false,
            "sets": 4,
            "target_reps": "8-10",
            "target_rir": 2,
            "rest_seconds": 90,
            "tempo": "2-0-1",
            "notes": "Controlar a descida"
          }
        ],
        "cooldown": [
          {
            "type": "cooldown",
            "activity": "Alongamento peitoral",
            "duration_minutes": 3
          }
        ]
      }
    ]
  }
}
```

## Pedido final

Com base nos dados do aluno e nas regras acima, gere um plano de treino completo em JSON valido para importacao no aplicativo **Meu Treino**.
