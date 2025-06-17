// === VARIABLES GLOBALES ===
let currentTheme = localStorage.getItem('theme') || 'dark';
let soundEnabled = localStorage.getItem('sound') !== 'false';
let particles = [];
let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;
let visitStartTime = Date.now();
let konamiSequence = [];
let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
let gameState = { running: false, score: 0, snake: [], food: {}, direction: 'right' };

// === INITIALISATION ===
function initPortfolio() {
    console.log('🚀 Initialisation du portfolio...');
    
    // Thème
    initializeTheme();
    
    // Particules
    initializeParticles();
    
    // Curseur personnalisé
    initializeCursor();
    
    // Animations d'entrée
    startAnimations();
    
    // Analytics
    initializeAnalytics();
    
    // Events listeners
    setupEventListeners();
    
    // Konami code
    initializeKonamiCode();
    
    // Chat automatique
    setTimeout(() => {
        showNotification('💬', 'Besoin d\'aide ? Le chat est disponible !');
    }, 10000);
    
    console.log('✅ Portfolio initialisé avec succès !');
}

// === THÈME ===
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
    playSound('click');
    showNotification('🎨', `Thème ${currentTheme === 'dark' ? 'sombre' : 'clair'} activé`);
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
    }
}

// === SONS ===
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('sound', soundEnabled);
    updateSoundIcon();
    
    if (soundEnabled) {
        playSound('enable');
        showNotification('🔊', 'Sons activés');
    } else {
        showNotification('🔇', 'Sons désactivés');
    }
}

function updateSoundIcon() {
    const soundIcon = document.querySelector('.sound-icon');
    const soundToggle = document.querySelector('.sound-toggle');
    
    if (soundIcon && soundToggle) {
        // Changer directement le contenu de l'icône
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
        
        // Optionnel : ajouter/enlever une classe pour le style
        soundToggle.classList.toggle('muted', !soundEnabled);
    }
}

function updateSoundIcon() {
    const soundToggle = document.querySelector('.sound-toggle');
    if (soundToggle) {
        soundToggle.classList.toggle('muted', !soundEnabled);
    }
}

function playSound(type = 'click') {
    if (!soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const sounds = {
            click: { frequency: 800, duration: 0.1 },
            hover: { frequency: 600, duration: 0.05 },
            success: { frequency: 1000, duration: 0.2 },
            error: { frequency: 300, duration: 0.3 },
            enable: { frequency: 1200, duration: 0.15 },
            achievement: { frequency: 1500, duration: 0.3 }
        };
        
        const sound = sounds[type] || sounds.click;
        
        oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (error) {
        console.log('Audio context non disponible');
    }
}

// === PARTICULES ===
function initializeParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    // Créer les particules
    for (let i = 0; i < 30; i++) {
        createParticle();
    }
    
    // Animation des particules
    animateParticles();
}

function createParticle() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(particle);
    particles.push(particle);
}

function animateParticles() {
    particles.forEach((particle, index) => {
        if (Math.random() < 0.01) {
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
        }
    });
    
    requestAnimationFrame(animateParticles);
}

// === CURSEUR PERSONNALISÉ ===
function initializeCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const trail = document.querySelector('.cursor-trail');
    
    if (!cursor || !trail) return;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    // Animation de la traînée
    function updateTrail() {
        const dx = mouseX - trailX;
        const dy = mouseY - trailY;
        
        trailX += dx * 0.1;
        trailY += dy * 0.1;
        
        trail.style.left = trailX + 'px';
        trail.style.top = trailY + 'px';
        
        requestAnimationFrame(updateTrail);
    }
    updateTrail();
    
    // Effets sur les éléments interactifs
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .tech-tag, .quick-btn');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            trail.style.transform = 'scale(2)';
            playSound('hover');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            trail.style.transform = 'scale(1)';
        });
    });
}

// === ANIMATIONS ===
function startAnimations() {
    // Animation des statistiques (compteur)
    animateCounters();
    
    // Animation des barres de compétences
    animateSkillBars();
    
    // Animation d'apparition des éléments
    animateElements();
    
    // Compteur pour le projet à venir
    startCountdown();
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 secondes
        const start = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);
            
            counter.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        }
        
        // Démarrer avec un délai
        setTimeout(() => {
            requestAnimationFrame(updateCounter);
        }, Math.random() * 500);
    });
}

function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress[data-width]');
    
    skillBars.forEach((bar, index) => {
        setTimeout(() => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        }, index * 200);
    });
}

function animateElements() {
    const elements = document.querySelectorAll('.project-card, .skills-section, .profile-header');
    
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function startCountdown() {
    // Compte à rebours fictif vers le prochain projet
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30); // 30 jours
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        
        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000 * 60); // Mise à jour chaque minute
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    // Hover effects sur les cartes
    const cards = document.querySelectorAll('.project-card, .analytics-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Ripple effect sur les boutons
    const buttons = document.querySelectorAll('.action-button, .contact-button, .game-btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Escape pour fermer les modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// === KONAMI CODE ===
function initializeKonamiCode() {
    document.addEventListener('keydown', (e) => {
        konamiSequence.push(e.keyCode);
        
        if (konamiSequence.length > konamiCode.length) {
            konamiSequence.shift();
        }
        
        if (JSON.stringify(konamiSequence) === JSON.stringify(konamiCode)) {
            triggerEasterEgg();
            konamiSequence = [];
        }
    });
}

function checkKonami() {
    showNotification('🎮', 'Indice: ↑↑↓↓←→←→BA');
}

function triggerEasterEgg() {
    playSound('achievement');
    showNotification('🎊', 'Konami Code activé ! Matrix mode !');
    
    // Effet Matrix
    document.body.style.filter = 'hue-rotate(120deg)';
    
    // Créer plus de particules
    for (let i = 0; i < 50; i++) {
        createParticle();
    }
    
    // Effet de secousse
    document.body.classList.add('shake-animation');
    
    setTimeout(() => {
        document.body.style.filter = '';
        document.body.classList.remove('shake-animation');
    }, 5000);
}

// === ANALYTICS ===
function initializeAnalytics() {
    // Détection du dispositif
    const deviceType = getDeviceType();
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    
    // Simulation de localisation (en production, utilisez une API géolocalisation)
    const location = 'France'; // ou utiliser navigator.geolocation
    
    // Stockage des données
    const analytics = {
        deviceType,
        userAgent,
        language,
        location,
        visitTime: new Date().toISOString(),
        sessionId: generateSessionId()
    };
    
    localStorage.setItem('portfolioAnalytics', JSON.stringify(analytics));
    
    // Mise à jour du compteur de visiteurs
    updateVisitorCount();
}

function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'Mobile';
    if (width < 1024) return 'Tablette';
    return 'Desktop';
}

function generateSessionId() {
    return Math.random().toString(36).substr(2, 9);
}

function updateVisitorCount() {
    let count = parseInt(localStorage.getItem('visitorCount') || '0');
    count++;
    localStorage.setItem('visitorCount', count.toString());
}

function getTimeOnSite() {
    const elapsed = Date.now() - visitStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// === FONCTIONS UTILITAIRES ===
function showNotification(icon, message, duration = 3000) {
    const notification = document.getElementById('notification');
    const iconEl = notification.querySelector('.notification-icon');
    const textEl = notification.querySelector('.notification-text');
    
    iconEl.textContent = icon;
    textEl.textContent = message;
    
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, duration);
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// === FONCTIONS SPÉCIFIQUES ===

// CV Download
function downloadCV() {
    playSound('click');
    // Simulation du téléchargement
    showNotification('📄', 'Téléchargement du CV...');
    
    // En production, remplacer par le vrai lien
    const link = document.createElement('a');
    link.href = './files/CV_Morgan_VERSPEEK.pdf';
    link.download = 'CV_Morgan_VERSPEEK.pdf';
    link.click();
}

// Terminal
function openTerminal() {
    playSound('click');
    const modal = document.getElementById('terminalModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    const input = document.getElementById('terminalInput');
    input.focus();
    
    // Ajouter les event listeners pour le terminal
    setupTerminalCommands();
}

function closeTerminal() {
    const modal = document.getElementById('terminalModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function setupTerminalCommands() {
    const input = document.getElementById('terminalInput');
    const output = document.getElementById('terminalOutput');
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            processTerminalCommand(command, output);
            input.value = '';
        }
    });
}

function processTerminalCommand(command, output) {
    // Si la commande est vide, ne rien faire
    if (command === '') {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span style="color: #00ff00;">morgan@portfolio:~$</span> `;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
        return;
    }
    
    const responses = {
        'help': `Commandes disponibles:
- about: À propos de moi
- skills: Mes compétences
- projects: Mes projets
- contact: Informations de contact
- clear: Effacer l'écran
- date: Date actuelle
- whoami: Qui suis-je
- matrix: Mode Matrix
- joke: Blague aléatoire`,
        'about': 'Morgan VERSPEEK - Développeur Web passionné de 22 ans basé à Tourcoing.',
        'skills': 'HTML/CSS: 75% | JavaScript: 60% | PHP: 55% | SQL: 65%',
        'projects': '1. The Kraken - Bot Discord avancé\n2. Portfolio Interactif\n3. Projets à venir...',
        'contact': 'Email: contact@morgan-dev.com | Discord: @morgan#1234',
        'clear': 'CLEAR_SCREEN',
        'date': new Date().toLocaleString('fr-FR'),
        'whoami': 'morgan',
        'matrix': 'MATRIX_MODE',
        'joke': getRandomJoke(),
        'ls': 'projects/  skills/  contact.txt  about.md',
        'pwd': '/home/morgan/portfolio',
        'echo': 'Usage: echo [message]',
        'cat': 'Usage: cat [filename] - Essayez: cat about.md',
        'cat about.md': 'Développeur passionné, toujours en quête de nouveaux défis techniques !',
        'neofetch': `
    ╭─────────────────────────────╮
    │  morgan@portfolio           │
    │  ─────────────────────────  │
    │  OS: Web Portfolio 2.0      │
    │  Host: GitHub Pages         │
    │  Kernel: JavaScript ES6+    │
    │  Uptime: ${getTimeOnSite()}             │
    │  Packages: 3 projects       │
    │  Shell: portfolio-bash      │
    │  Theme: Dark Red Matrix     │
    ╰─────────────────────────────╯`
    };
    
    // Afficher la commande tapée
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span style="color: #00ff00;">morgan@portfolio:~$</span> ${command}`;
    output.appendChild(line);
    
    // Traiter la commande
    const response = document.createElement('div');
    response.className = 'terminal-line';
    
    // Commandes spéciales
    if (command === 'clear') {
        output.innerHTML = '';
        return;
    }
    
    if (command === 'matrix') {
        triggerEasterEgg();
        response.textContent = 'Matrix mode activé ! 🕶️';
        response.style.color = '#00ff00';
    } else if (command.startsWith('echo ')) {
        // Commande echo
        const message = command.substring(5); // Enlever "echo "
        response.textContent = message;
        response.style.color = '#ffffff';
    } else if (responses[command]) {
        // Commande trouvée dans les réponses
        response.innerHTML = responses[command].replace(/\n/g, '<br>');
        response.style.color = '#e0e0e0';
    } else {
        // Commande non trouvée
        response.innerHTML = `<span style="color: #ff6b6b;">bash: ${command}: command not found</span><br><span style="color: #888;">Tapez 'help' pour voir les commandes disponibles.</span>`;
    }
    
    output.appendChild(response);
    output.scrollTop = output.scrollHeight;
}

// Fonction utilitaire pour obtenir le temps de session
function getTimeOnSite() {
    const elapsed = Date.now() - visitStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getRandomJoke() {
    const jokes = [
        "Pourquoi les développeurs préfèrent-ils le mode sombre ? Parce que la lumière attire les bugs !",
        "Il y a 10 types de personnes : celles qui comprennent le binaire et les autres.",
        "Un SQL query entre dans un bar, s'approche de deux tables et demande : 'Je peux vous JOIN ?'",
        "Pourquoi les programmeurs n'aiment pas la nature ? Trop de bugs !",
        "Comment appelle-t-on un développeur qui ne fait jamais d'erreur ? Un menteur !"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
}

// Game (Snake)
function openGame() {
    playSound('click');
    const modal = document.getElementById('gameModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    initializeGame();
}

function closeGame() {
    const modal = document.getElementById('gameModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    gameState.running = false;
}

function initializeGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Initialiser le jeu Snake
    gameState = {
        running: false,
        score: 0,
        snake: [{x: 200, y: 200}],
        food: {x: 100, y: 100},
        direction: 'right',
        gridSize: 20
    };
    
    // Event listeners pour les contrôles
    document.addEventListener('keydown', handleGameInput);
    
    drawGame(ctx);
}

function startGame() {
    if (gameState.running) return;
    
    gameState.running = true;
    gameState.score = 0;
    gameState.snake = [{x: 200, y: 200}];
    gameState.direction = 'right';
    generateFood();
    
    document.getElementById('startGameBtn').textContent = 'Redémarrer';
    playSound('success');
    
    gameLoop();
}

function pauseGame() {
    gameState.running = !gameState.running;
    const btn = document.getElementById('pauseGameBtn');
    btn.textContent = gameState.running ? 'Pause' : 'Reprendre';
    
    if (gameState.running) {
        gameLoop();
    }
}

function handleGameInput(e) {
    if (!gameState.running) return;
    
    const directions = {
        37: 'left',   // Flèche gauche
        38: 'up',     // Flèche haut
        39: 'right',  // Flèche droite
        40: 'down'    // Flèche bas
    };
    
    const newDirection = directions[e.keyCode];
    if (newDirection && isValidDirection(newDirection)) {
        gameState.direction = newDirection;
    }
}

function isValidDirection(newDirection) {
    const opposites = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };
    
    return opposites[gameState.direction] !== newDirection;
}

function gameLoop() {
    if (!gameState.running) return;
    
    updateGame();
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    drawGame(ctx);
    
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 150); // Vitesse du jeu
}

function updateGame() {
    const head = {...gameState.snake[0]};
    
    // Mouvement
    switch (gameState.direction) {
        case 'up': head.y -= gameState.gridSize; break;
        case 'down': head.y += gameState.gridSize; break;
        case 'left': head.x -= gameState.gridSize; break;
        case 'right': head.x += gameState.gridSize; break;
    }
    
    // Collision avec les murs
    if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
        gameOver();
        return;
    }
    
    // Collision avec soi-même
    if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    gameState.snake.unshift(head);
    
    // Vérifier si la nourriture est mangée
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        document.getElementById('gameScore').textContent = gameState.score;
        generateFood();
        playSound('success');
    } else {
        gameState.snake.pop();
    }
}

function drawGame(ctx) {
    // Effacer le canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 400, 400);
    
    // Dessiner le serpent
    ctx.fillStyle = '#ff0000';
    gameState.snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, gameState.gridSize - 2, gameState.gridSize - 2);
    });
    
    // Dessiner la nourriture
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(gameState.food.x, gameState.food.y, gameState.gridSize - 2, gameState.gridSize - 2);
}

function generateFood() {
    let foodPosition;
    
    do {
        foodPosition = {
            x: Math.floor(Math.random() * 20) * gameState.gridSize,
            y: Math.floor(Math.random() * 20) * gameState.gridSize
        };
    } while (gameState.snake.some(segment => 
        segment.x === foodPosition.x && segment.y === foodPosition.y
    ));
    
    gameState.food = foodPosition;
}

function gameOver() {
    gameState.running = false;
    playSound('error');
    showNotification('🐍', `Game Over! Score: ${gameState.score}`);
    document.getElementById('startGameBtn').textContent = 'Redémarrer';
}

// Analytics Modal
function showAnalytics() {
    playSound('click');
    const modal = document.getElementById('analyticsModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Mise à jour des données
    const analytics = JSON.parse(localStorage.getItem('portfolioAnalytics') || '{}');
    const visitorCount = localStorage.getItem('visitorCount') || '1';
    
    document.getElementById('visitorCount').textContent = visitorCount;
    document.getElementById('deviceType').textContent = analytics.deviceType || 'Inconnu';
    document.getElementById('userLocation').textContent = analytics.location || 'France';
    document.getElementById('timeOnSite').textContent = getTimeOnSite();
    
    // Mettre à jour le temps en temps réel
    const timeInterval = setInterval(() => {
        if (modal.style.display === 'flex') {
            document.getElementById('timeOnSite').textContent = getTimeOnSite();
        } else {
            clearInterval(timeInterval);
        }
    }, 1000);
}

function closeAnalytics() {
    const modal = document.getElementById('analyticsModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Image Modal
function openImageModal(src, title) {
    playSound('click');
    const modal = document.getElementById('imageModal');
    const img = document.getElementById('modalImage');
    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDescription');
    
    img.src = src;
    titleEl.textContent = title;
    descEl.textContent = 'Interface de commandes du bot avec système de modération et lecteur musical intégré';
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// About Modal
function showAbout() {
    playSound('click');
    showNotification('👤', 'Section À propos en développement...');
}

// Projet actions
function inviteBot() {
    playSound('click');
    showNotification('🤖', 'Contactez-moi pour obtenir le lien d\'invitation !');
}

function showStats() {
    playSound('click');
    showNotification('📊', 'Statistiques du bot : 50+ serveurs, 1000+ utilisateurs actifs');
}

function sharePortfolio() {
    playSound('click');
    
    if (navigator.share) {
        navigator.share({
            title: 'Portfolio Morgan VERSPEEK',
            text: 'Découvrez le portfolio de Morgan, développeur web passionné !',
            url: window.location.href
        });
    } else {
        // Copier dans le presse-papier
        navigator.clipboard.writeText(window.location.href);
        showNotification('📤', 'Lien copié dans le presse-papier !');
    }
}

// Chat Widget
function toggleChat() {
    const widget = document.getElementById('chatWidget');
    widget.classList.toggle('minimized');
    playSound('click');
}

function handleChatEnter(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    playSound('click');
    
    // Simulation de réponse automatique
    setTimeout(() => {
        const response = generateChatResponse(message);
        addChatMessage(response, 'bot');
        playSound('success');
    }, 1000);
}

function addChatMessage(content, type) {
    const messages = document.getElementById('chatMessages');
    const message = document.createElement('div');
    message.className = `message ${type}`;
    
    message.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
    `;
    
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

function generateChatResponse(message) {
    const patterns = [
        { regex: /bonjour|salut|hello|hey/i, response: "👋 Bonjour ! Comment puis-je vous aider ?" },
        { regex: /aide|help/i, response: "🛟 Je suis là pour vous aider. Que cherchez-vous exactement ?" },
        { regex: /présente.*morgan|presentation|qui.*morgan|parle de morgan|présente toi/i, response: "🧑‍💻 Morgan VERSPEEK est un développeur web passionné, spécialisé en JavaScript, Discord.js, et interfaces modernes. Il crée des projets dynamiques comme 'The Kraken'." },
        { regex: /contact/i, response: "📧 Vous pouvez contacter Morgan via le formulaire ou sur Discord : @morgan#1234." },
        { regex: /projet/i, response: "💼 Morgan travaille sur des bots Discord, sites web interactifs et applications modernes." },
        { regex: /prix|tarif|coût|budget/i, response: "💰 Les tarifs varient selon le projet. Contactez-moi pour un devis personnalisé." },
        { regex: /merci|thanks/i, response: "🙏 Avec plaisir ! N’hésitez pas si vous avez d’autres questions." },
        { regex: /au revoir|bye|à bientôt/i, response: "👋 À bientôt ! Merci de votre visite." }
    ];

    const lowerMessage = message.toLowerCase();
    for (const { regex, response } of patterns) {
        if (regex.test(lowerMessage)) {
            return response;
        }
    }

    return "Merci pour votre message ! Pour une réponse détaillée, n'hésitez pas à utiliser le formulaire de contact.";
}


// Style CSS pour l'animation ripple
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(1);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
    initPortfolio();
}
