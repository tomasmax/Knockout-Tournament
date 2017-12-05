
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

    let MESSAGES = KnockoutTournament.Constants.MESSAGES;
    let TournamentError = KnockoutTournament.AppError;
    let Utils = KnockoutTournament.Utils;

    const asyncListLength = 31;

    KnockTournament.TournamentManager = class TournamentManager {

        constructor(teamsPerMatch, numberOfTeams, HttpRequestManager) {

            this._teamsPerMatch = teamsPerMatch;
            this._numberOfTeams = numberOfTeams;
            this._tournamentId = null;
            this.teamsMap = {};
            this.HttpRequestManager = HttpRequestManager;

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

        // Creates a tournament and gets first round matchUps
        createTournament() {
            
            return new Promise( async (resolve, reject) => {

                try {

                    let tournamentData = await this.HttpRequestManager.post(REQUEST_URL.TOURNAMENT, {
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

                    let matchData = await this.HttpRequestManager.get(REQUEST_URL.MATCH, {
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

                    return resolve(matchJSON.score);

                } catch(exception) {
                    return reject(new TournamentError(MESSAGES.UNKNOWN_ERROR, exception.stack));
                }

            });
        }

        // Gets team data
        getTeamData(teamId) {

            return new Promise( async (resolve, reject) => {
                try {

                    if (this._tournamentId == null) {
                        return reject(new TournamentError(MESSAGES.INVALID_TOURNAMENT_ID));
                    }

                    let teamData = await this.HttpRequestManager.get(REQUEST_URL.TEAM, {
                        tournamentId: this._tournamentId,
                        teamId: teamId
                    });

                    let teamJSON = await teamData.json();

                    if (teamData.status !== HTTP_STATUS_CODES.OK) {
                        let errorMessage = TournamentManager._getNetworkErrorMessage(
                            teamData, teamJSON
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
       async getWinningScoreOfMatch(teamScores, matchScore, finishedMatchCallback) {
           
            return new Promise( async (resolve, reject) => {
                
                try {

                    if (this._tournamentId == null) {
                        return reject(new TournamentError(MESSAGES.INVALID_TOURNAMENT_ID));
                    }

                    let matchWinningData = await this.HttpRequestManager.get(REQUEST_URL.WINNER, {
                        tournamentId: this._tournamentId,
                        teamScores: await teamScores,
                        matchScore: await matchScore
                    });

                    let matchWinningDataJSON = matchWinningData.json();

                    if (matchWinningData.status !== HTTP_STATUS_CODES.OK) {
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

       // gets team scores of a match using promises and populates teamMap to generate next round
       async getTeamScores(teamIds) {

           let teamPromiseList = [];
           let teamScoreList = [];

           teamIds.forEach(teamId => {
               if (!this.teamsMap.hasOwnProperty(teamId)) {
                   teamPromiseList.push(this.getTeamData(teamId))
               } else {
                   teamScoreList.push(this.teamsMap[teamId].score);
               }
           });

           // wait till all the promises in the list are resolved
           (await Promise.all(teamPromiseList)).forEach(team => {
               teamScoreList.push(team.score);
               this.teamsMap[team.teamId] = team
           });

           return teamScoreList;
       }

       // get winning scores asynchronously partially
       async getMatchWinnerScores(round, matches, finishedMatchCallback) {

           let winnersList = [];

           for (let i = 0; i < matches.length; i = i + asyncListLength) {
               let asyncWinnerList = await this.getWinnersAsyncList(i, round, matches, finishedMatchCallback);
               winnersList = winnersList.concat(asyncWinnerList);
           }

           return winnersList;

       }

       // gets a portion of Winners asynchronously
       async getWinnersAsyncList(index, round, matches, finishedMatchCallback) {

           let winnersPromiseList = [];

           for (let i=index; i < index + asyncListLength && i < matches.length; i++) {
               let matchScore = this.getMatchData(round, matches[i].match);
               let teamScores = this.getTeamScores(matches[i].teamIds);

               winnersPromiseList.push(this.getWinningScoreOfMatch(teamScores, matchScore, finishedMatchCallback));
           }

           //wait till all the promises are solved
           return Promise.all(winnersPromiseList);
       }

       // generates matchups for next round
       getNextRoundMatchUps(winnerScoreList, lastMatchList) {
           console.log("getNextRoundMatchUps");
           let nextMatchUpList = [];
           let sortedWinningScores = winnerScoreList.sort();

           let winnerTeamIdList = lastMatchList.map( match => {
               let winningTeam = match.teamIds.filter(id => {
                   return (Utils.binarySearch.call(sortedWinningScores, this.teamsMap[id].score != -1));
               });
               return winningTeam[0];

           });
           console.log(winnerTeamIdList);

           let teamIdGroups = winnerTeamIdList.reduce((rows, currentValue, currentIndex) =>
                (currentIndex % this._teamsPerMatch == 0
                    ? rows.push([currentValue])
                    : rows[rows.length - 1].push(currentValue))
                && rows, []);
            console.log(teamIdGroups);

            let matchIndex = 0;
            nextMatchUpList = teamIdGroups.map(teamGroup => {
                return {
                    match: matchIndex++, 
                    teamIds: teamGroup
                }
            });
            console.log(nextMatchUpList);

            return nextMatchUpList;

       }

    }
    
})((KnockoutTournament));