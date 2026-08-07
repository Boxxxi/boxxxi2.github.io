/*
 * SPACE SECTIONS V1
 * Non-destructive DOM enhancements for sections after Experience.
 * Quick revert: remove this script and space-sections.css from index.html.
 */

(() => {
    // Set to false for an instant return to the pre-redesign sections.
    const SPACE_SECTIONS_ENABLED = true;
    if (!SPACE_SECTIONS_ENABLED) return;

    document.body.classList.add('space-sections-v1');

    const atmosphere = document.querySelector('.atmosphere');
    if (atmosphere && !atmosphere.querySelector('.space-star-canvas')) {
        const canvas = document.createElement('canvas');
        canvas.className = 'space-star-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        atmosphere.prepend(canvas);

        const drawStarField = () => {
            const rect = canvas.getBoundingClientRect();
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
            canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));

            const context = canvas.getContext('2d');
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            context.clearRect(0, 0, rect.width, rect.height);

            let seed = 1846824;
            const random = () => {
                seed |= 0;
                seed = seed + 0x6D2B79F5 | 0;
                let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
                value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
                return ((value ^ value >>> 14) >>> 0) / 4294967296;
            };
            const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(random(), .0001))) * Math.cos(2 * Math.PI * random());
            const clusters = [
                { x: .18, y: .28, spread: .12 },
                { x: .68, y: .2, spread: .16 },
                { x: .82, y: .72, spread: .13 }
            ];
            const area = rect.width * rect.height;
            const starCount = Math.max(120, Math.round(area / 5200));

            for (let index = 0; index < starCount; index++) {
                let x = random() * rect.width;
                let y = random() * rect.height;

                if (random() < .32) {
                    const cluster = clusters[Math.floor(random() * clusters.length)];
                    x = (cluster.x + gaussian() * cluster.spread) * rect.width;
                    y = (cluster.y + gaussian() * cluster.spread) * rect.height;
                }

                if (x < 0 || x > rect.width || y < 0 || y > rect.height) continue;
                const rareBrightStar = random() > .94;
                const radius = rareBrightStar ? .9 + random() * 1.25 : .25 + Math.pow(random(), 2) * .75;
                const alpha = rareBrightStar ? .7 + random() * .28 : .22 + random() * .58;
                const blue = random() > .72;

                if (rareBrightStar) {
                    const glow = context.createRadialGradient(x, y, 0, x, y, radius * 5);
                    glow.addColorStop(0, `rgba(${blue ? '125,211,252' : '255,255,255'},${alpha * .48})`);
                    glow.addColorStop(1, 'rgba(125,211,252,0)');
                    context.fillStyle = glow;
                    context.beginPath();
                    context.arc(x, y, radius * 5, 0, Math.PI * 2);
                    context.fill();
                }

                context.fillStyle = `rgba(${blue ? '174,226,255' : '240,249,255'},${alpha})`;
                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI * 2);
                context.fill();
            }
        };

        let resizeTimer;
        window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(drawStarField, 160);
        });
        drawStarField();
    }

    const hero = document.querySelector('#hero');
    const heroText = hero?.querySelector('.hero-text');
    const heroSubtitle = hero?.querySelector('.hero-subtitle');
    const heroImage = hero?.querySelector('.hero-image');

    if (heroText && !heroText.querySelector('.pilot-profile-label')) {
        const pilotLabel = document.createElement('span');
        pilotLabel.className = 'pilot-profile-label';
        pilotLabel.textContent = 'PILOT PROFILE · ABHISHEK BAKSHI';
        heroText.prepend(pilotLabel);
    }

    if (heroSubtitle && !heroText.querySelector('.mission-status-panel')) {
        const statusPanel = document.createElement('div');
        statusPanel.className = 'mission-status-panel';
        statusPanel.setAttribute('aria-label', 'Profile status');
        statusPanel.innerHTML = `
            <span><b>CURRENT BASE</b> BROOKLYN · NYC</span>
            <span><b>ORBIT</b> NYU · DATA SCIENCE</span>
            <span><b>VECTOR</b> ROBOTICS · COMPUTER VISION</span>
        `;
        heroSubtitle.after(statusPanel);
    }

    if (heroImage && !heroImage.querySelector('.command-ring')) {
        ['ring-near', 'ring-far'].forEach(className => {
            const ring = document.createElement('span');
            ring.className = `command-ring ${className}`;
            ring.setAttribute('aria-hidden', 'true');
            heroImage.appendChild(ring);
        });

    }

    if (hero && !hero.querySelector('.orbital-pass')) {
        const orbitalPass = document.createElement('span');
        orbitalPass.className = 'orbital-pass';
        orbitalPass.setAttribute('aria-hidden', 'true');
        hero.appendChild(orbitalPass);
    }

    document.querySelectorAll('.project-card').forEach((card, index) => {
        if (card.querySelector('.mission-id')) return;
        const missionId = document.createElement('span');
        missionId.className = 'mission-id';
        missionId.textContent = `MISSION ${String(index + 1).padStart(2, '0')} · ARCHIVED`;
        card.appendChild(missionId);
    });

    const signalCopy = document.querySelector('.daily-reading-copy');
    if (signalCopy && !signalCopy.querySelector('.signal-readout')) {
        const readout = document.createElement('div');
        readout.className = 'signal-readout';
        readout.textContent = 'DEEP SIGNAL RECEIVER';
        signalCopy.prepend(readout);
    }

    const destinations = [
        'SIMULATION LAB',
        'OBSERVATION DECK',
        'ORBITAL WORKSHOP',
        'CREATIVE NEBULA'
    ];

    document.querySelectorAll('.extra-card').forEach((card, index) => {
        const heading = card.querySelector('h3');
        if (!heading || card.querySelector('.destination-label')) return;
        const label = document.createElement('span');
        label.className = 'destination-label';
        label.textContent = destinations[index] || 'PERSONAL UNIVERSE';
        heading.before(label);
    });

    const footerHeading = document.querySelector('.footer .footer-section h3');
    if (footerHeading && !footerHeading.parentElement.querySelector('.ground-control-label')) {
        const label = document.createElement('span');
        label.className = 'ground-control-label';
        label.textContent = 'GROUND CONTROL · CHANNEL OPEN';
        footerHeading.before(label);
    }
})();
