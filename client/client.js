// Edit me.
// Feel free to add other JS files in this directory as you see fit.

// Knockout Tournament Front End

var KnockoutTournament = KnockoutTournament || {};

(function (KnockoutTournament) {

    const ELEMENT_IDS = {
        TEAMS_PER_MATCH: "teamsPerMatch",
        NUMBER_OF_TEAMS: "numberOfTeams",
        START: "start",
        WINNER: "winner",
        ERROR: "error",
        TOURNAMENT_PROGRESS_BAR: "tournamentProgressBar"
    }

    const ELEMENT_ACTIONS = {
        ACTIVATE: "activate",
        DEACTIVATE: "deactivate"
    }

    let MESSAGES = KnockoutTournament.Constants.MESSAGES;
    let TournamentError = KnockoutTournament.AppError;

    KnockoutTournament.MainView = class MainView {

        constructor() {

            this.teamsPerMatchElement = document.getElementById(ELEMENT_IDS.TEAMS_PER_MATCH);
            this.numberOfTeamsElement = document.getElementById(ELEMENT_IDS.NUMBER_OF_TEAMS);
            this.startButtonElement = document.getElementById(ELEMENT_IDS.START);
            this.winnerElement = document.getElementById(ELEMENT_IDS.WINNER);
            this.tournamentProgressBarElement = document.getElementById(ELEMENT_IDS.TOURNAMENT_PROGRESS_BAR);
            this.errorElement = document.getElementById(ELEMENT_IDS.ERROR);

        }

        init() {

            this.initListener();
        }

        initListener() {
            
            this.startButtonElement.addEventListener("click", async () => {
                this.startTournament();
            });
        }

        setWinner(winner) {

            this.winnerElement.textContent = `${winner} is the Winner.`;
        }
        
        getTournamentMatches() {
            
            let teamsPerMatch = this.teamsPerMatchElement.value;
            let numberOfTeams = this.numberOfTeamsElement.value;
            let numberOfRounds = numberOfTeams / teamsPerMatch;
            let tournamentMatches = numberOfRounds;

            while (numberOfRounds > 1) {
                numberOfRounds /= teamsPerMatch;
                tournamentMatches += numberOfRounds;
            }

            return tournamentMatches;
        }

        inputValidation() {

            let teamsPerMatch = this.teamsPerMatchElement.value;
            let numberOfTeams = this.numberOfTeamsElement.value;

            if (Number.isNaN(numberOfTeams)) {
                throw new TournamentError(MESSAGES.INVALID_NUMER_OF_TEAMS);
            }
            
            if (Number.isNaN(teamsPerMatch)) {
                throw new TournamentError(MESSAGES.INVALID_TEAMS_PER_MATCH);
            }

            if (teamsPerMatch <= 1) {
                throw new TournamentError(`${MESSAGES.INVALID_TEAMS_PER_MATCH_MIN} ${teamsPerMatch}`);
            }

            if (!KnockoutTournament.Utils.isPowerOf(teamsPerMatch, numberOfTeams)) {
                throw new TournamentError(`${MESSAGES.INVALID_TEAMS_PER_MATCH_POWER} ${teamsPerMatch}`);
            }

        }

        toggleStartButton(action) {
            if (action == ELEMENT_ACTIONS.ACTIVATE) {
                this.startButtonElement.style = 'display:block';
            }
            else if (action == ELEMENT_ACTIONS.DEACTIVATE) {
                this.startButtonElement.style = 'display:nonce';
            }
        }

        async startTournament() {

            // Start tournament and handle all the elements
            console.log("starting tournament");
            let tournamentProgressBar;

            try {

                this.errorElement.textContent = "";
                this.winnerElement.textContent = "";

                this.toggleStartButton(ELEMENT_ACTIONS.DEACTIVATE);
                this.inputValidation();

                tournamentProgressBar = new KnockoutTournament.TournamentProgressBar(this.tournamentProgressBarElement, this.getTournamentMatches());
                tournamentProgressBar.clear();
                let tournamentManager = new KnockoutTournament.TournamentManager(this.teamsPerMatchElement.value, this.numberOfTeamsElement.value, KnockoutTournament.HttpRequestManager);
                let tournamentLogic = new KnockoutTournament.TournamentLogic(tournamentManager, tournamentProgressBar);

                let winner = await tournamentLogic.run();

                this.setWinner(winner);
                this.toggleStartButton(ELEMENT_ACTIONS.ACTIVATE);

            }
            catch (exception) {
                this.errorElement.textContent = `${MESSAGES.ERROR_MSG} ${exception.message}`;
                console.log(exception.stack);

                this.toggleStartButton(ELEMENT_ACTIONS.ACTIVATE);
    
            }

        }

    }
})(KnockoutTournament);

window.onload = function () {
    new KnockoutTournament.MainView().init();
}
