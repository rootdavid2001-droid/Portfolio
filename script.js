/* ============================================
   DAVID PORTFOLIO - JAVASCRIPT
   ============================================

   TABLE OF CONTENTS:
   1. Loading Screen Handler
   2. Particle System Configuration
   3. Floating Blocks Configuration
   4. Scroll Reveal Configuration
   5. Skill Bar Configuration
   6. Navbar Configuration
   7. Utility Functions

   ============================================ */

/* ============================================
   1. LOADING SCREEN HANDLER
   ============================================ */
function initLoadingScreen() {
    const loader = document.getElementById('loader');
    
    // Hide loader after 3 seconds
    setTimeout(() => {
        loader.classList.add('hide');
    }, 1000);
    
    // Remove loader from DOM after fade out completes
    setTimeout(() => {
        loader.style.display = 'none';
    }, 1800);
}

// Initialize loading screen when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoadingScreen);
} else {
    initLoadingScreen();
}

/* ============================================
   2. PARTICLE SYSTEM CONFIGURATION
   ============================================
   Edit these values to customize particles:
   - particleCount: Number of particles
   - particleSpeed: Movement speed
   - particleSize: Size of particles
   - particleColors: Available colors
   ============================================ */
const PARTICLE_CONFIG = {
    particleCount: 150,          // Number of particles (increased for better visuals)
    particleSpeed: 0.5,          // Base speed multiplier (0.1 - 2)
    particleMinSize: 2,          // Minimum particle size
    particleMaxSize: 5,          // Maximum particle size
    particleColors: [            // Particle colors
        '#2ecc71',               // Emerald Green
        '#27ae60',               // Darker Green
        '#3ddc84',               // Lighter Green
        '#00d9ff',               // Cyan accent
        '#9b59b6'                // Purple accent
    ],
    connectionDistance: 150,     // Max distance for line connections
    mouseInteraction: true,       // Enable mouse interaction
    mouseRadius: 200             // Mouse influence radius
};

/* ============================================
   3. FLOATING BLOCKS CONFIGURATION
   ============================================
   Edit these values to customize floating blocks:
   - blockCount: Number of 3D blocks
   - blockSize: Size of blocks in pixels
   - animationDuration: Animation loop duration
   ============================================ */
const BLOCKS_CONFIG = {
    blockCount: 8,               // Number of floating blocks (recommended: 5-12)
    blockMinSize: 40,           // Minimum block size (px)
    blockMaxSize: 80,           // Maximum block size (px)
    animationDuration: 20,      // Animation duration in seconds
    parallaxStrength: 0.05      // Mouse parallax strength (0.01 - 0.1)
};

/* ============================================
   4. SCROLL REVEAL CONFIGURATION
   ============================================ */
const REVEAL_CONFIG = {
    threshold: 0.1,             // Trigger when 10% visible
    rootMargin: '0px',          // Margin around viewport
    animationDuration: 0.8     // Animation duration in seconds
};

/* ============================================
   5. SKILL BAR CONFIGURATION
   ============================================ */
const SKILL_CONFIG = {
    animationDelay: 200,        // Delay between skill animations (ms)
    animationDuration: 1.5      // Animation duration in seconds
};

/* ============================================
   6. STATS COUNTER CONFIGURATION
   ============================================ */
const STATS_CONFIG = {
    duration: 2000,             // Animation duration (ms)
    refreshRate: 30            // Update frequency (ms)
};

/* ============================================
   PARTICLE SYSTEM CLASS
   ============================================ */
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.animationId = null;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < PARTICLE_CONFIG.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * (PARTICLE_CONFIG.particleMaxSize - PARTICLE_CONFIG.particleMinSize) + PARTICLE_CONFIG.particleMinSize,
                speedX: (Math.random() - 0.5) * PARTICLE_CONFIG.particleSpeed * 2,
                speedY: (Math.random() - 0.5) * PARTICLE_CONFIG.particleSpeed * 2,
                color: PARTICLE_CONFIG.particleColors[Math.floor(Math.random() * PARTICLE_CONFIG.particleColors.length)],
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        if (PARTICLE_CONFIG.mouseInteraction) {
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            document.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }
    }

    updateParticle(particle) {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Boundary wrapping
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < PARTICLE_CONFIG.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = PARTICLE_CONFIG.particleColors[0];
                    this.ctx.globalAlpha = (1 - distance / PARTICLE_CONFIG.connectionDistance) * 0.3;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1;
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles - all particles attracted to cursor
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });

        // Draw connections
        this.drawConnections();

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

/* ============================================
   FLOATING BLOCKS SYSTEM
   ============================================ */
class FloatingBlocks {
    constructor(container) {
        this.container = container;
        this.blocks = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.container.innerHTML = '';

        for (let i = 0; i < BLOCKS_CONFIG.blockCount; i++) {
            const block = document.createElement('div');
            block.className = 'floating-block';

            const size = Math.random() * (BLOCKS_CONFIG.blockMaxSize - BLOCKS_CONFIG.blockMinSize) + BLOCKS_CONFIG.blockMinSize;
            block.style.width = `${size}px`;
            block.style.height = `${size}px`;
            block.style.left = `${Math.random() * 100}%`;
            block.style.top = `${Math.random() * 100}%`;
            block.style.animationDelay = `${Math.random() * BLOCKS_CONFIG.animationDuration}s`;
            block.style.animationDuration = `${BLOCKS_CONFIG.animationDuration + Math.random() * 10}s`;

            this.container.appendChild(block);
            this.blocks.push({
                element: block,
                x: parseFloat(block.style.left),
                y: parseFloat(block.style.top)
            });
        }
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.targetMouseX = e.clientX;
            this.targetMouseY = e.clientY;
        });
    }

    animate() {
        // Smooth mouse movement
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Parallax effect
        const offsetX = (this.mouseX - window.innerWidth / 2) * BLOCKS_CONFIG.parallaxStrength;
        const offsetY = (this.mouseY - window.innerHeight / 2) * BLOCKS_CONFIG.parallaxStrength;

        this.blocks.forEach((block, index) => {
            const element = block.element;
            const currentTransform = getComputedStyle(element).transform;
            const translateX = offsetX * (index + 1) * 0.1;
            const translateY = offsetY * (index + 1) * 0.1;
            element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }
}

/* ============================================
   SCROLL REVEAL SYSTEM
   ============================================ */
class ScrollReveal {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        const options = {
            root: null,
            rootMargin: REVEAL_CONFIG.rootMargin,
            threshold: REVEAL_CONFIG.threshold
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, options);

        document.querySelectorAll('.reveal-on-scroll').forEach(element => {
            this.observer.observe(element);
        });
    }

    refresh() {
        document.querySelectorAll('.reveal-on-scroll').forEach(element => {
            this.observer.unobserve(element);
            this.observer.observe(element);
        });
    }
}

/* ============================================
   SKILL BARS SYSTEM
   ============================================ */
class SkillBars {
    constructor() {
        this.animated = false;
        this.init();
    }

    init() {
        const skillItems = document.querySelectorAll('.skill-item');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animateSkills(skillItems);
                    this.animated = true;
                }
            });
        }, { threshold: 0.3 });

        skillItems.forEach(item => observer.observe(item));
    }

    animateSkills(items) {
        items.forEach((item, index) => {
            const level = item.dataset.level;
            const bar = item.querySelector('.skill-bar');

            setTimeout(() => {
                bar.style.width = `${level}%`;
            }, index * SKILL_CONFIG.animationDelay);
        });
    }

    reset() {
        this.animated = false;
        document.querySelectorAll('.skill-bar').forEach(bar => {
            bar.style.width = '0';
        });
    }
}

/* ============================================
   STATS COUNTER SYSTEM
   ============================================ */
class StatsCounter {
    constructor() {
        this.animated = false;
        this.init();
    }

    init() {
        const statNumbers = document.querySelectorAll('.stat-number');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animateStats(statNumbers);
                    this.animated = true;
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    animateStats(elements) {
        elements.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            const hasPlus = stat.dataset.plus === 'true';
            const duration = STATS_CONFIG.duration;
            const steps = duration / STATS_CONFIG.refreshRate;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                const displayValue = Math.floor(current);
                const suffix = hasPlus ? '+' : '';
                
                if (current >= target) {
                    stat.textContent = target + suffix;
                    clearInterval(timer);
                } else {
                    stat.textContent = displayValue + suffix;
                }
            }, STATS_CONFIG.refreshRate);
        });
    }
}

/* ============================================
   NAVBAR SYSTEM
   ============================================ */
class NavbarManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');

        this.init();
    }

    init() {
        this.setupScrollHandler();
        this.setupMobileMenu();
        this.setupActiveLink();
    }

    setupScrollHandler() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        });
    }

    setupMobileMenu() {
        if (this.navToggle && this.navMenu) {
            this.navToggle.addEventListener('click', () => {
                this.navToggle.classList.toggle('active');
                this.navMenu.classList.toggle('active');
            });

            // Close menu on link click
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.navToggle.classList.remove('active');
                    this.navMenu.classList.remove('active');
                });
            });
        }
    }

    setupActiveLink() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    this.updateActiveLink(id);
                }
            });
        }, { threshold: 0.3 });

        this.sections.forEach(section => observer.observe(section));
    }

    updateActiveLink(activeId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === activeId) {
                link.classList.add('active');
            }
        });
    }
}

/* ============================================
   SMOOTH SCROLL SYSTEM
   ============================================ */
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    const offset = 80; // Navbar height + padding
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

/* ============================================
   BUTTON RIPPLE EFFECT
   ============================================ */
class ButtonRipple {
    constructor() {
        this.init();
    }

    init() {
        const buttons = document.querySelectorAll('.btn-primary');

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = button.querySelector('.btn-ripple');
                if (ripple) {
                    ripple.style.left = `${x}px`;
                    ripple.style.top = `${y}px`;
                }
            });
        });
    }
}

/* ============================================
   GLITCH EFFECT
   ============================================ */
class GlitchEffect {
    constructor() {
        this.init();
    }

    init() {
        const nameGlitch = document.querySelector('.name-glitch');
        if (nameGlitch) {
            // Random glitch intervals
            setInterval(() => {
                if (Math.random() > 0.7) {
                    nameGlitch.style.opacity = '0.3';
                    nameGlitch.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;

                    setTimeout(() => {
                        nameGlitch.style.opacity = '0';
                        nameGlitch.style.transform = 'translate(0, 0)';
                    }, 100);
                }
            }, 2000);
        }
    }
}

/* ============================================
   TYPING EFFECT (Optional)
   ============================================ */
class TypingEffect {
    constructor() {
        this.init();
    }

    init() {
        // Add typing effect if needed
        // Currently using static subtitle
    }
}

/* ============================================
   INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all systems
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
        new ParticleSystem(particleCanvas);
    }

    const floatingBlocksContainer = document.getElementById('floating-blocks');
    if (floatingBlocksContainer) {
        new FloatingBlocks(floatingBlocksContainer);
    }

    new ScrollReveal();
    new SkillBars();
    new StatsCounter();
    new NavbarManager();
    new SmoothScroll();
    new ButtonRipple();
    new GlitchEffect();

    console.log('David Portfolio initialized successfully!');
});

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Random number generator
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Linear interpolation
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}
