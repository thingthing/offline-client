const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://modules/logfile.jsm");

var EXPORTED_SYMBOLS = ["logDebug", "logError", "logConsole", "log"];

const debugOutput = true;
const debugMaxDepth = 2;

var dinit = new Date().getTime();
var dlast = dinit;

var log = function log(config) {
    logFile.write(config);
};

var logError = function logError(aMessage) {
    logFile.write({
        message: aMessage,
        priority: log.ERR
    });
    return Cu.reportError(aMessage);
};

var logDebug = function logDebug(msg) {
    logFile.write({
        message: msg,
        priority: logFile.DEBUG
    });
};

var logConsole = function logConsole() {
    var i, dloc = new Date().getTime(),
        prefix = (dloc - dinit) / 1000 + 's[' + (dloc - dlast) / 1000 + ']:',
        msg = '';
    for (i = 0; i < arguments.length; i++) {
        msg += _log(arguments[i], prefix);
        if (i < arguments - 1) {
            msg += " ,";
        } else {
            msg += " ";
        }
    }
    dumpInConsole(prefix + msg);
};

var dumpInConsole = function(text) {
    var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
    if (consoleService) {
        consoleService.logStringMessage("[DEBUG] " + text + "\n");
    }
};

var _log = function() {

    var ddumpObject = function(obj, objectName, maxDepth, curDepth) {
        var msg = '',
            i = 0,
            indent = "\n",
            j, prop;
        curDepth = curDepth || 0;
        if (maxDepth !== undefined && curDepth > maxDepth) {
            return '';
        }
        for (j = 0; j <= curDepth; j++) {
            indent += "\t";
        }
        for (prop in obj) {
            i++;
            try {
                if (typeof(obj[prop]) == "object") {
                    if (Array.isArray(obj[prop])) {
                        msg += indent + prop + "=[array, length " + obj[prop].length + "]";
                    } else {
                        msg += indent + prop + "=[" + typeof(obj[prop]) + "]";
                    }
                    msg += indent + ddumpObject(obj[prop], prop, maxDepth, curDepth + 1);
                } else if (typeof(obj[prop]) == "function") {
                    msg += indent + prop + "=[function]";
                } else {
                    msg += indent + prop + "=" + obj[prop];
                }
            } catch (e) {
                msg += indent + prop + " unable to log !";
            }
        }
        if (!i) {
            msg = "<empty>";
        }
        return msg;
    };

    return function(obj) {
        switch (typeof obj) {
            case 'function':
            case 'object':
                return ddumpObject(obj, typeof obj, 2);
            default:
                return obj;
        }
    };
}();