// Helper functions & constants

var KnockoutTournament = KnockoutTournament || {};

(function (KnockoutTournament) {

    KnockoutTournament.Constants = {};

    KnockoutTournament.Constants.MESSAGES = {
        APP_ERROR: "App Error",
        NETWORK_ERROR: "Network Error: Status ",
        UNKNOWN_ERROR: "Unknown Error",
        INVALID_TOURNAMENT_ID: "The Tournament ID is not valid",
        ROUND: "Simulating Round: ",
        ROUND_FINAL: "Rounds simulated",
        INVALID_NUMER_OF_TEAMS: "The Number of Teams input is not valid",
        INVALID_TEAMS_PER_MATCH: "The Teams per Match input is not valid",
        INVALID_TEAMS_PER_MATCH_MIN: "The Teams per Match input can't be 1 or less",
        ERROR: "Error : ",
        INVALID_TEAMS_PER_MATCH_POWER: "The Number of Teams needs to be a power of Teams per Match"
    };

    // App errors
    KnockoutTournament.AppError = class AppError extends Error {
        constructor(message, stack) {
            super();
            this.name = KnockoutTournament.Constants.MESSAGES.APP_ERROR;
            this.message = message;
            if (stack) {
                this.stack = stack;
            } else {
                this.stack = (new Error()).stack;
            }
        }
    }

    KnockoutTournament.Utils = {};

    // Checks if x is a power of y
    KnockoutTournament.Utils.isPowerOf = function (y, x) {
        while (x % y == 0) {
            x = x / y;
        }  
        return x === 1;
    }

    //Binary search of value in an array of numbers
    KnockoutTournament.Utils.binarySearch = function(value) {

        let guess,
            min = 0,
            max = this.length - 1;	
    
        while(min <= max) {

            guess = Math.floor((min + max) / 2);
            if (this[guess] === value) {
                return guess;
            } else if (this[guess] < value) {
                min = guess + 1;
            } else {
                max = guess - 1;
            }	
         }
        
         return -1;
    }
    


})(KnockoutTournament);