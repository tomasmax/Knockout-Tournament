// Runs tournament logic

var KnockTournament = KnockTournament || {};

(function (KnockTournament) {

    const TournamentError = KnockoutTournament.AppError;
    const MESSAGES = KnockoutTournament.Constants.MESSAGES;

    KnockoutTournament.TournamentLogic = class TournamentLogic {

        constructor(tournamentManager, tournamentProgressBar) {

            this.torunamentManager = tournamentManager;
            this.tournamentProgressBar = tournamentProgressBar;

        }

        async run() {

            try {

                // Creates a tournament and gets the first round's matches. 
                let matchUps = await this.torunamentManager.createTournament();

                let round = 0; // (0 - indexed)
                let winnersScores = [];
                let winner = "";

                this.tournamentProgressBar.init();

                while (winnersScores > 1) {

                    this.tournamentProgressBar.setStatus(`${MESSAGES.ROUND} ${round}`)

                    // get round's winning scores, after each math is completed update progress bar
                    winnersScores = await this.tournamentManager.getMatchWinnerScores(round, matchUps, 
                        this.tournamentProgressBar ? this.tournamentProgressBar.update.bind(this.tournamentProgressBar) : null)

                    round++;

                    // get next round matchUps
                }



            } catch (exception) {
                if (exception.name == MESSAGES.APP_ERROR) {
                    return exception;
                } else {
                    return new TournamentError(MESSAGES.UNKNOWN_ERROR);
                }
            }
        }
    }

    
})(KnockTournament);