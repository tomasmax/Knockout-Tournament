// Edit me.
// Feel free to add other JS files in this directory as you see fit.

// Knockout Tournament Front End

var KnockoutTournament = KnockoutTournament || {};

(function (KnockoutTournament) {

    const ELEMENT_IDS = {
        TEAMS_PER_MATCH: "teamsPerMatch",
        NUMBER_OF_TEAMS: "numberOfTeams",
        START: "start",
        WINNER: "winner"
    }

    const ELEMENT_ACTIONS = {
        ACTIVATE: "activate",
        DEACTIVATE: "deactivate"
    }

    KnockoutTournament.MainView = class MainView {

        constructor() {

            this.teamsPerMatchElement = document.getElementById(ELEMENT_IDS.TEAMS_PER_MATCH);
            this.numberOfTeamsElement = document.getElementById(ELEMENT_IDS.NUMBER_OF_TEAMS);
            this.startButtonElement = document.getElementById(ELEMENT_IDS.START);
            this.winnerElement = document.getElementById(ELEMENT_IDS.WINNER);
            
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

            this.winnerElement.textContent = '${winner} is the Winner.';
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

        async startTournament() {
            // Start tournament and handle all the elements
            console.log("starting tournament");

        }

    }
})(KnockoutTournament);

window.onload = function () {
    new KnockoutTournament.MainView().init();
}
