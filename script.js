```javascript
/* =========================================================
   OASIS • SCRIPT COMMUN
   Version de départ
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const OASIS_CONFIG = {

    maxEvolution: 50,

    storageKey: "oasis_progression",

    defaultProgression: 1

};


/* =========================================================
   DONNÉES DES ZONES
========================================================= */

const OASIS_ZONES = {

    village: {
        name: "Le Village",
        icon: "🏘️",
        page: "village.html"
    },

    port: {
        name: "Le Port",
        icon: "⚓",
        page: "port.html"
    },

    foret: {
        name: "La Forêt",
        icon: "🌲",
        page: "foret.html"
    }

};


/* =========================================================
   PROGRESSION DE L'ÎLE
========================================================= */

function getIslandProgress() {

    const saved =
        localStorage.getItem(
            OASIS_CONFIG.storageKey
        );

    if (saved === null) {

        return OASIS_CONFIG.defaultProgression;

    }

    const progression =
        Number(saved);

    if (
        !Number.isFinite(progression) ||
        progression < 1
    ) {

        return OASIS_CONFIG.defaultProgression;

    }

    return Math.min(
        Math.floor(progression),
        OASIS_CONFIG.maxEvolution
    );

}


function setIslandProgress(value) {

    let progression =
        Number(value);

    if (!Number.isFinite(progression)) {

        progression =
            OASIS_CONFIG.defaultProgression;

    }

    progression =
        Math.max(
            1,
            Math.min(
                Math.floor(progression),
                OASIS_CONFIG.maxEvolution
            )
        );

    localStorage.setItem(
        OASIS_CONFIG.storageKey,
        String(progression)
    );

    updateIslandProgressUI();

    return progression;

}


/* =========================================================
   CALCUL DE POURCENTAGE
========================================================= */

function getProgressPercentage(level) {

    const value =
        Number(level);

    if (!Number.isFinite(value)) {

        return 0;

    }

    return Math.round(
        (value / OASIS_CONFIG.maxEvolution) * 100
    );

}


/* =========================================================
   MISE À JOUR DE L'INTERFACE
========================================================= */

function updateIslandProgressUI() {

    const level =
        getIslandProgress();

    const percentage =
        getProgressPercentage(level);


    document
        .querySelectorAll(
            "[data-island-level]"
        )
        .forEach(element => {

            element.textContent =
                String(level).padStart(2, "0");

        });


    document
        .querySelectorAll(
            "[data-island-progress]"
        )
        .forEach(element => {

            element.textContent =
                percentage + "%";

        });


    document
        .querySelectorAll(
            "[data-island-progress-bar]"
        )
        .forEach(element => {

            element.style.width =
                percentage + "%";

        });


    document
        .querySelectorAll(
            "[data-island-max]"
        )
        .forEach(element => {

            element.textContent =
                OASIS_CONFIG.maxEvolution;

        });

}


/* =========================================================
   NAVIGATION DES ZONES
========================================================= */

function setupZoneNavigation() {

    document
        .querySelectorAll(
            "[data-zone]"
        )
        .forEach(element => {

            const zone =
                element.dataset.zone;

            const zoneData =
                OASIS_ZONES[zone];

            if (!zoneData) return;


            element.addEventListener(
                "click",
                () => {

                    window.location.href =
                        zoneData.page;

                }
            );

        });

}


/* =========================================================
   ANIMATION AU SCROLL
========================================================= */

function setupScrollAnimations() {

    const elements =
        document.querySelectorAll(
            "[data-reveal]"
        );

    if (!elements.length) return;


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(element => {

            element.classList.add(
                "is-visible"
            );

        });

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(
                        "is-visible"
                    );

                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12
            }
        );


    elements.forEach(element => {

        observer.observe(element);

    });

}


/* =========================================================
   NAVBAR
========================================================= */

function setupNavbar() {

    const navbar =
        document.querySelector(
            ".navbar"
        );

    if (!navbar) return;


    function updateNavbar() {

        if (window.scrollY > 20) {

            navbar.classList.add(
                "navbar-scrolled"
            );

        } else {

            navbar.classList.remove(
                "navbar-scrolled"
            );

        }

    }


    updateNavbar();


    window.addEventListener(
        "scroll",
        updateNavbar,
        {
            passive: true
        }
    );

}


/* =========================================================
   BOUTON RETOUR EN HAUT
========================================================= */

function setupBackToTop() {

    const button =
        document.querySelector(
            "[data-back-to-top]"
        );

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    function updateButton() {

        button.classList.toggle(
            "is-visible",
            window.scrollY > 500
        );

    }


    updateButton();


    window.addEventListener(
        "scroll",
        updateButton,
        {
            passive: true
        }
    );

}


/* =========================================================
   LIENS DISCORD
========================================================= */

function setupDiscordLinks() {

    document
        .querySelectorAll(
            "[data-discord]"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const url =
                        link.dataset.discord;

                    if (!url) return;

                    event.preventDefault();

                    window.open(
                        url,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }
            );

        });

}


/* =========================================================
   ANNÉE AUTOMATIQUE
========================================================= */

function updateCurrentYear() {

    const year =
        new Date().getFullYear();


    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach(element => {

            element.textContent =
                year;

        });

}


/* =========================================================
   LIEN DE PAGE ACTIVE
========================================================= */

function setupActiveNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    document
        .querySelectorAll(
            ".nav-links a"
        )
        .forEach(link => {

            const href =
                link.getAttribute("href");

            if (!href) return;


            const linkPage =
                href
                    .split("/")
                    .pop()
                    .split("#")[0]
                    .toLowerCase();


            if (
                linkPage === currentPage ||
                (
                    currentPage === "" &&
                    linkPage === "index.html"
                )
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

}


/* =========================================================
   COMPTEUR ANIMÉ
========================================================= */

function animateCounters() {

    const counters =
        document.querySelectorAll(
            "[data-counter]"
        );

    if (!counters.length) return;


    counters.forEach(counter => {

        const target =
            Number(
                counter.dataset.counter
            );

        if (!Number.isFinite(target)) {
            return;
        }


        let current = 0;

        const duration = 900;

        const start =
            performance.now();


        function update(time) {

            const elapsed =
                time - start;

            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            current =
                Math.round(
                    target * eased
                );


            counter.textContent =
                current;


            if (progress < 1) {

                requestAnimationFrame(
                    update
                );

            }

        }


        requestAnimationFrame(
            update
        );

    });

}


/* =========================================================
   INITIALISATION
========================================================= */

function initOasis() {

    updateIslandProgressUI();

    setupZoneNavigation();

    setupScrollAnimations();

    setupNavbar();

    setupBackToTop();

    setupDiscordLinks();

    setupActiveNavigation();

    updateCurrentYear();

    animateCounters();

}


/* =========================================================
   LANCEMENT
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initOasis
    );

} else {

    initOasis();

}


/* =========================================================
   API GLOBALE
========================================================= */

window.Oasis = {

    config: OASIS_CONFIG,

    zones: OASIS_ZONES,

    getProgress: getIslandProgress,

    setProgress: setIslandProgress,

    getPercentage: getProgressPercentage,

    updateUI: updateIslandProgressUI

};
```
