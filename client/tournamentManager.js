
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
        OK: 200,
        SERVER_ERROR: 500,
        CLIENT_ERROR: 400
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
            
            return new Promise( async (resolve, reject) => {

                try {

                    let tournamentData = await this.httpRequestManager.post(REQUEST_URL.TOURNAMENT, {
                        teamsPerMatch: this._teamsPerMatch,
                        numberOfTeams: this._numberOfTeams,
                    });

                    // await for the promise to resolve
                    let responseJSON = await tournamentData.json();
                    this._tournamentId = responseJSON.tournamentId;

                    // if HTTP status code is not 200 reject
                    if (tournamentData.status !== HTTP_STATUS_CODES.OK) {
                        let errorMessage = TournamentManager._getNetworkErrorMessage(
                            tournamentData, responseJSON
                        );

                        return reject(new TournamentError(errorMessage));
                    }

                    // everything OK, resolve promise returning mathUps from the JSON
                    return resolve(responseJSON.matchUps);

                } catch(exception) {
                    return reject(new TournamentError(MESSAGES.UNKNOWN_ERROR, exception.stack));
                }
            });
        }

        // gets match data, match score
        getMatchData(round, match) {

            return new Promise( async (resolve, reject) => {

                try {
                    if (this._tournamentId == null) {
                        return reject(new TournamentError(MESSAGES.INVALID_TOURNAMENT_ID));
                    }

                    let matchData = await this.httpRequestManager.get(REQUEST_URL.MATCH, {
                        tournamentId: this._tournamentId,
                        round: round,
                        match: match
                    });

                    let matchJSON = await matchData.json();

                    // if HTTP status code is not 200 reject
                    if (matchData.status !== HTTP_STATUS_CODES.OK) {
                        let errorMessage = TournamentManager._getNetworkErrorMessage(
                            matchData, matchJSON
                        );

                        return reject(new TournamentError(errorMessage));
                    }

                    return resolve(matchJSON.json());

                } catch(exception) {
                    return reject(new TournamentError(MESSAGES.UNKNOWN_ERROR, exception.stack));
                }

            });
        }

        // get team data
        getTeamData(teamId) {

            return new promise( async (resolve, reject) => {
                try {

                    if (this._tournamentId == null) {
                        return reject(new TournamentError(MESSAGES.INVALID_TOURNAMENT_ID));
                    }

                    let teamData = await this.httpRequestManager.get(REQUEST_URL.TEAM, {
                        tournamentId: this._tournamentId,
                        teamId: teamId
                    });

                    let teamJSON = await teamdData.json();

                    if (teamdData.status !== HTTP_STATUS_CODES.OK) {
                        let errorMessage = TournamentManager._getNetworkErrorMessage(
                            teamdData, teamJSON
                        );

                        return reject(new TournamentError(errorMessage));
                    }

                    return resolve(teamJSON);

                } catch (exception) {
                    return reject(new TournamentError(MESSAGES.UNKNOWN_ERROR, exception.stack));
                }

            });
        }

       // Gets the winning score of a match.
       async getWiningScoreOfMatch(teamScores, matchScore, finishedMatchCallback) {
           
            return Promise( async (resolve, reject) => {
                
                try {

                    if (this._tournamentId == null) {
                        return reject(new TournamentError(MESSAGES.INVALID_TOURNAMENT_ID));
                    }

                    let matchWinningData = await this.httpRequestManager.get(REQUEST_URL.WINNER, {
                        tournamentId: this._tournamentId,
                        teamScores: await teamScores,
                        matchScores: await matchScores
                    });

                    let matchWinningDataJSON = winningData.json();

                    if (winningData.status !== HTTP_STATUS_CODES.OK) {
                        let errorMessage = TournamentManager._getNetworkErrorMessage(
                            teamdData, teamJSON
                        );

                        return reject(new TournamentError(errorMessage));
                    }

                    if (finishedMatchCallback) {
                        finishedMatchCallback();
                    }

                    return resolve(matchWinningDataJSON.score)

                } catch (exception) {
                    return reject(new TournamentError(MESSAGES.UNKNOWN_ERROR, exception.stack));
                }

            });
       }

       // get team scores of a match using promises and populates teamMap to generate next round
       async getTeamScores(teamIds) {

           let teamPromiseList = [];
           let teamScoreList = [];

           teamsIds.forEach(teamId => {
               if (!this._teamsMap.hasOwnProperty(teamId)) {
                   teamPromiseList.push(this.getTeamData(teamId))
               } else {
                   teamScoreList.push(this._teamsMap[teamId].score);
               }
           });

           // wait till all the promises in the list are resolved
           (await Promise.all(teamPromiseList)).forEach(team => {
               teamScoreList.push(team.score);
               this._teamsMap[team.teamId] = team
           });

           return teamScoreList;
       }

       // get winning scores asynchronously partially
       async getMatchWinnerScore(round, matches, finishedMatchCallback) {

           let winnersList = [];

           for (let i = 0; i < matches.length; i = i + 11) {
               let asyncWinnerList = await this.getWinnersAsyncList(i, round, matches, finishedMatchCallback);
               winnersList = winnersList.concat(asyncWinnerList);
           }

           return winnersList;

       }

       // gets a portion of Winners asynchronously
       async getWinnersAsyncList(index, round, matches, finishedMatchCallback) {

           let winnersPromiseList = [];

           for (let i=index; k < i + 11 && k < matches.length; j++) {
               let teamScores = this.getTeamScores(matches[i].teamIds);
               let matchScore = this.getMatchData(round, matches[i]);
               winnersPromiseList .push(this.getWiningScoreOfMatch(teamScores, matchScore, finishedMatchCallback));
           }
       }

    }
    
})(KnockTournament);