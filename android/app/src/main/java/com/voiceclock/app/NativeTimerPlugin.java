package com.voiceclock.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Timer;
import java.util.TimerTask;

@CapacitorPlugin(name = "NativeTimer")
public class NativeTimerPlugin extends Plugin {
    private Timer timer;

    @PluginMethod
    public void start(PluginCall call) {
        if (timer != null) {
            timer.cancel();
        }
        int ms = call.getInt("ms", 100);
        timer = new Timer();
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                JSObject ret = new JSObject();
                ret.put("timestamp", System.currentTimeMillis());
                notifyListeners("onTick", ret);
            }
        }, 0, ms);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (timer != null) {
            timer.cancel();
            timer = null;
        }
        call.resolve();
    }
}
