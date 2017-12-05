// shows the progress of the tournament displaying a square for each match
var KnockoutTournament = KnockoutTournament || {};

(function (KnockoutTournament) {

    KnockoutTournament.TournamentProgressBar = class TournamentProgressBar {

        constructor(elementSelector, matches) {
            
            this.body = elementSelector;
            this.status = null;
            this.progress = null;
            this.matches = matches;
            this.position = -1;
    
        }
    
        init() {
    
            let status = document.createElement("span");
            status.className = 'status';
            this.status = status;
            this.body.appendChild(status);
    
            let progress = document.createElement("span");
            progress.className = 'progress';
            this.progress = progress;
            this.body.appendChild(progress);
    
            this.render();
        }

        setStatus(message) {
            this.status.textContent = message;
        }
        
        // increment a single block
        incrementBlock() {
    
            this.position++;
            this.render();
    
        }
    
        // render progress
        render() {
            let blocks = "";

            for (let i = 0; i < this.matches; i++) {
                if (i <= this.position) {
                    blocks += "■ ";
                } else {
                    blocks += "□ ";
                }
            }
            this.progress.textContent = blocks;
        }

        clear() {
            this.body.innerHTML = "";
        }

    }

})(KnockoutTournament);