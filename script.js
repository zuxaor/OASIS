```javascript
/* =========================================================
   OASIS • SCRIPT COMMUN
   index.html
   village.html
   port.html
   foret.html
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const CONFIG = {
        maxEvolution: 50,

        storageKey: "oasisData",

        defaultData: {
            island: {
                level: 1,
                contributions: 0
            },

            village: {
                level: 1,
                contributions: 0
            },

            port: {
                level: 1,
                contributions: 0
            },

            foret: {
                level: 1,
                contributions: 0
            }
        }
    };


    /* =====================================================
       DONNÉES
    ===================================================== */

    function loadData() {

        try {

            const saved =
                localStorage.getItem(CONFIG.storageKey);

            if (!saved) {

                return structuredClone(CONFIG.defaultData);

            }

            const data = JSON.parse(saved);

            return {

                ...structuredClone(CONFIG.defaultData),

                ...data,

                island: {
                    ...CONFIG.defaultData.island,
                    ...(data.island || {})
                },

                village: {
                    ...CONFIG.defaultData.village,
                    ...(data.village || {})
                },

                port: {
                    ...CONFIG.defaultData.port,
                    ...(data.port || {})
                },

                foret: {
                    ...CONFIG.defaultData.foret,
                    ...(data.foret || {})
                }

            };

        } catch (error) {

            console.error(
                "Erreur lors du chargement des données Oasis :",
                error
            );

            return structuredClone(CONFIG.defaultData);

        }

    }


    function saveData(data) {

        try {

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(data)
            );

        } catch (error) {

            console.error(
                "Erreur lors de la sauvegarde Oasis :",
                error
            );

        }

    }


    let oasisData = loadData();


    /* =====================================================
       OUTILS
    ===================================================== */

    function clamp(value, min, max) {

        return Math.min(
            Math.max(value, min),
            max
        );

    }


    function formatLevel(level) {

        return String(level).padStart(2, "0");

    }


    function getPercentage(level) {

        return Math.round(
            (level / CONFIG.maxEvolution) * 100
        );

    }


    function getZoneFromPage() {

        const path =
            window.location.pathname
                .toLowerCase();

        if (
            path.includes("village")
        ) {

            return "village";

        }

        if (
            path.includes("port")
        ) {

            return "port";

        }

        if (
            path.includes("foret") ||
            path.includes("forêt")
        ) {

            return "foret";

        }

        return "island";

    }


    /* =====================================================
       ÉVOLUTION GÉNÉRALE
    ===================================================== */

    function getZoneData(zone) {

        if (!oasisData[zone]) {

            oasisData[zone] = {
                level: 1,
                contributions: 0
            };

        }

        return oasisData[zone];

    }


    function setZoneLevel(zone, level) {

        const zoneData =
            getZoneData(zone);

        zoneData.level =
            clamp(
                Number(level) || 1,
                1,
                CONFIG.maxEvolution
            );

        saveData(oasisData);

        updatePage(zone);

    }


    function addContribution(zone, amount = 1) {

        const zoneData =
            getZoneData(zone);

        amount =
            Math.max(
                0,
                Number(amount) || 0
            );

        zoneData.contributions += amount;

        /*
         * Une contribution fait progresser
         * automatiquement la zone.
         *
         * Pour l'instant :
         * 1 contribution = 1 évolution.
         */

        zoneData.level =
            clamp(
                zoneData.level + amount,
                1,
                CONFIG.maxEvolution
            );

        saveData(oasisData);

        updatePage(zone);

        announceEvolution(
            zone,
            zoneData.level
        );

    }


    /* =====================================================
       DONNÉES DES ÉVOLUTIONS
    ===================================================== */

    const evolutionData = {

        island: {

            1: {
                name: "L'île sauvage",
                description:
                    "Oasis commence son aventure. L'île est encore largement sauvage et attend de prendre vie."
            },

            10: {
                name: "Les premiers changements",
                description:
                    "La communauté commence à transformer l'île. Les premières zones prennent forme."
            },

            20: {
                name: "L'île se développe",
                description:
                    "Les différentes zones d'Oasis commencent à évoluer et l'île devient progressivement plus vivante."
            },

            30: {
                name: "Une véritable communauté",
                description:
                    "Oasis prend forme. Les habitants, les lieux et les différentes zones commencent à former un ensemble cohérent."
            },

            40: {
                name: "L'île florissante",
                description:
                    "L'île atteint un niveau de développement important grâce aux efforts de toute la communauté."
            },

            50: {
                name: "L'apogée d'Oasis",
                description:
                    "Oasis atteint son évolution maximale et devient une île entièrement développée."
            }

        },


        village: {

            1: {
                name: "Le petit village",
                description:
                    "Quelques habitations forment les premières bases du village d'Oasis."
            },

            10: {
                name: "Les premières maisons",
                description:
                    "Le village commence à s'agrandir et de nouvelles habitations apparaissent."
            },

            20: {
                name: "Le village grandit",
                description:
                    "Les rues se développent et le village devient progressivement plus vivant."
            },

            30: {
                name: "Le cœur de l'île",
                description:
                    "Le village devient un véritable centre de vie pour la communauté."
            },

            40: {
                name: "Le grand village",
                description:
                    "Le village est désormais fortement développé et accueille une communauté importante."
            },

            50: {
                name: "Le village d'Oasis",
                description:
                    "Le village atteint son évolution finale et devient l'un des lieux principaux de l'île."
            }

        },


        port: {

            1: {
                name: "Les vestiges",
                description:
                    "Quelques vieux quais et embarcations abandonnées constituent les premiers vestiges du port."
            },

            10: {
                name: "Les premiers quais",
                description:
                    "Les anciens quais sont réparés et les premières embarcations commencent à revenir."
            },

            20: {
                name: "Le port se développe",
                description:
                    "Les quais s'étendent et les premières infrastructures portuaires apparaissent."
            },

            30: {
                name: "Le port actif",
                description:
                    "Le port devient un véritable lieu de passage et de commerce sur l'île."
            },

            40: {
                name: "Le grand port",
                description:
                    "Les quais et les infrastructures maritimes sont désormais fortement développés."
            },

            50: {
                name: "Le grand port d'Oasis",
                description:
                    "Le port atteint son évolution finale et devient le véritable centre maritime d'Oasis."
            }

        },


        foret: {

            1: {
                name: "Le terrain sauvage",
                description:
                    "Une terre encore sauvage où la végétation commence tout juste à prendre possession de l'île."
            },

            10: {
                name: "La repousse",
                description:
                    "La nature reprend ses droits. Les premiers arbres se développent et les sentiers commencent à apparaître."
            },

            20: {
                name: "L'expansion",
                description:
                    "La forêt s'étend et devient progressivement plus dense. De nouvelles zones deviennent accessibles."
            },

            30: {
                name: "Le sanctuaire",
                description:
                    "La biodiversité s'installe. La forêt devient un véritable refuge naturel au cœur d'Oasis."
            },

            40: {
                name: "La forêt dense",
                description:
                    "Une végétation abondante recouvre désormais la zone. Les profondeurs de la forêt deviennent mystérieuses."
            },

            50: {
                name: "L'apogée",
                description:
                    "La forêt atteint son évolution finale et devient l'un des grands sanctuaires naturels d'Oasis."
            }

        }

    };


    /* =====================================================
       TROUVER L'ÉVOLUTION LA PLUS PROCHE
    ===================================================== */

    function getEvolution(zone, level) {

        const data =
            evolutionData[zone];

        if (!data) {

            return null;

        }

        const levels =
            Object.keys(data)
                .map(Number)
                .sort((a, b) => a - b);

        let selectedLevel =
            levels[0];

        for (const currentLevel of levels) {

            if (level >= currentLevel) {

                selectedLevel =
                    currentLevel;

            }

        }

        return {

            level: selectedLevel,

            ...data[selectedLevel]

        };

    }


    /* =====================================================
       MISE À JOUR DE LA PAGE
    ===================================================== */

    function updatePage(zone = getZoneFromPage()) {

        const zoneData =
            getZoneData(zone);

        const level =
            clamp(
                Number(zoneData.level) || 1,
                1,
                CONFIG.maxEvolution
            );

        const percentage =
            getPercentage(level);


        /* -----------------------------------------------
           NIVEAU
        ----------------------------------------------- */

        const levelElements =
            document.querySelectorAll(
                "[data-oasis-level]"
            );

        levelElements.forEach(element => {

            element.textContent =
                formatLevel(level);

        });


        /* -----------------------------------------------
           POURCENTAGE
        ----------------------------------------------- */

        const percentageElements =
            document.querySelectorAll(
                "[data-oasis-progress]"
            );

        percentageElements.forEach(element => {

            element.textContent =
                percentage + "%";

        });


        /* -----------------------------------------------
           BARRES
        ----------------------------------------------- */

        const bars =
            document.querySelectorAll(
                "[data-oasis-progress-bar]"
            );

        bars.forEach(bar => {

            bar.style.width =
                percentage + "%";

        });


        /* -----------------------------------------------
           CONTRIBUTIONS
        ----------------------------------------------- */

        const contributionElements =
            document.querySelectorAll(
                "[data-oasis-contributions]"
            );

        contributionElements.forEach(element => {

            element.textContent =
                zoneData.contributions;

        });


        /* -----------------------------------------------
           ÉVOLUTION
        ----------------------------------------------- */

        const evolution =
            getEvolution(
                zone,
                level
            );

        if (!evolution) return;


        const nameElements =
            document.querySelectorAll(
                "[data-oasis-evolution-name]"
            );

        nameElements.forEach(element => {

            element.textContent =
                evolution.name;

        });


        const descriptionElements =
            document.querySelectorAll(
                "[data-oasis-evolution-description]"
            );

        descriptionElements.forEach(element => {

            element.textContent =
                evolution.description;

        });


        const statusElements =
            document.querySelectorAll(
                "[data-oasis-status]"
            );

        statusElements.forEach(element => {

            element.textContent =
                "ÉVOLUTION " +
                formatLevel(level);

        });


        /* -----------------------------------------------
           SÉLECTEURS
        ----------------------------------------------- */

        const buttons =
            document.querySelectorAll(
                "[data-oasis-level-button]"
            );

        buttons.forEach(button => {

            const buttonLevel =
                Number(
                    button.dataset.oasisLevelButton
                );

            button.classList.toggle(
                "active",
                buttonLevel === level
            );

        });


        /* -----------------------------------------------
           CLASSE DU NIVEAU
        ----------------------------------------------- */

        document.body.dataset.oasisZone =
            zone;

        document.body.dataset.oasisLevel =
            level;

    }


    /* =====================================================
       BOUTONS DE NIVEAUX
    ===================================================== */

    function initLevelButtons() {

        const buttons =
            document.querySelectorAll(
                "[data-oasis-level-button]"
            );

        buttons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const level =
                        Number(
                            button.dataset.oasisLevelButton
                        );

                    const zone =
                        button.dataset.oasisZone ||
                        getZoneFromPage();

                    setZoneLevel(
                        zone,
                        level
                    );

                }
            );

        });

    }


    /* =====================================================
       BOUTONS DE CONTRIBUTION
    ===================================================== */

    function initContributionButtons() {

        const buttons =
            document.querySelectorAll(
                "[data-oasis-contribute]"
            );

        buttons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const zone =
                        button.dataset.oasisZone ||
                        getZoneFromPage();

                    const amount =
                        Number(
                            button.dataset.oasisContribute
                        ) || 1;

                    addContribution(
                        zone,
                        amount
                    );

                }
            );

        });

    }


    /* =====================================================
       ANNONCE D'ÉVOLUTION
    ===================================================== */

    function announceEvolution(zone, level) {

        const milestoneLevels =
            [10, 20, 30, 40, 50];

        if (
            !milestoneLevels.includes(level)
        ) {

            return;

        }

        const names = {

            island: "l'île",

            village: "le village",

            port: "le port",

            foret: "la forêt"

        };

        const zoneName =
            names[zone] || "Oasis";


        showNotification(
            "🌴 Nouvelle évolution !",
            `${zoneName} atteint l'évolution ${formatLevel(level)} !`
        );

    }


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function showNotification(title, message) {

        let container =
            document.querySelector(
                ".oasis-notifications"
            );


        if (!container) {

            container =
                document.createElement("div");

            container.className =
                "oasis-notifications";

            Object.assign(
                container.style,
                {
                    position: "fixed",
                    right: "20px",
                    bottom: "20px",
                    zIndex: "99999",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    width: "min(360px, calc(100% - 40px))"
                }
            );

            document.body.appendChild(
                container
            );

        }


        const notification =
            document.createElement("div");


        Object.assign(
            notification.style,
            {
                padding: "16px 18px",
                borderRadius: "18px",
                background: "rgba(25,45,35,.94)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "white",
                boxShadow: "0 20px 45px rgba(0,0,0,.25)",
                backdropFilter: "blur(15px)",
                transform: "translateY(20px)",
                opacity: "0",
                transition: ".3s ease"
            }
        );


        notification.innerHTML = `

            <strong
                style="
                    display:block;
                    font-size:14px;
                    margin-bottom:5px;
                "
            >
                ${title}
            </strong>

            <span
                style="
                    display:block;
                    font-size:11px;
                    opacity:.75;
                    line-height:1.5;
                "
            >
                ${message}
            </span>

        `;


        container.appendChild(
            notification
        );


        requestAnimationFrame(() => {

            notification.style.opacity =
                "1";

            notification.style.transform =
                "translateY(0)";

        });


        setTimeout(() => {

            notification.style.opacity =
                "0";

            notification.style.transform =
                "translateY(15px)";

            setTimeout(() => {

                notification.remove();

            }, 300);

        }, 4000);

    }


    /* =====================================================
       NAVIGATION ACTIVE
    ===================================================== */

    function initNavigation() {

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        const links =
            document.querySelectorAll(
                ".nav-links a"
            );


        links.forEach(link => {

            const href =
                link.getAttribute("href");

            if (!href) return;


            const cleanHref =
                href
                    .split("#")[0]
                    .split("/")
                    .pop()
                    .toLowerCase();


            if (
                cleanHref === currentPage
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

    }


    /* =====================================================
       ANIMATION AU SCROLL
    ===================================================== */

    function initScrollAnimations() {

        const elements =
            document.querySelectorAll(
                "[data-oasis-reveal]"
            );


        if (!elements.length) {

            return;

        }


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "is-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: .12
                }
            );


        elements.forEach(element => {

            observer.observe(
                element
            );

        });

    }


    /* =====================================================
       COMPTEUR ANIMÉ
    ===================================================== */

    function initCounters() {

        const counters =
            document.querySelectorAll(
                "[data-oasis-counter]"
            );


        counters.forEach(counter => {

            const target =
                Number(
                    counter.dataset.oasisCounter
                ) || 0;

            const duration =
                Number(
                    counter.dataset.oasisDuration
                ) || 900;

            let start = null;


            function animate(timestamp) {

                if (!start) {

                    start = timestamp;

                }


                const progress =
                    Math.min(
                        (timestamp - start) /
                        duration,
                        1
                    );


                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                counter.textContent =
                    Math.floor(
                        eased * target
                    );


                if (progress < 1) {

                    requestAnimationFrame(
                        animate
                    );

                } else {

                    counter.textContent =
                        target;

                }

            }


            const observer =
                new IntersectionObserver(
                    entries => {

                        if (
                            entries[0].isIntersecting
                        ) {

                            requestAnimationFrame(
                                animate
                            );

                            observer.disconnect();

                        }

                    }
                );


            observer.observe(
                counter
            );

        });

    }


    /* =====================================================
       SCROLL TOP
    ===================================================== */

    function initScrollTop() {

        const buttons =
            document.querySelectorAll(
                "[data-oasis-top]"
            );


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );

        });

    }


    /* =====================================================
       LIENS DOUX VERS LES SECTIONS
    ===================================================== */

    function initSmoothAnchors() {

        document
            .querySelectorAll(
                'a[href^="#"]'
            )
            .forEach(link => {

                link.addEventListener(
                    "click",
                    event => {

                        const targetId =
                            link.getAttribute(
                                "href"
                            );

                        if (
                            !targetId ||
                            targetId === "#"
                        ) {

                            return;

                        }


                        const target =
                            document.querySelector(
                                targetId
                            );


                        if (!target) {

                            return;

                        }


                        event.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }
                );

            });

    }


    /* =====================================================
       EXPOSER LES DONNÉES POUR DEBUG / AUTRES SCRIPTS
    ===================================================== */

    window.Oasis = {

        getData() {

            return oasisData;

        },


        save() {

            saveData(
                oasisData
            );

        },


        getZone(zone) {

            return getZoneData(
                zone
            );

        },


        setLevel(zone, level) {

            setZoneLevel(
                zone,
                level
            );

        },


        contribute(zone, amount = 1) {

            addContribution(
                zone,
                amount
            );

        },


        getEvolution(zone, level) {

            return getEvolution(
                zone,
                level
            );

        },


        reset() {

            oasisData =
                structuredClone(
                    CONFIG.defaultData
                );

            saveData(
                oasisData
            );

            updatePage();

        }

    };


    /* =====================================================
       INITIALISATION
    ===================================================== */

    initNavigation();

    initLevelButtons();

    initContributionButtons();

    initScrollAnimations();

    initCounters();

    initScrollTop();

    initSmoothAnchors();

    updatePage();


    console.log(
        "🌴 Oasis • script.js chargé"
    );

});
```
