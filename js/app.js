/* ==========================================
   APP INIT
========================================== */

(function() {

    document.addEventListener("DOMContentLoaded", () => {

        UI.init();
        Animation.init();
        History.init();
        Sound.init();

        /* load sound preference */
        const savedSound = Store.load().sound;
        if (savedSound === false) {
            Sound.enabled = false;
            const sb = document.getElementById("soundBtn");
            if (sb) { sb.textContent = "🔇"; sb.title = "Sound Off"; }
        }

        /* bet */
        UI.els.betBtn.addEventListener("click", () => {
            if (Game.state === GAME_STATE.WAITING || Game.state === GAME_STATE.CRASHED) {
                Game.placeBet();
            }
        });

        /* cashout */
        UI.els.cashoutBtn.addEventListener("click", () => {
            Game.cashOut();
        });

        /* cancel bet */
        UI.els.cancelBtn.addEventListener("click", () => {
            Game.cancelBet();
        });

        /* enter to bet */
        UI.els.betAmount.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                if (Game.state === GAME_STATE.WAITING || Game.state === GAME_STATE.CRASHED) {
                    Game.placeBet();
                }
            }
        });

        /* save bet amount on change */
        UI.els.betAmount.addEventListener("change", () => {
            Store.setBetAmount(parseFloat(UI.els.betAmount.value) || 100);
        });

        /* quick bet buttons */
        let halfBtn = document.getElementById("halfBtn");
        let doubleBtn = document.getElementById("doubleBtn");
        let maxBtn = document.getElementById("maxBtn");

        if (halfBtn) {
            halfBtn.addEventListener("click", () => {
                let val = UI.getBetAmount();
                UI.setBetAmount(Math.max(10, Math.floor(val / 2)));
                Store.setBetAmount(UI.getBetAmount());
            });
        }

        if (doubleBtn) {
            doubleBtn.addEventListener("click", () => {
                let val = UI.getBetAmount();
                UI.setBetAmount(Math.min(UI.balance, val * 2));
                Store.setBetAmount(UI.getBetAmount());
            });
        }

        if (maxBtn) {
            maxBtn.addEventListener("click", () => {
                UI.setBetAmount(Math.floor(UI.balance));
                Store.setBetAmount(UI.getBetAmount());
            });
        }

        /* sound toggle */
        let soundBtn = document.getElementById("soundBtn");
        if (soundBtn) {
            soundBtn.addEventListener("click", () => {
                let on = Sound.toggle();
                soundBtn.textContent = on ? "🔊" : "🔇";
                soundBtn.title = on ? "Sound On" : "Sound Off";
                Store.save({ sound: on });
            });
        }

        /* reset button */
        let resetBtn = document.getElementById("resetBtn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                if (confirm("Sab data delete ho jayega (balance, history, stats). Reset karna hai?")) {
                    Store.reset();
                    location.reload();
                }
            });
        }

        Game.startRound();

    });

})();
