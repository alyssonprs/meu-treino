package com.meutreino.app.healthconnect

import android.content.ActivityNotFoundException
import android.content.Intent
import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.time.Instant
import java.time.ZoneId
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@CapacitorPlugin(name = "HealthConnect")
class HealthConnectPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val permissions =
        setOf(HealthPermission.getWritePermission(ExerciseSessionRecord::class))

    private var permissionLauncher: ActivityResultLauncher<Set<String>>? = null
    private var pendingPermissionCall: PluginCall? = null

    override fun load() {
        permissionLauncher =
            activity.registerForActivityResult(
                PermissionController.createRequestPermissionResultContract()
            ) { grantedPermissions ->
                val call = pendingPermissionCall
                pendingPermissionCall = null
                if (call == null) return@registerForActivityResult

                scope.launch {
                    val status =
                        if (grantedPermissions.containsAll(permissions)) "ready" else getCurrentStatus()
                    resolveStatus(call, status)
                }
            }
    }

    @PluginMethod
    fun getStatus(call: PluginCall) {
        scope.launch {
            resolveStatus(call, getCurrentStatus())
        }
    }

    @PluginMethod
    fun requestPermissions(call: PluginCall) {
        scope.launch {
            val status = getCurrentStatus()
            if (status == "ready" || status == "unavailable" || status == "requires-install") {
                resolveStatus(call, status)
                return@launch
            }

            withContext(Dispatchers.Main) {
                pendingPermissionCall?.reject("Outra solicitacao de permissao ja esta em andamento.")
            }
            pendingPermissionCall = call
            withContext(Dispatchers.Main) {
                permissionLauncher?.launch(permissions)
                    ?: run {
                        pendingPermissionCall = null
                        call.reject("Fluxo de permissao do Health Connect indisponivel.")
                    }
            }
        }
    }

    @PluginMethod
    fun openSettings(call: PluginCall) {
        try {
            val intent = Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS)
            activity.startActivity(intent)
            call.resolve()
        } catch (error: ActivityNotFoundException) {
            call.reject("Configuracoes do Health Connect nao encontradas.", error)
        }
    }

    @PluginMethod
    fun exportWorkoutSession(call: PluginCall) {
        scope.launch {
            try {
                val status = getCurrentStatus()
                if (status != "ready") {
                    resolveExport(
                        call,
                        JSObject()
                            .put("success", false)
                            .put("message", "Health Connect nao esta pronto: $status.")
                    )
                    return@launch
                }

                val startTime = requireInstant(call, "startedAt")
                val endTime = requireInstant(call, "completedAt")
                if (!endTime.isAfter(startTime)) {
                    throw IllegalArgumentException("completedAt deve ser posterior a startedAt.")
                }

                val zoneId = ZoneId.systemDefault()
                val record =
                    ExerciseSessionRecord(
                        startTime = startTime,
                        startZoneOffset = zoneId.rules.getOffset(startTime),
                        endTime = endTime,
                        endZoneOffset = zoneId.rules.getOffset(endTime),
                        metadata =
                            Metadata.activelyRecorded(
                                clientRecordId = call.getString("clientRecordId") ?: "",
                                clientRecordVersion = call.data.optLong("clientRecordVersion", 0L),
                                device = Device(type = Device.TYPE_PHONE)
                            ),
                        exerciseType = ExerciseSessionRecord.EXERCISE_TYPE_WEIGHTLIFTING,
                        title = call.getString("title"),
                        notes = call.getString("notes"),
                    )

                val response = client().insertRecords(listOf(record))
                val recordIds = JSArray(response.recordIdsList)
                resolveExport(
                    call,
                    JSObject()
                        .put("success", true)
                        .put("recordIds", recordIds)
                        .put("message", "Treino enviado ao Health Connect.")
                )
            } catch (error: Exception) {
                resolveExport(
                    call,
                    JSObject()
                        .put("success", false)
                        .put("message", error.message ?: "Falha ao exportar para Health Connect.")
                )
            }
        }
    }

    private suspend fun getCurrentStatus(): String {
        return when (HealthConnectClient.getSdkStatus(context)) {
            HealthConnectClient.SDK_AVAILABLE -> {
                val grantedPermissions = client().permissionController.getGrantedPermissions()
                if (grantedPermissions.containsAll(permissions)) "ready" else "permission-missing"
            }
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> "requires-install"
            else -> "unavailable"
        }
    }

    private fun client(): HealthConnectClient = HealthConnectClient.getOrCreate(context)

    private fun requireInstant(call: PluginCall, key: String): Instant {
        val value = call.getString(key) ?: throw IllegalArgumentException("$key e obrigatorio.")
        return Instant.parse(value)
    }

    private suspend fun resolveStatus(call: PluginCall, status: String) {
        withContext(Dispatchers.Main) {
            call.resolve(JSObject().put("status", status))
        }
    }

    private suspend fun resolveExport(call: PluginCall, result: JSObject) {
        withContext(Dispatchers.Main) {
            call.resolve(result)
        }
    }
}
