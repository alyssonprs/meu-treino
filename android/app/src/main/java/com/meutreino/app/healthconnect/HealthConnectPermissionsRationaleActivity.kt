package com.meutreino.app.healthconnect

import android.app.Activity
import android.os.Bundle
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView

class HealthConnectPermissionsRationaleActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val density = resources.displayMetrics.density
        val padding = (24 * density).toInt()

        val container =
            LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(padding, padding, padding, padding)
            }

        val title =
            TextView(this).apply {
                text = "Health Connect"
                textSize = 24f
                setTextColor(0xFF111827.toInt())
            }

        val body =
            TextView(this).apply {
                text =
                    "O Meu Treino usa permissao de escrita de exercicio apenas para enviar, com seu consentimento, sessoes de treino finalizadas no app. Seus dados continuam locais no dispositivo. Frequencia cardiaca, calorias e leituras do relogio nao sao usadas nesta etapa."
                textSize = 16f
                setTextColor(0xFF374151.toInt())
                setPadding(0, (12 * density).toInt(), 0, 0)
            }

        container.addView(title)
        container.addView(body)
        setContentView(container)
    }
}
