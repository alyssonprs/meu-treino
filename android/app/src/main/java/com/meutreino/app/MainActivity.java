package com.meutreino.app;

import com.getcapacitor.BridgeActivity;
import com.meutreino.app.healthconnect.HealthConnectPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(HealthConnectPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
