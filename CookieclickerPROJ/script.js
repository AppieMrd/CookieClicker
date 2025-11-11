let totalCookies = 0;
let clicksPerClick = 1;
let clickerCost = 10;
let clickerCount = 0;
let upgrades = [];

function updateCookies() {
    totalCookies += clicksPerClick;
    document.getElementById("cookie-display").textContent = totalCookies;
}

function buyClicker() {
    if (totalCookies >= clickerCost) {
        totalCookies -= clickerCost;
        clickerCount++;
        clickerCost *= 10;
        document.getElementById("clicker-price").textContent = clickerCost;
        if (clickerCount % 100 === 0) {
            upgradeClicker();
        }
    }
    updateCookies();
}

function upgradeClicker() {
    const upgradeOptions = {
        'Easy Clicking': function() {
            clicksPerClick++;
        },
        'Double Clicking': function() {
            clicksPerClick *= 2;
        },
        'Triple Clicking': function() {
            clicksPerClick *= 3;
        },
        // zet nog meer upgrades hier, maar kijk of je naar andere buttons kan veranderen, dus upgrades als buttons app mij als je niet begrijpt wat ik bedoel.
    };
    const upgradeKeys = Object.keys(upgradeOptions);
    const randomUpgrade = upgradeKeys[Math.floor(Math.random() * upgradeKeys.length)];
    upgrades.push(randomUpgrade);
    upgradeOptions[randomUpgrade]();
    document.getElementById("upgrades").textContent = upgrades.join(', ');
}

document.getElementById("clicker-button").addEventListener("click", buyClicker);