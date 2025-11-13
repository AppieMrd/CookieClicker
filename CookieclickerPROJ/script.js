class Cookie {
    constructor() {
        this.baseValue = 1; // Basis waarde per klik
        this.clickMultiplier = 1; // Multiplier voor klik waarde
    }

    // Methode: Bereken de waarde van één klik
    click() {
        return Math.floor(this.baseValue * this.clickMultiplier);
    }

    // Methode: Verkrijg de huidige klik waarde
    getValue() {
        return this.click();
    }

    // Methode: Verhoog de klik multiplier
    increaseMultiplier(amount) {
        this.clickMultiplier += amount;
    }
}

// =============================================================================================
// KLASSE: AutoClicker
// Beschrijving: Representeert een automatische productie-eenheid
// =============================================================================================
class AutoClicker {
    constructor(name, icon, description, baseCost, baseProduction) {
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.baseCost = baseCost;
        this.baseProduction = baseProduction;
        this.owned = 0;
        this.productionMultiplier = 1;
    }

    // Methode: Bereken de huidige kosten (stijgt met aantal gekocht)
    getCost() {
        return Math.floor(this.baseCost * Math.pow(1.15, this.owned));
    }

    // Methode: Koop één eenheid van deze autoclicker
    buy() {
        this.owned++;
    }

    // Methode: Bereken de productie per seconde van deze autoclicker
    produce() {
        return this.baseProduction * this.owned * this.productionMultiplier;
    }

    // Methode: Verhoog de productie multiplier
    increaseProduction(multiplier) {
        this.productionMultiplier *= multiplier;
    }
}

// =============================================================================================
// KLASSE: Upgrade
// Beschrijving: Representeert een upgrade die de productie of klikwaarde verbetert
// =============================================================================================
class Upgrade {
    constructor(name, icon, description, cost, effect, targetType, targetName = null) {
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.cost = cost;
        this.effect = effect; // Effect object: { type: 'multiplier', value: 2 }
        this.targetType = targetType; // 'click', 'autoclicker', of 'global'
        this.targetName = targetName; // Naam van specifieke autoclicker (als van toepassing)
        this.purchased = false;
    }

    // Methode: Koop deze upgrade
    buy() {
        this.purchased = true;
    }

    // Methode: Pas het effect van de upgrade toe
    apply(game) {
        if (this.targetType === 'click') {
            game.cookie.increaseMultiplier(this.effect.value);
        } else if (this.targetType === 'autoclicker' && this.targetName) {
            const autoclicker = game.autoClickers.find(ac => ac.name === this.targetName);
            if (autoclicker) {
                autoclicker.increaseProduction(this.effect.value);
            }
        } else if (this.targetType === 'global') {
            game.autoClickers.forEach(ac => {
                ac.increaseProduction(this.effect.value);
            });
        }
    }
}

// =============================================================================================
// KLASSE: ThemeManager
// Beschrijving: Beheert het thema (licht/donker) van het spel
// =============================================================================================
class ThemeManager {
    constructor() {
        this.currentTheme = 'light'; // 'light' of 'dark'
    }

    // Methode: Wissel tussen licht en donker thema
    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.apply();
    }

    // Methode: Pas het huidige thema toe op de pagina
    apply() {
        if (this.currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    // Methode: Laad thema vanuit opgeslagen data
    load(theme) {
        this.currentTheme = theme;
        this.apply();
    }
}

// =============================================================================================
// KLASSE: EventManager
// Beschrijving: Beheert speciale gebeurtenissen zoals golden cookies
// =============================================================================================
class EventManager {
    constructor(game) {
        this.game = game;
        this.goldenCookieActive = false;
        this.nextGoldenCookieTime = this.getRandomInterval();
        this.goldenCookieElement = document.getElementById('golden-cookie');
    }

    // Methode: Bereken een willekeurig interval voor de volgende golden cookie
    getRandomInterval() {
        return Date.now() + (30000 + Math.random() * 60000); // 30-90 seconden
    }

    // Methode: Controleer of er een golden cookie gespawned moet worden
    update() {
        if (!this.goldenCookieActive && Date.now() > this.nextGoldenCookieTime) {
            this.spawnGoldenCookie();
        }
    }

    // Methode: Spawn een golden cookie op een willekeurige locatie
    spawnGoldenCookie() {
        this.goldenCookieActive = true;
        
        // Willekeurige positie
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 100);
        
        this.goldenCookieElement.style.left = x + 'px';
        this.goldenCookieElement.style.top = y + 'px';
        this.goldenCookieElement.style.display = 'block';
        
        // Verdwijn na 10 seconden
        setTimeout(() => {
            if (this.goldenCookieActive) {
                this.removeGoldenCookie();
            }
        }, 10000);
    }

    // Methode: Verwijder de golden cookie
    removeGoldenCookie() {
        this.goldenCookieActive = false;
        this.goldenCookieElement.style.display = 'none';
        this.nextGoldenCookieTime = this.getRandomInterval();
    }

    // Methode: Klik op golden cookie - geef bonus
    clickGoldenCookie() {
        if (this.goldenCookieActive) {
            // Geef 30 seconden productie als bonus
            const bonus = Math.floor(this.game.calculateCPS() * 30);
            this.game.cookies += bonus;
            this.game.showNotification(`Golden Cookie! +${this.formatNumber(bonus)} cookies!`);
            this.removeGoldenCookie();
        }
    }

    // Methode: Formatteer groot getal
    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return Math.floor(num).toString();
    }
}

// =============================================================================================
// KLASSE: SaveManager
// Beschrijving: Beheert het opslaan en laden van game data in localStorage
// =============================================================================================
class SaveManager {
    constructor() {
        this.saveKey = 'cookieClickerSave';
    }

    // Methode: Sla game data op in localStorage
    save(game) {
        const saveData = {
            cookies: game.cookies,
            totalClicks: game.totalClicks,
            autoClickers: game.autoClickers.map(ac => ({
                name: ac.name,
                owned: ac.owned,
                productionMultiplier: ac.productionMultiplier
            })),
            upgrades: game.upgrades.map(u => ({
                name: u.name,
                purchased: u.purchased
            })),
            cookieClickMultiplier: game.cookie.clickMultiplier,
            theme: game.themeManager.currentTheme
        };
        
        localStorage.setItem(this.saveKey, JSON.stringify(saveData));
        console.log('Game opgeslagen!');
    }

    // Methode: Laad game data uit localStorage
    load() {
        const saveData = localStorage.getItem(this.saveKey);
        if (saveData) {
            return JSON.parse(saveData);
        }
        return null;
    }

    // Methode: Reset de save data
    reset() {
        localStorage.removeItem(this.saveKey);
        console.log('Save data gereset!');
    }
}

// =============================================================================================
// KLASSE: Game
// Beschrijving: Hoofd game controller die alles beheert
// =============================================================================================
class Game {
    constructor() {
        // Game state
        this.cookies = 0;
        this.totalClicks = 0;
        this.lastUpdateTime = Date.now();
        this.lastSaveTime = Date.now();
        
        // Initialiseer componenten
        this.cookie = new Cookie();
        this.themeManager = new ThemeManager();
        this.saveManager = new SaveManager();
        
        // Initialiseer AutoClickers (8 stuks)
        this.autoClickers = [
            new AutoClicker('Pointer', '👆', 'Een simpele aanwijzer die klikt', 15, 0.1),
            new AutoClicker('Grandma', '👵', 'Een lieve oma die cookies bakt', 100, 1),
            new AutoClicker('Farm', '🌾', 'Een boerderij vol ingrediënten', 1100, 8),
            new AutoClicker('Factory', '🏭', 'Massa productie van cookies', 12000, 47),
            new AutoClicker('Mine', '⛏️', 'Delft chocolade uit de grond', 130000, 260),
            new AutoClicker('Bank', '🏦', 'Investeert in cookie futures', 1400000, 1400),
            new AutoClicker('Temple', '⛩️', 'Roept cookie goden aan', 20000000, 7800),
            new AutoClicker('Wizard Tower', '🧙', 'Tovert cookies uit de lucht', 330000000, 44000)
        ];
        
        // Initialiseer Upgrades (meer dan 5, met creatieve namen)
        this.upgrades = [
            new Upgrade('Golden Mixer', '🌟', 'Verdubbelt je klik kracht', 500, {type: 'multiplier', value: 1}, 'click'),
            new Upgrade('Quantum Oven', '⚛️', 'Pointers zijn 2x zo snel', 2000, {type: 'multiplier', value: 2}, 'autoclicker', 'Pointer'),
            new Upgrade('Cosmic Sugar', '🌌', 'Grandmas bakken 2x sneller', 10000, {type: 'multiplier', value: 2}, 'autoclicker', 'Grandma'),
            new Upgrade('Mega Farm', '🚜', 'Farms produceren 2x meer', 50000, {type: 'multiplier', value: 2}, 'autoclicker', 'Farm'),
            new Upgrade('Turbo Factory', '⚡', 'Factories werken 2x sneller', 250000, {type: 'multiplier', value: 2}, 'autoclicker', 'Factory'),
            new Upgrade('Diamond Pickaxe', '💎', 'Mines delven 2x meer', 1300000, {type: 'multiplier', value: 2}, 'autoclicker', 'Mine'),
            new Upgrade('Cookie Economics', '📈', 'Banks verdienen 2x meer rente', 7000000, {type: 'multiplier', value: 2}, 'autoclicker', 'Bank'),
            new Upgrade('Divine Blessing', '✨', 'Temples krijgen extra zegeningen', 100000000, {type: 'multiplier', value: 2}, 'autoclicker', 'Temple'),
            new Upgrade('Ancient Spell', '📜', 'Wizard Towers 2x krachtiger', 1650000000, {type: 'multiplier', value: 2}, 'autoclicker', 'Wizard Tower'),
            new Upgrade('Universal Boost', '🌍', 'ALLES produceert 1.5x meer', 5000000, {type: 'multiplier', value: 1.5}, 'global')
        ];
        
        // Initialiseer EventManager
        this.eventManager = new EventManager(this);
    }

    // Methode: Initialiseer het spel
    init() {
        console.log('Game wordt geïnitialiseerd...');
        
        // Laad opgeslagen data
        this.loadGame();
        
        // Setup UI event listeners
        this.setupEventListeners();
        
        // Render initiële UI
        this.renderAutoClickers();
        this.renderUpgrades();
        this.updateDisplay();
        
        // Start game loop
        this.startGameLoop();
        
        console.log('Game geïnitialiseerd!');
    }

    // Methode: Setup event listeners voor UI elementen
    setupEventListeners() {
        // Cookie button
        const cookieButton = document.getElementById('cookie-button');
        cookieButton.addEventListener('click', () => this.handleCookieClick());
        
        // Theme toggle
        const themeButton = document.getElementById('theme-toggle');
        themeButton.addEventListener('click', () => {
            this.themeManager.toggle();
            this.saveGame();
        });
        
        // Save button
        const saveButton = document.getElementById('save-button');
        saveButton.addEventListener('click', () => {
            this.saveGame();
            this.showNotification('Spel opgeslagen!');
        });
        
        // Reset button
        const resetButton = document.getElementById('reset-button');
        resetButton.addEventListener('click', () => {
            if (confirm('Weet je zeker dat je het spel wilt resetten? Al je voortgang gaat verloren!')) {
                this.resetGame();
            }
        });
        
        // Golden cookie
        const goldenCookie = document.getElementById('golden-cookie');
        goldenCookie.addEventListener('click', () => {
            this.eventManager.clickGoldenCookie();
        });
    }

    // Methode: Behandel cookie klik
    handleCookieClick() {
        const value = this.cookie.click();
        this.cookies += value;
        this.totalClicks++;
        
        // Animatie
        this.animateCookieClick();
        this.createClickParticle(value);
        
        this.updateDisplay();
    }

    // Methode: Animeer cookie klik
    animateCookieClick() {
        const cookieButton = document.getElementById('cookie-button');
        cookieButton.classList.add('clicked');
        setTimeout(() => {
            cookieButton.classList.remove('clicked');
        }, 200);
    }

    // Methode: Creëer een click particle (visueel effect)
    createClickParticle(value) {
        const container = document.getElementById('click-particles');
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = '+' + value;
        
        // Willekeurige positie rond de cookie
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        particle.style.left = `calc(50% + ${x}px)`;
        particle.style.top = `calc(50% + ${y}px)`;
        
        container.appendChild(particle);
        
        // Verwijder na animatie
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    // Methode: Bereken cookies per seconde
    calculateCPS() {
        let total = 0;
        this.autoClickers.forEach(ac => {
            total += ac.produce();
        });
        return total;
    }

    // Methode: Update game state (game loop)
    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000; // In seconden
        
        // Voeg productie toe
        const production = this.calculateCPS() * deltaTime;
        this.cookies += production;
        
        // Update event manager
        this.eventManager.update();
        
        // Auto-save elke 5 seconden
        if (now - this.lastSaveTime > 5000) {
            this.saveGame();
            this.lastSaveTime = now;
        }
        
        this.lastUpdateTime = now;
        this.updateDisplay();
    }

    // Methode: Update UI display
    updateDisplay() {
        // Update cookie count
        document.getElementById('cookie-display').textContent = this.formatNumber(this.cookies);
        
        // Update CPS
        document.getElementById('cps-display').textContent = this.formatNumber(this.calculateCPS());
        
        // Update autoclicker buttons
        this.autoClickers.forEach((ac, index) => {
            const button = document.querySelector(`[data-autoclicker-index="${index}"]`);
            if (button) {
                const canAfford = this.cookies >= ac.getCost();
                button.classList.toggle('disabled', !canAfford);
                button.querySelector('.item-cost').textContent = this.formatNumber(ac.getCost()) + ' 🍪';
                button.querySelector('.item-owned').textContent = ac.owned;
            }
        });
        
        // Update upgrade buttons
        this.upgrades.forEach((upgrade, index) => {
            const button = document.querySelector(`[data-upgrade-index="${index}"]`);
            if (button && !upgrade.purchased) {
                const canAfford = this.cookies >= upgrade.cost;
                button.classList.toggle('disabled', !canAfford);
            }
        });
        
        // Update inventory
        this.renderInventory();
    }

    // Methode: Render autoclickers in de UI
    renderAutoClickers() {
        const container = document.getElementById('autoclickers-container');
        container.innerHTML = '';
        
        this.autoClickers.forEach((ac, index) => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.setAttribute('data-autoclicker-index', index);
            card.innerHTML = `
                <div class="item-header">
                    <span class="item-icon">${ac.icon}</span>
                    <span class="item-name">${ac.name}</span>
                </div>
                <div class="item-description">${ac.description}</div>
                <div class="item-stats">
                    <span class="item-cost">${this.formatNumber(ac.getCost())} 🍪</span>
                    <span class="item-owned">${ac.owned}</span>
                </div>
            `;
            
            card.addEventListener('click', () => this.buyAutoClicker(index));
            container.appendChild(card);
        });
    }

    // Methode: Render upgrades in de UI
    renderUpgrades() {
        const container = document.getElementById('upgrades-container');
        container.innerHTML = '';
        
        this.upgrades.forEach((upgrade, index) => {
            if (upgrade.purchased) {
                const card = document.createElement('div');
                card.className = 'item-card purchased';
                card.setAttribute('data-upgrade-index', index);
                card.innerHTML = `
                    <div class="item-header">
                        <span class="item-icon">${upgrade.icon}</span>
                        <span class="item-name">${upgrade.name}</span>
                    </div>
                    <div class="item-description">${upgrade.description}</div>
                    <div class="item-stats">
                        <span class="item-cost" style="color: green;">Gekocht ✓</span>
                    </div>
                `;
                container.appendChild(card);
            } else {
                const card = document.createElement('div');
                card.className = 'item-card';
                card.setAttribute('data-upgrade-index', index);
                card.innerHTML = `
                    <div class="item-header">
                        <span class="item-icon">${upgrade.icon}</span>
                        <span class="item-name">${upgrade.name}</span>
                    </div>
                    <div class="item-description">${upgrade.description}</div>
                    <div class="item-stats">
                        <span class="item-cost">${this.formatNumber(upgrade.cost)} 🍪</span>
                    </div>
                `;
                
                card.addEventListener('click', () => this.buyUpgrade(index));
                container.appendChild(card);
            }
        });
    }

    // Methode: Render inventaris
    renderInventory() {
        const container = document.getElementById('inventory-container');
        container.innerHTML = '';
        
        this.autoClickers.forEach(ac => {
            if (ac.owned > 0) {
                const item = document.createElement('div');
                item.className = 'inventory-item';
                item.innerHTML = `
                    <span class="name">${ac.icon} ${ac.name}</span>
                    <span class="count">${ac.owned}</span>
                `;
                container.appendChild(item);
            }
        });
        
        if (container.children.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nog geen items gekocht</p>';
        }
    }

    // Methode: Koop een autoclicker
    buyAutoClicker(index) {
        const ac = this.autoClickers[index];
        const cost = ac.getCost();
        
        if (this.cookies >= cost) {
            this.cookies -= cost;
            ac.buy();
            this.showNotification(`${ac.name} gekocht!`);
            this.updateDisplay();
            this.renderAutoClickers(); // Re-render om kosten te updaten
        }
    }

    // Methode: Koop een upgrade
    buyUpgrade(index) {
        const upgrade = this.upgrades[index];
        
        if (!upgrade.purchased && this.cookies >= upgrade.cost) {
            this.cookies -= upgrade.cost;
            upgrade.buy();
            upgrade.apply(this);
            this.showNotification(`${upgrade.name} gekocht!`);
            this.updateDisplay();
            this.renderUpgrades();
        }
    }

    // Methode: Toon notificatie
    showNotification(message) {
        const toast = document.getElementById('notification-toast');
        toast.textContent = message;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Methode: Formatteer groot getal voor display
    formatNumber(num) {
        if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T';
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return Math.floor(num).toString();
    }

    // Methode: Start de game loop
    startGameLoop() {
        setInterval(() => {
            this.update();
        }, 100); // Update elke 100ms
    }

    // Methode: Sla het spel op
    saveGame() {
        this.saveManager.save(this);
    }

    // Methode: Laad het spel
    loadGame() {
        const saveData = this.saveManager.load();
        if (saveData) {
            console.log('Save data gevonden, laden...');
            
            this.cookies = saveData.cookies || 0;
            this.totalClicks = saveData.totalClicks || 0;
            
            // Laad autoclickers
            if (saveData.autoClickers) {
                saveData.autoClickers.forEach(savedAC => {
                    const ac = this.autoClickers.find(a => a.name === savedAC.name);
                    if (ac) {
                        ac.owned = savedAC.owned;
                        ac.productionMultiplier = savedAC.productionMultiplier;
                    }
                });
            }
            
            // Laad upgrades
            if (saveData.upgrades) {
                saveData.upgrades.forEach(savedUpgrade => {
                    const upgrade = this.upgrades.find(u => u.name === savedUpgrade.name);
                    if (upgrade && savedUpgrade.purchased) {
                        upgrade.purchased = true;
                        upgrade.apply(this);
                    }
                });
            }
            
            // Laad cookie click multiplier
            if (saveData.cookieClickMultiplier) {
                this.cookie.clickMultiplier = saveData.cookieClickMultiplier;
            }
            
            // Laad thema
            if (saveData.theme) {
                this.themeManager.load(saveData.theme);
            }
            
            console.log('Save data geladen!');
        } else {
            console.log('Geen save data gevonden, nieuw spel starten');
        }
    }

    // Methode: Reset het spel
    resetGame() {
        this.saveManager.reset();
        location.reload();
    }
}

let game;

// Wacht tot de pagina volledig geladen is
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM geladen, game starten...');
    game = new Game();
    game.init();
    
    // Maak game object globaal beschikbaar voor tests
    window.game = game;
    console.log('Game object beschikbaar als "game" in console voor testing');
});

