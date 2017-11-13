// Helper functions & constants

var KnockoutTournament = KnockoutTournament || {};

(function (KnockoutTournament) {

    KnockoutTournament.Constants = {};

    KnockoutApp.Constants.MESSAGES = {
        APP_ERROR: "AppError",
        NETWORK_ERROR: "Network Error: Status ",
        UNKNOWN_ERROR: "Unknown Error"
    };

    // App errors
    KnockoutTournament.AppError = class AppError extends Error {
        constructor(message, stack) {
            super();
            this.name = KnockoutApp.Constants.MESSAGES.APP_ERROR;
            this.message = message;
            if (stack)
                this.stack = stack;
            else
                this.stack = (new Error()).stack;
        }
    }
    


})(KnockoutTournament);