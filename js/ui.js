/* ==========================================
   UI CONTROLLER
========================================== */

const UI = {

    balance: 1000.00,

    init() {
        this.els = {
            balance:      $("#balance"),
            multiplier:   $("#multiplier"),
            gameStatus:   $("#gameStatus"),
            betAmount:    $("#betAmount"),
            betBtn:       $("#betBtn"),
            cashoutBtn:   $("#cashoutBtn"),
            currentBet:   $("#currentBet"),
            profit:       $("#profit"),
            lastCrash:    $("#lastCrash"),
            plane:        $("#plane"),
            playersList:  $("#playersList"),
            gameBoard:    $(".game-board"),
            cancelBtn:    $("#cancelBtn")
        };

        this.balance = Store.getBalance();
        let savedBet = Store.getBetAmount();
        if (savedBet > 0) {
            this.els.betAmount.value = savedBet;
        }

        this.updateBalance();
    },

    updateBalance() {
        this.els.balance.textContent = Utils.formatMoney(this.balance);
        Store.setBalance(this.balance);
    },

    setMultiplier(value, className) {
        this.els.multiplier.textContent = value;
        this.els.multiplier.className = className || "";
    },

    setStatus(text) {
        this.els.gameStatus.textContent = text;
    },

    setCurrentBet(value) {
        this.els.currentBet.textContent = Utils.formatMoney(value);
    },

    setProfit(value) {
        const el = this.els.profit;
        el.textContent = Utils.formatMoney(value);

        if (value > 0) {
            el.style.color = "var(--green)";
        } else if (value < 0) {
            el.style.color = "var(--red)";
        } else {
            el.style.color = "var(--text)";
        }
    },

    setLastCrash(value) {
        this.els.lastCrash.textContent = value.toFixed(2) + "x";
        this.els.lastCrash.style.color =
            value < 2.0 ? "var(--red)" : "var(--green)";
    },

    enableBet() {
        this.els.betBtn.disabled = false;
        this.els.betBtn.textContent = "Place Bet";
        this.els.betBtn.style.background = "var(--green)";
    },

    disableBet() {
        this.els.betBtn.disabled = true;
    },

    setBetButton(text, color) {
        this.els.betBtn.textContent = text;
        this.els.betBtn.style.background = color || "var(--green)";
    },

    showCancel() {
        this.els.betBtn.style.display = "none";
        this.els.cancelBtn.style.display = "flex";
        this.els.cashoutBtn.disabled = true;
        this.els.cashoutBtn.style.display = "none";
    },

    hideCancel() {
        this.els.betBtn.style.display = "flex";
        this.els.betBtn.disabled = false;
        this.els.cancelBtn.style.display = "none";
        this.els.cashoutBtn.style.display = "flex";
    },

    enableCashout() {
        this.els.cashoutBtn.disabled = false;
    },

    disableCashout() {
        this.els.cashoutBtn.disabled = true;
    },

    setCashoutText(text) {
        this.els.cashoutBtn.textContent = text;
    },

    disableInput() {
        this.els.betAmount.disabled = true;
    },

    enableInput() {
        this.els.betAmount.disabled = false;
    },

    getBetAmount() {
        return parseFloat(this.els.betAmount.value) || 0;
    },

    setBetAmount(value) {
        this.els.betAmount.value = value;
    },

    showPopup(text, color) {
        let popup = $(".popup");
        if (!popup) {
            popup = document.createElement("div");
            popup.className = "popup";
            document.body.appendChild(popup);
        }
        popup.textContent = text;
        popup.style.color = color || "white";
        popup.style.borderColor = color || "#2e405d";
        popup.classList.add("show");

        setTimeout(() => {
            popup.classList.remove("show");
        }, 2500);
    },

    renderPlayers(players) {
        const list = this.els.playersList;
        list.innerHTML = "";

        players.forEach(p => {
            const card = document.createElement("div");
            card.className = "player fade-in";
            if (p.status === "won") card.classList.add("win");
            if (p.status === "lost") card.classList.add("lose");

            let statusText = "";
            if (p.status === "waiting") {
                statusText = `<div class="player-bet">Bet: $${Utils.formatMoney(p.bet)} | Waiting...</div>`;
            } else if (p.status === "playing") {
                statusText = `<div class="player-bet">Bet: $${Utils.formatMoney(p.bet)} | Playing</div>`;
            } else if (p.status === "won") {
                statusText = `
                    <div class="player-bet">Bet: $${Utils.formatMoney(p.bet)}</div>
                    <div class="player-cash">Cashed out at ${p.cashOutAt.toFixed(2)}x = $${Utils.formatMoney(p.payout)}</div>`;
            } else {
                statusText = `
                    <div class="player-bet">Bet: $${Utils.formatMoney(p.bet)}</div>
                    <div class="player-cash" style="color:var(--red)">Crashed - Lost $${Utils.formatMoney(p.bet)}</div>`;
            }

            card.innerHTML = `
                <div class="player-name">${p.name}</div>
                ${statusText}`;

            list.appendChild(card);
        });
    },

    clearPlayers() {
        this.els.playersList.innerHTML = "";
    },

    addCrashEffect() {
        this.els.gameBoard.classList.add("crash");
        setTimeout(() => {
            this.els.gameBoard.classList.remove("crash");
        }, 400);
    },

    addWinEffect() {
        this.els.gameBoard.classList.add("win");
        setTimeout(() => {
            this.els.gameBoard.classList.remove("win");
        }, 600);
    },

    addLoseEffect() {
        this.els.gameBoard.classList.add("shake");
        setTimeout(() => {
            this.els.gameBoard.classList.remove("shake");
        }, 500);
    }
};
