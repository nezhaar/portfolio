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

// Détection des capacités de l'appareil
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTablet = /iPad|Android|Tablet/i.test(navigator.userAgent) && window.innerWidth >= 768 && window.innerWidth <= 1024;
const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const hasHover = window.matchMedia('(hover: hover)').matches;

// === INITIALISATION ===
function initPortfolio() {
    console.log('🚀 Initialisation du portfolio...');
    console.log('📱 Mobile:', isMobile, '| Tablette:', isTablet, '| Touch:', hasTouch, '| Hover:', hasHover);
    
    // Thème
    initializeTheme();
    
    // Particules (desktop uniquement)
    if (!isMobile && !isTablet && hasHover) {
        initializeParticles();
    }
    
    // Curseur personnalisé (desktop uniquement)
    if (!hasTouch && hasHover) {
        initializeCursor();
    }
    
    // Animations d'entrée
    startAnimations();
    
    // Analytics
    initializeAnalytics();
    
    // Events listeners
    setupEventListeners();
    
    // Konami code
    initializeKonamiCode();
    
    // Sons (vérifier compatibilité)
    initializeAudio();
    
    // Chat automatique (délai plus long sur mobile)
    const chatDelay = isMobile ? 15000 : 10000;
    setTimeout(() => {
        showNotification('💬', 'Besoin d\'aide ? Le chat est disponible !');
    }, chatDelay);
    
    console.log('✅ Portfolio initialisé avec succès !');
}

// === AUDIO ===
function initializeAudio() {
    // Vérifier la compatibilité Web Audio API
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    
    if (!window.AudioContext) {
        console.log('🔇 Web Audio API non supportée');
        soundEnabled = false;
        updateSoundIcon();
    }
    
    // Sur mobile, l'audio nécessite une interaction utilisateur
    if (hasTouch && soundEnabled) {
        document.addEventListener('touchstart', enableAudioOnFirstTouch, { once: true });
        document.addEventListener('click', enableAudioOnFirstTouch, { once: true });
    }
}

function enableAudioOnFirstTouch() {
    if (soundEnabled && window.AudioContext) {
        try {
            const audioContext = new AudioContext();
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            console.log('🔊 Audio activé après interaction utilisateur');
        } catch (error) {
            console.log('❌ Erreur activation audio:', error);
            soundEnabled = false;
            updateSoundIcon();
        }
    }
}

// === THÈME ===
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    // Éviter les conflits avec le thème système sur mobile
    if (hasTouch) {
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = currentTheme === 'dark' ? '#ff0000' : '#ffffff';
        }
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
    
    // Mettre à jour la couleur de thème mobile
    if (hasTouch) {
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = currentTheme === 'dark' ? '#ff0000' : '#ffffff';
        }
    }
    
    playSound('click');
    showNotification('🎨', `Thème ${currentTheme === 'dark' ? 'sombre' : 'clair'} activé`);
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
    }
}

// === SONS - CORRECTION ===
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('sound', soundEnabled);
    updateSoundIcon();
    
    if (soundEnabled) {
        // Test du son sur activation
        if (hasTouch) {
            enableAudioOnFirstTouch();
        }
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
        // Toujours garder la même icône, juste changer l'état visuel
        soundIcon.textContent = '🔊';
        
        // Ajouter ou retirer la classe muted
        if (soundEnabled) {
            soundToggle.classList.remove('muted');
        } else {
            soundToggle.classList.add('muted');
        }
    }
}

function playSound(type = 'click') {
    if (!soundEnabled || !window.AudioContext) return;
    
    try {
        const audioContext = new AudioContext();
        
        // Vérifier l'état du contexte audio
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                generateSound(audioContext, type);
            });
        } else {
            generateSound(audioContext, type);
        }
    } catch (error) {
        console.log('Audio context non disponible:', error);
    }
}

function generateSound(audioContext, type) {
    try {
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
        
        // Volume plus bas sur mobile
        const volume = hasTouch ? 0.05 : 0.1;
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (error) {
        console.log('Erreur génération son:', error);
    }
}

// === PARTICULES (DESKTOP UNIQUEMENT) ===
function initializeParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    // Réduire le nombre de particules sur les appareils moins puissants
    const particleCount = window.innerWidth > 1200 ? 30 : 20;
    
    // Créer les particules
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    // Animation des particules avec requestAnimationFrame optimisé
    let lastTime = 0;
    function animateParticlesOptimized(currentTime) {
        if (currentTime - lastTime >= 100) { // Limitation à 10 FPS pour les particules
            animateParticles();
            lastTime = currentTime;
        }
        requestAnimationFrame(animateParticlesOptimized);
    }
    requestAnimationFrame(animateParticlesOptimized);
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
}

// === CURSEUR PERSONNALISÉ (DESKTOP UNIQUEMENT) ===
function initializeCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const trail = document.querySelector('.cursor-trail');
    
    if (!cursor || !trail) return;
    
    let rafId;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    // Animation de la traînée optimisée
    function updateTrail() {
        const dx = mouseX - trailX;
        const dy = mouseY - trailY;
        
        trailX += dx * 0.1;
        trailY += dy * 0.1;
        
        trail.style.left = trailX + 'px';
        trail.style.top = trailY + 'px';
        
        rafId = requestAnimationFrame(updateTrail);
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
    
    // Nettoyer l'animation si nécessaire
    window.addEventListener('beforeunload', () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
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
    
    // Utiliser l'Intersection Observer pour déclencher l'animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = isMobile ? 1500 : 2000; // Plus rapide sur mobile
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
                
                requestAnimationFrame(updateCounter);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress[data-width]');
    
    // Utiliser l'Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const delay = isMobile ? index * 100 : index * 200;
                
                setTimeout(() => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width + '%';
                }, delay);
                
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.3 });
    
    skillBars.forEach(bar => observer.observe(bar));
}

function animateElements() {
    const elements = document.querySelectorAll('.project-card, .skills-section, .profile-header');
    
    // Animation plus fluide sur mobile
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                
                const delay = isMobile ? index * 50 : index * 100;
                setTimeout(() => {
                    el.style.transition = 'all 0.6s ease';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, delay);
                
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => observer.observe(el));
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
    // Hover effects optimisés
    if (hasHover) {
        const cards = document.querySelectorAll('.project-card, .analytics-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Touch events pour mobile/tablette
    if (hasTouch) {
        setupTouchEvents();
    }
    
    // Ripple effect sur les boutons
    const buttons = document.querySelectorAll('.action-button, .contact-button, .game-btn, .quick-btn');
    buttons.forEach(button => {
        if (hasTouch) {
            button.addEventListener('touchstart', createRipple, { passive: true });
        } else {
            button.addEventListener('click', createRipple);
        }
    });
    
    // Escape pour fermer les modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Gestion du redimensionnement
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
    
    // Prévenir le zoom sur double tap sur iOS
    if (hasTouch) {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
}

function setupTouchEvents() {
    // Feedback tactile pour les cartes de projet
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.addEventListener('touchstart', () => {
            card.style.transform = 'translateY(-3px)';
            card.style.transition = 'transform 0.1s ease';
        }, { passive: true });
        
        card.addEventListener('touchend', () => {
            setTimeout(() => {
                card.style.transform = 'translateY(0)';
                card.style.transition = 'transform 0.3s ease';
            }, 100);
        }, { passive: true });
    });
    
    // Améliorer l'expérience des toggles
    const toggles = document.querySelectorAll('.theme-toggle, .sound-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('touchstart', () => {
            toggle.style.transform = 'scale(0.95)';
        }, { passive: true });
        
        toggle.addEventListener('touchend', () => {
            toggle.style.transform = 'scale(1.1)';
            setTimeout(() => {
                toggle.style.transform = 'scale(1)';
            }, 150);
        }, { passive: true });
    });
}

function handleResize() {
    // Recalculer les éléments si nécessaire
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas && window.innerWidth < 400) {
        gameCanvas.width = Math.min(280, window.innerWidth - 40);
        gameCanvas.height = gameCanvas.width;
    }
    
    // Ajuster le chat widget sur très petits écrans
    const chatWidget = document.getElementById('chatWidget');
    if (chatWidget && window.innerWidth < 400) {
        chatWidget.style.width = 'calc(100% - 1rem)';
    }
}

function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    // Position du clic/touch
    let x, y;
    if (e.type === 'touchstart') {
        const touch = e.touches[0];
        x = touch.clientX - rect.left - size / 2;
        y = touch.clientY - rect.top - size / 2;
    } else {
        x = e.clientX - rect.left - size / 2;
        y = e.clientY - rect.top - size / 2;
    }
    
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
        z-index: 1;
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
    
    // Version tactile pour mobile (séquence de touches spéciales)
    if (hasTouch) {
        let touchSequence = [];
        const touchCode = ['top', 'top', 'bottom', 'bottom', 'left', 'right', 'left', 'right'];
        
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const x = touch.clientX;
            const y = touch.clientY;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            let direction;
            if (Math.abs(x - centerX) > Math.abs(y - centerY)) {
                direction = x > centerX ? 'right' : 'left';
            } else {
                direction = y > centerY ? 'bottom' : 'top';
            }
            
            touchSequence.push(direction);
            
            if (touchSequence.length > touchCode.length) {
                touchSequence.shift();
            }
            
            if (JSON.stringify(touchSequence) === JSON.stringify(touchCode)) {
                triggerEasterEgg();
                touchSequence = [];
            }
        }, { passive: true });
    }
}

function checkKonami() {
    if (hasTouch) {
        showNotification('🎮', 'Indice mobile: Touchez ↑↑↓↓←→←→ sur l\'écran');
    } else {
        showNotification('🎮', 'Indice: ↑↑↓↓←→←→BA');
    }
}

function triggerEasterEgg() {
    playSound('achievement');
    showNotification('🎊', 'Konami Code activé ! Matrix mode !');
    
    // Effet Matrix
    document.body.style.filter = 'hue-rotate(120deg)';
    
    // Créer plus de particules (si supporté)
    if (!isMobile && !isTablet) {
        for (let i = 0; i < 50; i++) {
            createParticle();
        }
    }
    
    // Effet de secousse
    document.body.classList.add('shake-animation');
    
    // Vibration sur mobile
    if (hasTouch && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
    
    setTimeout(() => {
        document.body.style.filter = '';
        document.body.classList.remove('shake-animation');
    }, 5000);
}

// === ANALYTICS ===
function initializeAnalytics() {
    // Détection du dispositif améliorée
    const deviceType = getDeviceType();
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const screenInfo = {
        width: window.screen.width,
        height: window.screen.height,
        devicePixelRatio: window.devicePixelRatio || 1
    };
    
    // Simulation de localisation (en production, utilisez une API géolocalisation)
    const location = 'France';
    
    // Stockage des données
    const analytics = {
        deviceType,
        userAgent,
        language,
        location,
        screenInfo,
        hasTouch,
        hasHover,
        visitTime: new Date().toISOString(),
        sessionId: generateSessionId()
    };
    
    localStorage.setItem('portfolioAnalytics', JSON.stringify(analytics));
    
    // Mise à jour du compteur de visiteurs
    updateVisitorCount();
}

function getDeviceType() {
    const width = window.innerWidth;
    if (isMobile || width < 768) return 'Mobile';
    if (isTablet || (width >= 768 && width < 1024)) return 'Tablette';
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
    
    if (!notification || !iconEl || !textEl) return;
    
    iconEl.textContent = icon;
    
    // Gérer les messages multi-lignes
    if (message.includes('\n')) {
        textEl.innerHTML = message.replace(/\n/g, '<br>');
    } else {
        textEl.textContent = message;
    }
    
    notification.classList.remove('hidden');
    
    // Ajuster la largeur pour les messages longs
    if (message.length > 50) {
        notification.style.maxWidth = isMobile ? '90vw' : '400px';
    } else {
        notification.style.maxWidth = isMobile ? '80vw' : '300px';
    }
    
    // Durée plus longue sur mobile
    const notificationDuration = hasTouch ? duration + 1000 : duration;
    
    setTimeout(() => {
        notification.classList.add('hidden');
        notification.style.maxWidth = '';
    }, notificationDuration);
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
    
    // Arrêter le jeu si ouvert
    if (gameState.running) {
        gameState.running = false;
    }
}

// === FONCTIONS SPÉCIFIQUES ===

// CV Download
function downloadCV() {
    playSound('click');
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
    
    // Ne pas focus automatiquement sur mobile (évite le clavier)
    if (!hasTouch) {
        input.focus();
    }
    
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
    
    if (!input || !output) return;
    
    // Support clavier et touch
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            processTerminalCommand(command, output);
            input.value = '';
        }
    });
    
    // Bouton virtuel pour mobile
    if (hasTouch) {
        const terminalHeader = document.querySelector('.terminal-header');
        if (terminalHeader && !terminalHeader.querySelector('.virtual-enter')) {
            const enterBtn = document.createElement('button');
            enterBtn.textContent = '⏎';
            enterBtn.className = 'virtual-enter';
            enterBtn.style.cssText = `
                background: #00ff00;
                color: #000;
                border: none;
                border-radius: 4px;
                padding: 0.3rem 0.6rem;
                cursor: pointer;
                font-weight: bold;
            `;
            enterBtn.addEventListener('click', () => {
                const command = input.value.trim();
                processTerminalCommand(command, output);
                input.value = '';
            });
            terminalHeader.appendChild(enterBtn);
        }
    }
}

function processTerminalCommand(command, output) {
    if (!output) return;
    
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
- joke: Blague aléatoire
- device: Info appareil`,
        'about': 'Morgan VERSPEEK - Développeur Web passionné de 22 ans basé à Tourcoing.',
        'skills': 'HTML/CSS: 75% | JavaScript: 60% | PHP: 55% | SQL: 65%',
        'projects': '1. The Kraken - Bot Discord avancé\n2. Portfolio Interactif\n3. Projets à venir...',
        'contact': 'Email: contact@morgan-dev.com | Discord: @morgan#1234',
        'clear': 'CLEAR_SCREEN',
        'date': new Date().toLocaleString('fr-FR'),
        'whoami': 'morgan',
        'matrix': 'MATRIX_MODE',
        'joke': getRandomJoke(),
        'device': `Appareil: ${getDeviceType()} | Touch: ${hasTouch} | Hover: ${hasHover}`,
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
    │  Device: ${getDeviceType()}            │
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
        const message = command.substring(5);
        response.textContent = message;
        response.style.color = '#ffffff';
    } else if (responses[command]) {
        response.innerHTML = responses[command].replace(/\n/g, '<br>');
        response.style.color = '#e0e0e0';
    } else {
        response.innerHTML = `<span style="color: #ff6b6b;">bash: ${command}: command not found</span><br><span style="color: #888;">Tapez 'help' pour voir les commandes disponibles.</span>`;
    }
    
    output.appendChild(response);
    output.scrollTop = output.scrollHeight;
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
    
    // Ajuster la taille du canvas pour mobile
    if (hasTouch && window.innerWidth < 400) {
        canvas.width = Math.min(280, window.innerWidth - 40);
        canvas.height = canvas.width;
    }
    
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
    
    // Contrôles tactiles pour mobile
    if (hasTouch) {
        setupTouchControls(canvas);
    }
    
    drawGame(ctx);
}

function setupTouchControls(canvas) {
    let touchStartX = null;
    let touchStartY = null;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        if (!touchStartX || !touchStartY || !gameState.running) {
            return;
        }
        
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Déterminer la direction du swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Mouvement horizontal
            const newDirection = diffX > 0 ? 'left' : 'right';
            if (isValidDirection(newDirection)) {
                gameState.direction = newDirection;
            }
        } else {
            // Mouvement vertical  
            const newDirection = diffY > 0 ? 'up' : 'down';
            if (isValidDirection(newDirection)) {
                gameState.direction = newDirection;
            }
        }
        
        touchStartX = null;
        touchStartY = null;
    }, { passive: false });
}

function startGame() {
    if (gameState.running) return;
    
    gameState.running = true;
    gameState.score = 0;
    gameState.snake = [{x: 200, y: 200}];
    gameState.direction = 'right';
    generateFood();
    
    document.getElementById('startGameBtn').textContent = 'Redémarrer';
    document.getElementById('gameScore').textContent = '0';
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
        e.preventDefault();
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
    
    // Vitesse adaptée selon l'appareil
    const gameSpeed = hasTouch ? 200 : 150;
    
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, gameSpeed);
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
    
    const canvas = document.getElementById('gameCanvas');
    
    // Collision avec les murs
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
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
        
        // Vibration sur mobile
        if (hasTouch && navigator.vibrate) {
            navigator.vibrate(100);
        }
    } else {
        gameState.snake.pop();
    }
}

function drawGame(ctx) {
    const canvas = ctx.canvas;
    
    // Effacer le canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
    const canvas = document.getElementById('gameCanvas');
    const maxX = Math.floor(canvas.width / gameState.gridSize);
    const maxY = Math.floor(canvas.height / gameState.gridSize);
    
    let foodPosition;
    
    do {
        foodPosition = {
            x: Math.floor(Math.random() * maxX) * gameState.gridSize,
            y: Math.floor(Math.random() * maxY) * gameState.gridSize
        };
    } while (gameState.snake.some(segment => 
        segment.x === foodPosition.x && segment.y === foodPosition.y
    ));
    
    gameState.food = foodPosition;
}

function gameOver() {
    gameState.running = false;
    playSound('error');
    
    // Vibration plus longue pour game over
    if (hasTouch && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
    
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
    document.getElementById('deviceType').textContent = analytics.deviceType || getDeviceType();
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
    
    if (!modal || !img || !titleEl || !descEl) return;
    
    img.src = src;
    titleEl.textContent = title;
    descEl.textContent = 'Interface de commandes du bot avec système de modération et lecteur musical intégré';
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Fermeture par tap sur l'arrière-plan sur mobile
    if (hasTouch) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
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
    window.open('https://the-kraken-bot-d8gw.onrender.com/', '_blank');
}

// === FONCTION STATS CORRIGÉE ===
function showStats() {
    playSound('click');
    
    // Afficher un message de chargement
    showNotification('⏳', 'Récupération des statistiques...');
    
    // URL de votre bot sur Fly.io
    const apiUrl = 'https://krakentime-winter-paper-1452.fly.dev/api/stats';
    
    console.log('📊 Tentative de récupération des stats depuis:', apiUrl);
    
    // Fetch avec timeout adapté pour mobile
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), hasTouch ? 15000 : 10000);
    
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        signal: controller.signal
    })
    .then(response => {
        clearTimeout(timeoutId);
        console.log('📊 Réponse reçue, status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
    })
    .then(data => {
        console.log('📊 Données reçues:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Formater les nombres avec séparateurs
        const serversFormatted = data.servers ? data.servers.toLocaleString('fr-FR') : '0';
        const usersFormatted = data.users ? data.users.toLocaleString('fr-FR') : '0';
        
        const message = `📊 Statistiques du Kraken:\n🏠 ${serversFormatted} serveurs\n👥 ${usersFormatted} utilisateurs\n⚡ Statut: ${data.status || 'Actif'}`;
        
        showNotification('📊', message, hasTouch ? 6000 : 5000);
        
        // Optionnel: Mettre à jour l'interface avec les stats
        updateStatsDisplay(data);
        
    })
    .catch(error => {
        clearTimeout(timeoutId);
        console.error('❌ Erreur stats:', error);
        
        let errorMessage = '';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Timeout: Le bot met trop de temps à répondre';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Erreur réseau: Impossible de contacter le bot';
        } else if (error.message.includes('CORS')) {
            errorMessage = 'Erreur CORS: Configuration serveur nécessaire';
        } else {
            errorMessage = `Erreur: ${error.message}`;
        }
        
        showNotification('❌', `Statistiques indisponibles - ${errorMessage}`, 4000);
        
        // Afficher des stats de fallback si possible
        showFallbackStats();
    });
}

// === FONCTION DE MISE À JOUR DE L'AFFICHAGE ===
function updateStatsDisplay(data) {
    // Si vous voulez mettre à jour des éléments spécifiques de la page
    const statsElements = {
        servers: document.querySelector('.servers-count'),
        users: document.querySelector('.users-count'),
        status: document.querySelector('.bot-status')
    };
    
    if (statsElements.servers) {
        statsElements.servers.textContent = data.servers.toLocaleString('fr-FR');
    }
    
    if (statsElements.users) {
        statsElements.users.textContent = data.users.toLocaleString('fr-FR');
    }
    
    if (statsElements.status) {
        statsElements.status.textContent = data.status === 'online' ? '🟢 En ligne' : '🔴 Hors ligne';
    }
}

// === FONCTION DE FALLBACK ===
function showFallbackStats() {
    const fallbackMessage = "📊 Stats approximatives:\n🏠 ~3+ serveurs\n👥 ~100+ utilisateurs\n⚡ Bot généralement actif 24/7";
    showNotification('📈', fallbackMessage, 4000);
}

function sharePortfolio() {
    playSound('click');
    
    if (navigator.share && hasTouch) {
        navigator.share({
            title: 'Portfolio Morgan VERSPEEK',
            text: 'Découvrez le portfolio de Morgan, développeur web passionné !',
            url: window.location.href
        }).catch(error => {
            console.log('Erreur partage natif:', error);
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    // Copier dans le presse-papier
    if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('📤', 'Lien copié dans le presse-papier !');
        }).catch(() => {
            showNotification('📤', 'Partage: ' + window.location.href);
        });
    } else {
        showNotification('📤', 'Partage: ' + window.location.href);
    }
}

// Chat Widget
function toggleChat() {
    const widget = document.getElementById('chatWidget');
    widget.classList.toggle('minimized');
    playSound('click');
    
    // Scroll automatique vers les nouveaux messages sur mobile
    if (hasTouch && !widget.classList.contains('minimized')) {
        setTimeout(() => {
            const messages = document.getElementById('chatMessages');
            if (messages) {
                messages.scrollTop = messages.scrollHeight;
            }
        }, 300);
    }
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
    }, hasTouch ? 1500 : 1000);
}

function addChatMessage(content, type) {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;
    
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
        { regex: /bonjour|salut|hello|hey/i, response: '👋 Bonjour ! Que puis-je faire pour vous ?' },
        { regex: /présente.*morgan|qui.*morgan|parle.*morgan/i, response: '🧑‍💻 Morgan est un développeur web passionné, spécialisé en JavaScript, bots Discord et interfaces modernes.' },
        { regex: /contact/i, response: '📨 Vous pouvez me contacter via le formulaire ou Discord : @morgan#1234.' },
        { regex: /projet/i, response: '📌 Je travaille sur des bots Discord, sites web, et assistants IA. Un projet en tête ?' },
        { regex: /prix|tarif|budget/i, response: '💰 Les tarifs varient selon le projet. Contactez-moi pour un devis personnalisé.' },
        { regex: /merci|thanks/i, response: '🙏 Avec plaisir !' },
        { regex: /au revoir|bye/i, response: '👋 À bientôt ! Merci de votre visite.' },
        { regex: /mobile|tablette|touch/i, response: '📱 Le portfolio est optimisé pour tous les appareils ! Profitez de l\'expérience tactile.' },
        { regex: /suggestion|sugestion/i, response: '💡 Voici quelques suggestions : "Voir les projets", "Contacter Morgan", "Tarifs des services", "Parler du bot Discord".' }
    ];

    const lowerMessage = message.toLowerCase();
    for (const { regex, response } of patterns) {
        if (regex.test(lowerMessage)) {
            return response;
        }
    }

    return "Merci pour votre message ! Pour une réponse détaillée, n'hésitez pas à utiliser le formulaire de contact.";
}

// === GESTION DES ERREURS GLOBALES ===
window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error);
    
    // Sur mobile, afficher une notification discrète
    if (hasTouch) {
        setTimeout(() => {
            showNotification('⚠️', 'Une erreur mineure s\'est produite', 2000);
        }, 1000);
    }
});

// === DÉTECTION DE LA CONNEXION ===
function checkConnection() {
    if (navigator.onLine) {
        document.body.classList.remove('offline');
    } else {
        document.body.classList.add('offline');
        showNotification('📡', 'Mode hors ligne détecté', 3000);
    }
}

window.addEventListener('online', () => {
    checkConnection();
    showNotification('✅', 'Connexion rétablie !');
});

window.addEventListener('offline', () => {
    checkConnection();
    showNotification('📡', 'Mode hors ligne');
});

// === OPTIMISATION MÉMOIRE ===
function cleanupOnUnload() {
    // Nettoyer les timers et listeners
    particles.forEach(particle => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    });
    particles = [];
    
    // Arrêter les animations
    gameState.running = false;
}

window.addEventListener('beforeunload', cleanupOnUnload);
window.addEventListener('pagehide', cleanupOnUnload);

// === INITIALISATION FINALE ===
// Initialiser selon l'état de chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
    // Délai léger pour s'assurer que tout est chargé
    setTimeout(initPortfolio, 100);
}

// Vérifier la connexion au démarrage
setTimeout(checkConnection, 1000);
