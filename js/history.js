/* ==========================================
   CRASH HISTORY
========================================== */

const History = {

    maxItems: 30,
    items: [],

    init() {
        this.bar = $("#historyBar");
        this.bar.innerHTML = "";

        const saved = Store.getHistory();
        if (saved && saved.length > 0) {
            saved.forEach(item => {
                this.add(item.multiplier, false);
            });
        } else {
            for (let i = 0; i < 10; i++) {
                let val = Utils.random(1.00, 15.00);
                this.add(val, false);
            }
            this.saveToStore();
        }

        this.scrollToEnd();
        this.setupScrollButtons();
    },

    add(multiplier, animate = true) {

        const item = {
            multiplier: parseFloat(multiplier.toFixed(2)),
            isRed: multiplier < 2.0,
            isBlue: multiplier >= 10.0
        };

        this.items.unshift(item);

        if (this.items.length > this.maxItems) {
            this.items.pop();
        }

        const el = document.createElement("div");
        let colorClass = "green";
        if (item.isBlue) colorClass = "blue";
        else if (item.isRed) colorClass = "red";

        el.className = "history-item " + colorClass;
        el.textContent = item.multiplier.toFixed(2) + "x";

        if (animate) {
            el.classList.add("fade-in");
        }

        this.bar.prepend(el);

        if (this.bar.children.length > this.maxItems) {
            this.bar.removeChild(this.bar.lastChild);
        }

        if (animate) {
            this.scrollToEnd();
            this.saveToStore();
        }
    },

    scrollToEnd() {
        requestAnimationFrame(() => {
            this.bar.scrollLeft = 0;
        });
    },

    setupScrollButtons() {
        const leftBtn = document.getElementById("histLeft");
        const rightBtn = document.getElementById("histRight");

        if (leftBtn) {
            leftBtn.addEventListener("click", () => {
                this.bar.scrollLeft -= 200;
            });
        }

        if (rightBtn) {
            rightBtn.addEventListener("click", () => {
                this.bar.scrollLeft += 200;
            });
        }
    },

    saveToStore() {
        Store.setHistory(this.items.slice(0, this.maxItems));
    },

    clear() {
        this.bar.innerHTML = "";
        this.items = [];
        Store.setHistory([]);
    }
};
