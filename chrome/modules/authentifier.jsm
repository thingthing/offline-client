const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://modules/logger.jsm");
Cu.import("resource://modules/network.jsm");
Cu.import("resource://modules/fdl-data-debug.jsm");
Cu.import("resource://modules/fdl-context.jsm");
Cu.import("resource://modules/offlineSynchronize.jsm");
Cu.import("resource://modules/preferences.jsm");
Cu.import("resource://modules/passwordManager.jsm");
Cu.import("resource://modules/StringBundle.jsm");

var EXPORTED_SYMBOLS = ["authentificator"];


var authentificator = function() {

    var Authentifier = function() {};

    Authentifier.prototype = {

            modeOffline : false,
            currentLogin : "",
            currentPassword : "",
            currentAppURL : "",
            result : {},
            translate : new StringBundle("chrome://dcpoffline/locale/main.properties"),

            authentifier : function(modeOffline, currentLogin, currentPassword, currentAppURL) {
                var networkState;

                if (! (currentLogin && currentPassword && currentAppURL)) {
                    return {result : null , reason : this.translate.get("authent.logInfoIncomplete")};
                }

                this.modeOffline = modeOffline;
                this.currentLogin = currentLogin;
                this.currentPassword = currentPassword;
                this.currentAppURL = currentAppURL;

                if (this.modeOffline) {
                    this.authentOffline();
                }else {
                    if (this.guessNetworkState()) {
                        this.authentOnline();
                    }else {
                        this.authentOffline();
                    }

                }
                return this.result;
            },

            authentOnline : function() {
                var currentProfile;
                var user;
                context.url = this.currentAppURL;
                if (context.isConnected()) {
                    user = context.setAuthentification({
                        login : this.currentLogin,
                        password : this.currentPassword
                    });
                    if (user) {
                        offlineSync.recordOfflineDomains();
                        if (user.id) {
                            Preferences.set("offline.user.id", user.id);
                        }
                        if (user.firstname){
                            Preferences.set("offline.user.firstName", user.firstname);
                        }
                        if (user.lastname) {
                            Preferences.set("offline.user.lastName", user.lastname);
                        }
                        if (user.getLocaleFormat()){
                            Preferences.set("offline.user.locale", JSON.stringify(user.getLocaleFormat()));
                        }
                        passwordManager.updatePassword(this.currentLogin, this.currentPassword);
                        this.result = {result : true};
                    }else {
                        this.result = {result : false, reason : this.translate.get("authent.serverDisagree")};
                    }
                }else {
                    this.result = {result : false, reason : this.translate.get("authent.serverUnreachable")};
                }
            },

            authentOffline : function() {
                this.result = passwordManager.checkPassword(this.currentLogin, this.currentPassword);
            },

            guessNetworkState : function() {
                return !(networkChecker.isOffline());
            }
    };

    return ( {
        authent: function(modeOffline, currentLogin, currentPassword, currentAppURL) {
            var authent = new Authentifier();
            return authent.authentifier(modeOffline, currentLogin, currentPassword, currentAppURL);
        }
    }
    )

}();

log('authentifier loaded');