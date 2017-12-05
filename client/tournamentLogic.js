// Runs tournament logic

var KnockTournament = KnockTournament || {};

(function (KnockTournament) {

    const TournamentError = KnockoutTournament.AppError;
    const MESSAGES = KnockoutTournament.Constants.MESSAGES;

    KnockoutTournament.TournamentLogic = class TournamentLogic {

        constructor(tournamentManager, tournamentProgressBar) {

            this.tournamentManager = tournamentManager;
            this.tournamentProgressBar = tournamentProgressBar;

        }

        async run() {

            try {

                // Creates a tournament and gets first round's matches. 
                let matchUps = await this.tournamentManager.createTournament();

                let round = 0; // (0 - indexed)
                let winnerScores = [];
                let winnerName = "";

                this.tournamentProgressBar.init();

                do {

                    this.tournamentProgressBar.setStatus(`${MESSAGES.ROUND} ${round}`)

                    // get round's winning scores, after each match is completed update progress bar
                    winnerScores = await this.tournamentManager.getMatchWinnerScores(round, matchUps, 
                        this.tournamentProgressBar ? this.tournamentProgressBar.incrementBlock.bind(this.tournamentProgressBar) : null);

                    round++;
                    
                    if (winnerScores.length > 1) {
                        // generate next round matchUps
                        matchUps = this.tournamentManager.getNextRoundMatchUps(winnerScores, matchUps);
                    }
                    
                } while (winnerScores.length > 1)

                this.tournamentProgressBar.incrementBlock();

                let winnerId = matchUps[0].teamIds.filter(id => this.tournamentManager.teamsMap[id.score] === winnerScores[0])[0];
                winnerName = this.tournamentManager.teamsMap[winnerId].name;

                return winnerName;

            } catch (exception) {

                return exception.stack;

            }
        }
    }

    
})((KnockoutTournament));