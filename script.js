/* =========================================================
   OASIS • SCRIPT PRINCIPAL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ANIMATION DES ÉLÉMENTS AU SCROLL
    ====================================================== */

    const animatedElements =
        document.querySelectorAll(
            ".feature-card, .timeline-item, .evolution-panel, .cta-box"
        );

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    animatedElements.forEach(element => {

        observer.observe(element);

    });


    /* =====================================================
       NAVBAR AU SCROLL
    ====================================================== */

    const navbar =
        document.querySelector(".navbar");


    if (navbar) {

        window.addEventListener(
            "scroll",
            () => {

                if (window.scrollY > 40) {

                    navbar.classList.add("scrolled");

                } else {

                    navbar.classList.remove("scrolled");

                }

            }
        );

    }


    /* =====================================================
       ÉVOLUTIONS
    ====================================================== */

    const evolutionData = {

        1: {
            name: "Les premiers pas",
            description:
                "Oasis commence son histoire. L'île est encore jeune et attend les premières contributions de sa communauté."
        },

        10: {
            name: "Le développement",
            description:
                "La communauté commence à transformer l'île. Les premières traces d'une véritable civilisation apparaissent."
        },

        20: {
            name: "L'expansion",
            description:
                "Oasis grandit. De nouvelles zones se développent et l'île devient progressivement plus vivante."
        },

        30: {
            name: "La transformation",
            description:
                "L'île connaît une véritable transformation. Les différentes zones prennent progressivement leur identité."
        },

        40: {
            name: "L'apogée",
            description:
                "Oasis atteint une nouvelle maturité. La communauté a profondément transformé son environnement."
        },

        50: {
            name: "L'évolution finale",
            description:
                "La 50ᵉ évolution est atteinte. L'histoire de la transformation d'Oasis arrive à son apogée."
        }

    };


    /* =====================================================
       ÉLÉMENTS DE LA PAGE
    ====================================================== */

    const levelButtons =
        document.querySelectorAll(".level-button");


    const levelElement =
        document.getElementById("island-level") ||
        document.getElementById("forest-level");


    const nameElement =
        document.getElementById("island-name") ||
        document.getElementById("forest-name");


    const descriptionElement =
        document.getElementById("island-description") ||
        document.getElementById("forest-description");


    const progressElement =
        document.getElementById("island-progress") ||
        document.getElementById("forest-progress");


    const progressTextElement =
        document.getElementById("island-progress-text") ||
        document.getElementById("forest-progress-text");


    const statusElement =
        document.getElementById("island-status") ||
        document.getElementById("forest-status");


    /* =====================================================
       AFFICHAGE D'UNE ÉVOLUTION
    ====================================================== */

    function showEvolution(level) {

        const evolution =
            evolutionData[level];


        if (!evolution) {
            return;
        }


        if (levelElement) {

            levelElement.innerHTML =
                String(level).padStart(2, "0") +
                ' <span>/ 50</span>';

        }


        if (nameElement) {

            nameElement.textContent =
                evolution.name;

        }


        if (descriptionElement) {

            descriptionElement.textContent =
                evolution.description;

        }


        const percentage =
            Math.round(
                (level / 50) * 100
            );


        if (progressElement) {

            progressElement.style.width =
                percentage + "%";

        }


        if (progressTextElement) {

            progressTextElement.textContent =
                percentage + "%";

        }


        if (statusElement) {

            statusElement.textContent =
                "ÉVOLUTION " +
                String(level).padStart(2, "0");

        }


        levelButtons.forEach(button => {

            button.classList.remove("active");


            if (
                Number(button.dataset.level) ===
                Number(level)
            ) {

                button.classList.add("active");

            }

        });

    }


    /* =====================================================
       BOUTONS D'ÉVOLUTION
    ====================================================== */

    levelButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const level =
                    Number(
                        button.dataset.level
                    );


                showEvolution(level);

            }
        );

    });


    /* =====================================================
       NIVEAU INITIAL
    ====================================================== */

    if (
        levelElement ||
        nameElement ||
        descriptionElement
    ) {

        showEvolution(1);

    }


    /* =====================================================
       LIENS ANCRES
    ====================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute("href");


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


    /* =====================================================
       ANNÉE AUTOMATIQUE
    ====================================================== */

    document
        .querySelectorAll(".current-year")
        .forEach(element => {

            element.textContent =
                new Date().getFullYear();

        });


    /* =====================================================
       CONSOLE
    ====================================================== */

    console.log(
        "🌴 Oasis • Site chargé avec succès."
    );

});
