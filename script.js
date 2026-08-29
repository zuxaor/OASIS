/* =========================================================
   OASIS • SCRIPT PRINCIPAL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🌴 Oasis chargé.");

    /* =====================================================
       DATABASE
    ===================================================== */

    let oasisData = {
        ile: {
            niveau: 1,
            contributions: 0,
            progression: 0
        },

        zones: {
            village: {
                niveau: 1
            },

            port: {
                niveau: 1
            },

            foret: {
                niveau: 1
            }
        },

        evolutions: {
            actuelle: 1,
            maximum: 50
        }
    };


    /* =====================================================
       CHARGEMENT DATABASE.JSON
    ===================================================== */

    async function loadDatabase() {

        try {

            const response =
                await fetch("./database.json");

            if (!response.ok) {
                throw new Error(
                    "Impossible de charger database.json"
                );
            }

            const database =
                await response.json();

            oasisData = {
                ...oasisData,
                ...database,

                ile: {
                    ...oasisData.ile,
                    ...(database.ile || {})
                },

                zones: {
                    ...oasisData.zones,
                    ...(database.zones || {})
                },

                evolutions: {
                    ...oasisData.evolutions,
                    ...(database.evolutions || {})
                }
            };


            console.log(
                "🌴 Database Oasis chargée :",
                oasisData
            );


            updateSite();

        } catch (error) {

            console.error(
                "❌ Erreur database.json :",
                error
            );

        }

    }


    /* =====================================================
       MISE À JOUR DU SITE
    ===================================================== */

    function updateSite() {

        updateIsland();

        updateZones();

        updateEvolution();

    }


    /* =====================================================
       ÎLE
    ===================================================== */

    function updateIsland() {

        const level =
            oasisData.ile.niveau;

        const contribution =
            oasisData.ile.contributions;

        const progression =
            oasisData.ile.progression;


        const elements = {

            level:
                document.querySelector(
                    "[data-oasis-level]"
                ),

            contributions:
                document.querySelector(
                    "[data-oasis-contributions]"
                ),

            progression:
                document.querySelector(
                    "[data-oasis-progression]"
                ),

            progressBar:
                document.querySelector(
                    "[data-oasis-progress-bar]"
                )

        };


        if (elements.level) {

            elements.level.textContent =
                level;

        }


        if (elements.contributions) {

            elements.contributions.textContent =
                contribution;

        }


        if (elements.progression) {

            elements.progression.textContent =
                progression + "%";

        }


        if (elements.progressBar) {

            elements.progressBar.style.width =
                progression + "%";

        }

    }


    /* =====================================================
       ZONES
    ===================================================== */

    function updateZones() {

        const villageLevel =
            oasisData.zones.village.niveau;

        const portLevel =
            oasisData.zones.port.niveau;

        const foretLevel =
            oasisData.zones.foret.niveau;


        const village =
            document.querySelector(
                "[data-zone-village]"
            );

        const port =
            document.querySelector(
                "[data-zone-port]"
            );

        const foret =
            document.querySelector(
                "[data-zone-foret]"
            );


        if (village) {

            village.textContent =
                villageLevel;

        }


        if (port) {

            port.textContent =
                portLevel;

        }


        if (foret) {

            foret.textContent =
                foretLevel;

        }

    }


    /* =====================================================
       ÉVOLUTION
    ===================================================== */

    function updateEvolution() {

        const current =
            oasisData.evolutions.actuelle;

        const maximum =
            oasisData.evolutions.maximum;


        const evolutionLevel =
            document.querySelector(
                "[data-evolution-level]"
            );


        const evolutionProgress =
            document.querySelector(
                "[data-evolution-progress]"
            );


        const evolutionBar =
            document.querySelector(
                "[data-evolution-bar]"
            );


        const percentage =
            Math.round(
                (current / maximum) * 100
            );


        if (evolutionLevel) {

            evolutionLevel.textContent =
                current + " / " + maximum;

        }


        if (evolutionProgress) {

            evolutionProgress.textContent =
                percentage + "%";

        }


        if (evolutionBar) {

            evolutionBar.style.width =
                percentage + "%";

        }

    }


    /* =====================================================
       ANIMATION AU SCROLL
    ===================================================== */

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    document
        .querySelectorAll(
            ".feature-card, .section-title, .section-text, .timeline-item, .evolution-panel"
        )
        .forEach(element => {

            observer.observe(element);

        });


    /* =====================================================
       BOUTONS D'ÉVOLUTION
    ===================================================== */

    document
        .querySelectorAll(
            "[data-evolution-button]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const level =
                        Number(
                            button.dataset.evolutionButton
                        );


                    if (!level) return;


                    oasisData.evolutions.actuelle =
                        level;


                    updateEvolution();


                    document
                        .querySelectorAll(
                            "[data-evolution-button]"
                        )
                        .forEach(other => {

                            other.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );

                }
            );

        });


    /* =====================================================
       LANCEMENT
    ===================================================== */

    loadDatabase();

});
