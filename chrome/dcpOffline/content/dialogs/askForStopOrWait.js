const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://modules/logger.jsm");
Cu.import("resource://modules/events.jsm");

function stop() {
    applicationEvent.publish("preXHRForceClose");
    applicationEvent.publish("XHRForceClose");
}

function wait() {
    applicationEvent.publish("startMonitorXHR", {XHR : window.arguments[0].xhr});
    window.close();
}

function closeDialog() {
    window.close();
 }

window.addEventListener("close", function() {
    applicationEvent.unsubscribe("stopMonitorXHR", closeDialog);
    applicationEvent.publish("stopMonitorXHR", window.arguments[0].xhr);
}, false);

window.addEventListener("load", function() {
    applicationEvent.subscribe("stopMonitorXHR", closeDialog);
}, false);

