Components.utils.import("resource://modules/getText.jsm");
Components.utils.import("resource://modules/logger.jsm");

function initDialog() {

    var result = window.arguments[0];

    logConsole('endSync', result);

    if (result) {
        if (result.description) {
            if (result.description.status) {
                if (result.description.status == "successTransaction") {
                    document.getElementById("resultStatus").value = getText("synchronize.success");
                } else if (result.description.status == "abortTransaction") {
                    document.getElementById("resultStatus").value = getText("synchronize.fail");
                } else {
                    document.getElementById("resultStatus").value = result.description.status;
                }
            }

            if (result.description.manageWaitingUrl) {
                document.getElementById("onlineSpaceLink").href = result.description.manageWaitingUrl;
                document.getElementById("onlineSpaceLink").tooltipText = result.description.manageWaitingUrl;
            }

            if (result.description.message) {
                document.getElementById("message").hidden = false;
                try {
                    document.getElementById("message").value = result.description.toString();
                } catch (e) {
                    document.getElementById("message").value = result.description.message;
                }
            }
        } else {
            if (result.result) {
                document.getElementById("resultStatus").value = getText("synchronize.success");
            } else {
                document.getElementById("resultStatus").value = getText("synchronize.fail");
            }
        }
    }else  {
        document.getElementById("resultStatus").collapsed = true;
        document.getElementById("resultLabel").collapsed = true;
    }
}

function openServerStatusPage() {
    var result = window.arguments[0];
    if (result && result.description && result.description.manageWaitingUrl) {
        // first construct an nsIURI object using the ioservice
        var ioservice = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService);

        var uriToOpen = ioservice.newURI(result.description.manageWaitingUrl,
            null, null);

        var extps = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
            .getService(Components.interfaces.nsIExternalProtocolService);

        // now, open it!
        extps.loadURI(uriToOpen);
    }
}