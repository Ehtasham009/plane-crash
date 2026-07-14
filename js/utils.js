/* ==========================================
   UTILITIES
========================================== */

const Utils = {

    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomItem(arr) {
        return arr[
            Math.floor(Math.random() * arr.length)
        ];
    },

    formatMoney(value) {
        return Number(value).toFixed(2);
    },

    formatMultiplier(value) {
        return Number(value).toFixed(2) + "x";
    }

};


/* ==========================================
   PLAYER NAMES
========================================== */

const playerNames = [

    "Ali",
    "Ahmed",
    "Usman",
    "Bilal",
    "Hassan",
    "Hamza",
    "Danish",
    "Ahsan",
    "Zain",
    "Tayyab",
    "John",
    "David",
    "Oliver",
    "James",
    "Daniel",
    "Sophia",
    "Emma",
    "Mia",
    "Liam",
    "Noah",
    "Lucas",
    "Henry",
    "Ethan",
    "Mason",
    "Isabella"

];


/* ==========================================
   RANDOM PLAYER
========================================== */

function generatePlayer(){

    return {

        name:Utils.randomItem(playerNames),

        bet:Utils.randomInt(10,1000),

        autoCashOut:Utils.random(1.20,8.00),

        active:true

    };

}


/* ==========================================
   CRASH POINT
========================================== */

function generateCrashPoint(){

    let r = Math.random();

    if(r < 0.30) return Utils.random(1.00,1.50);

    if(r < 0.60) return Utils.random(1.50,3.00);

    if(r < 0.80) return Utils.random(3.00,6.00);

    if(r < 0.93) return Utils.random(6.00,15.00);

    return Utils.random(15.00,100.00);

}


/* ==========================================
   GAME STATES
========================================== */

const GAME_STATE = {

    WAITING:0,

    RUNNING:1,

    CRASHED:2

};


/* ==========================================
   DOM HELPERS
========================================== */

function $(selector){

    return document.querySelector(selector);

}

function $$(selector){

    return document.querySelectorAll(selector);

}


/* ==========================================
   DELAY
========================================== */

function sleep(ms){

    return new Promise(resolve=>{

        setTimeout(resolve,ms);

    });

}


/* ==========================================
   UUID
========================================== */

function uid(){

    return Date.now().toString(36)+Math.random().toString(36).substring(2);

}


/* ==========================================
   LOCAL STORAGE
========================================== */

const Store = {

    KEY: "planecrash_data",

    defaults() {
        return {
            balance: 1000.00,
            betAmount: 100,
            history: [],
            totalGames: 0,
            totalWins: 0,
            totalLosses: 0,
            totalProfit: 0,
            sound: true
        };
    },

    load() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (raw) {
                const data = JSON.parse(raw);
                return Object.assign(this.defaults(), data);
            }
        } catch (e) {}
        return this.defaults();
    },

    save(data) {
        try {
            const current = this.load();
            const merged = Object.assign(current, data);
            localStorage.setItem(this.KEY, JSON.stringify(merged));
        } catch (e) {}
    },

    getBalance() {
        return this.load().balance;
    },

    setBalance(val) {
        this.save({ balance: val });
    },

    getHistory() {
        return this.load().history;
    },

    setHistory(arr) {
        this.save({ history: arr });
    },

    getBetAmount() {
        return this.load().betAmount;
    },

    setBetAmount(val) {
        this.save({ betAmount: val });
    },

    getStats() {
        const d = this.load();
        return {
            totalGames: d.totalGames || 0,
            totalWins: d.totalWins || 0,
            totalLosses: d.totalLosses || 0,
            totalProfit: d.totalProfit || 0
        };
    },

    addGame(won, profit) {
        const d = this.load();
        d.totalGames = (d.totalGames || 0) + 1;
        if (won) d.totalWins = (d.totalWins || 0) + 1;
        else d.totalLosses = (d.totalLosses || 0) + 1;
        d.totalProfit = (d.totalProfit || 0) + profit;
        localStorage.setItem(this.KEY, JSON.stringify(d));
    },

    reset() {
        localStorage.removeItem(this.KEY);
    }
};