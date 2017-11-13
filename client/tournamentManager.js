
// gathers tournament data from server API
// gathers winning scores 
// caches a map with teams data for tournament next rounds 
var KnockTournament = KnockTournament || {};

(function (KnockTournament) {

    const REQUEST_URL = {
        TOURNAMENT: "/tournament",
        TEAM: "/team",
        MATCH: "/match",
        WINNER: "/winner"
    };

    const HTTP_STATUS_CODES = {
        OK: 200
    };

    let TournamentError = KnockTournament.AppError;
    let MESSAGES = KnockTournament.Constants.MESSAGES;

    KnockTournament.TournamentManager = class TournamentManager {

        constructor(teamsPerMatch, numberOfTeams, requestManager) {

            this._teamsPerMatch = teamsPerMatch;
            this._numberOfTeams = numberOfTeams;
            this._tournamentId = null;
            this._teamsMap = {};
            this.requestManager = requestManager;

        }

        static _getNetworkErrorMessage(responseData, responseJSON) {
            
            let message = MESSAGES.NETWORK_ERROR + responseData.status;

            if (responseJSON.hasOwnProperty("error")) {
                if (responseJSON.hasOwnProperty("message")) {
                    message = responseJSON.message
                }
            }

            return message;

        }

        // Creates a tournament and gets the first round's matches
        createTournament() {
            
            return new Promise(async (resolve, reject) => {

                try {

                    let tournamentData = await this.httpRequestManager.post(REQUEST_URL.TOURNAMENT, {
                        teamsPerMatch: this._teamsPerMatch,
                        numberOfTeams: this._numberOfTeams,
                    });

                    // await for the promise to resolve
                    let responseJSON = await tournamentData.json();
                    this._tournamentId = responseJSON.tournamentId;

                    // if HTTP status code not 200 reject
                    if (tournamentData.status !== HTTP_STATUS_CODES.OK) {
                        let message = TournamentManager._getNetworkErrorMessage(
                            tournamentData, responseJSON
                        );

                        return reject(new TournamentError(message));
                    }

                    // everything OK, resolve promise returning mathUps from the JSON
                    return resolve(responseJSON.matchUps);

                } catch (exception) {
                    return reject(new TournamentError(MESSAGES.UNKNOWN_ERROR, exception.stack));
                }
            });
        }

        
    }
    
})(KnockTournament);