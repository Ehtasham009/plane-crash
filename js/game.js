/* ==========================================
   GAME ENGINE
========================================== */

const Game = {

    state: GAME_STATE.WAITING,
    crashPoint: 0,
    currentMultiplier: 1.00,
    betAmount: 0,
    hasBet: false,
    hasCashedOut: false,
    cashedOutAt: 0,
    profit: 0,
    tickInterval: null,
    tickSpeed: 50,
    autoCashout: 0,
    roundHistory: [],
    players: [],

    init() {
        this.state = GAME_STATE.WAITING;
        this.hasBet = false;
        this.hasCashedOut = false;
        this.profit = 0;
        this.currentMultiplier = 1.00;
        this.players = [];
    },

    startRound() {
        this.init();
        this.crashPoint = generateCrashPoint();
        this.betAmount = UI.getBetAmount();

        UI.setMultiplier("1.00x", "multiplier-green");
        UI.setStatus("Starting...");
        UI.setCurrentBet(0);
        UI.setProfit(0);
        UI.enableInput();
        UI.setBetButton("Place Bet", "var(--green)");
        UI.enableBet();
        UI.disableCashout();
        UI.setCashoutText("Cash Out");
        UI.hideCancel();

        this.generatePlayers();
        UI.renderPlayers(this.players);

        this.waitingCountdown(2);
    },

    waitingCountdown(seconds) {
        const board = UI.els.gameBoard;

        let overlay = board.querySelector(".countdown");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "countdown";
            board.appendChild(overlay);
        }

        let count = seconds;
        overlay.textContent = count;
        overlay.style.display = "flex";

        UI.setStatus("Next round in " + count + "s...");
        Sound.play("tick");

        const timer = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(timer);
                overlay.style.display = "none";
                this.beginFlight();
            } else {
                overlay.textContent = count;
                UI.setStatus("Next round in " + count + "s...");
                Sound.play("tick");
            }
        }, 1000);
    },

    beginFlight() {
        this.state = GAME_STATE.RUNNING;
        this.currentMultiplier = 1.00;

        UI.setMultiplier("1.00x", "multiplier-green");
        UI.setStatus("FLEW AWAY! Cash out before crash!");
        UI.disableInput();
        UI.hideCancel();

        if (this.hasBet) {
            UI.enableCashout();
            UI.setCashoutText("Cash Out");
            UI.setCurrentBet(this.betAmount);
        }

        Animation.reset();
        Animation.startPlaneAnimation();
        Sound.play("fly");
        Sound.startEngine(Sound.getCtx());

        let tickCount = 0;

        this.tickInterval = setInterval(() => {
            tickCount++;

            let growth = Math.pow(this.currentMultiplier, 1.08);
            let increment = (growth - this.currentMultiplier) * 0.06 + 0.01;

            if (this.currentMultiplier >= 10) {
                increment *= 0.35;
            } else if (this.currentMultiplier >= 5) {
                increment *= 0.55;
            } else if (this.currentMultiplier >= 2.5) {
                increment *= 0.75;
            }

            this.currentMultiplier += increment;
            this.currentMultiplier = parseFloat(this.currentMultiplier.toFixed(2));

            this.currentMultiplier = Math.min(this.currentMultiplier, this.crashPoint);

            let colorClass = "multiplier-green";
            if (this.currentMultiplier >= 10) colorClass = "multiplier-yellow";
            else if (this.currentMultiplier >= 2) colorClass = "multiplier-green";

            UI.setMultiplier(this.currentMultiplier.toFixed(2) + "x", colorClass);

            Sound.updateEngine(this.currentMultiplier);
            Animation.updatePlaneAnimation(this.currentMultiplier);

            if (tickCount % 3 === 0) {
                Animation.addPoint();
            }

            if (this.hasBet && !this.hasCashedOut) {
                this.profit = (this.betAmount * this.currentMultiplier) - this.betAmount;
                UI.setProfit(this.profit);
                UI.setCashoutText("Cash Out @ " + this.currentMultiplier.toFixed(2) + "x");
            }

            this.updateBotCashouts();

            if (this.currentMultiplier >= this.crashPoint) {
                this.crash();
            }

        }, this.tickSpeed);
    },

    crash() {
        clearInterval(this.tickInterval);
        this.state = GAME_STATE.CRASHED;

        UI.setMultiplier(this.crashPoint.toFixed(2) + "x", "multiplier-red");
        UI.setStatus("CRASHED at " + this.crashPoint.toFixed(2) + "x!");
        UI.disableCashout();
        UI.enableInput();
        UI.enableBet();

        UI.addCrashEffect();
        Sound.stopEngine();
        Sound.play("crash");

        History.add(this.crashPoint);
        UI.setLastCrash(this.crashPoint);
        this.roundHistory.push(this.crashPoint);

        if (this.hasBet && !this.hasCashedOut) {
            UI.setProfit(-this.betAmount);
            UI.addLoseEffect();
            UI.showPopup("Plane crashed! You lost $" + Utils.formatMoney(this.betAmount), "var(--red)");
            Sound.play("lose");
            Store.addGame(false, -this.betAmount);
        }

        this.resolveBotPlayers();

        setTimeout(() => {
            UI.renderPlayers(this.players);
        }, 300);

        this.hasBet = false;
        this.hasCashedOut = false;

        setTimeout(() => {
            this.startRound();
        }, 3000);
    },

    placeBet() {
        if (this.state !== GAME_STATE.WAITING && this.state !== GAME_STATE.CRASHED) return;

        let amount = UI.getBetAmount();

        if (amount <= 0) {
            UI.showPopup("Enter a valid bet amount!", "var(--red)");
            return;
        }

        if (amount > UI.balance) {
            UI.showPopup("Insufficient balance!", "var(--red)");
            return;
        }

        this.hasBet = true;
        this.betAmount = amount;
        UI.balance -= amount;
        UI.updateBalance();

        UI.showCancel();
        UI.setCurrentBet(amount);
        Store.setBetAmount(amount);
        Sound.play("bet");
        UI.showPopup("Bet placed: $" + Utils.formatMoney(amount) + " — Cancel before takeoff!", "var(--blue)");
    },

    cancelBet() {
        if (!this.hasBet) return;
        if (this.state !== GAME_STATE.WAITING && this.state !== GAME_STATE.CRASHED) return;

        let refund = this.betAmount;
        UI.balance += refund;
        UI.updateBalance();

        this.hasBet = false;
        this.betAmount = 0;

        UI.hideCancel();
        UI.setCurrentBet(0);
        UI.setProfit(0);
        Sound.play("lose");
        UI.showPopup("Bet cancelled — $" + Utils.formatMoney(refund) + " refunded", "var(--yellow)");
    },

    cashOut() {
        if (this.state !== GAME_STATE.RUNNING) return;
        if (!this.hasBet || this.hasCashedOut) return;

        this.hasCashedOut = true;
        this.cashedOutAt = this.currentMultiplier;

        let payout = this.betAmount * this.currentMultiplier;
        let profit = payout - this.betAmount;

        UI.balance += payout;
        UI.updateBalance();

        UI.disableCashout();
        UI.setCashoutText("Cashed Out @ " + this.currentMultiplier.toFixed(2) + "x");
        UI.setProfit(profit);
        UI.addWinEffect();
        Animation.cashoutFlash();
        Sound.play("win");

        UI.showPopup(
            "Cashed out at " + this.currentMultiplier.toFixed(2) + "x — Won $" + Utils.formatMoney(profit) + "!",
            "var(--green)"
        );

        Store.addGame(true, profit);

        let self = this;
        let mePlayer = this.players.find(p => p.isMe);
        if (mePlayer) {
            mePlayer.status = "won";
            mePlayer.cashOutAt = this.currentMultiplier;
            mePlayer.payout = payout;
            UI.renderPlayers(this.players);
        }
    },

    /* ====== BOT PLAYERS ====== */

    generatePlayers() {
        this.players = [];
        let count = Utils.randomInt(4, 8);

        let mePlayer = {
            name: "You",
            bet: this.hasBet ? this.betAmount : 0,
            autoCashOut: 0,
            active: true,
            status: "waiting",
            isMe: true,
            cashOutAt: 0,
            payout: 0
        };
        this.players.push(mePlayer);

        for (let i = 0; i < count; i++) {
            let p = generatePlayer();
            p.isMe = false;
            p.status = "waiting";
            p.cashOutAt = 0;
            p.payout = 0;
            this.players.push(p);
        }
    },

    updateBotCashouts() {
        this.players.forEach(p => {
            if (p.isMe || !p.active || p.status === "won" || p.status === "lost") return;

            p.status = "playing";

            if (this.currentMultiplier >= p.autoCashOut && Math.random() < 0.04) {
                p.status = "won";
                p.cashOutAt = this.currentMultiplier;
                p.payout = p.bet * this.currentMultiplier;
                Sound.play("botcash");
            }
        });
    },

    resolveBotPlayers() {
        this.players.forEach(p => {
            if (p.isMe) return;
            if (p.status === "won") return;
            p.status = "lost";
        });
    }
};
