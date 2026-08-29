document.addEventListener("DOMContentLoaded", () => {

```
/* =========================================================
   NAVIGATION
========================================================= */

const currentPage =
    window.location.pathname
        .split("/")
        .pop()
        .toLowerCase() || "index.html";

document.querySelectorAll(".nav-links a").forEach(link => {

    const href =
        link.getAttribute("href") || "";

    const targetPage =
        href.split("#")[0]
            .split("/")
            .pop()
            .toLowerCase();

    link.classList.remove("active");

    if (
        targetPage === currentPage ||
        (currentPage === "" && targetPage === "index.html")
    ) {
        link.classList.add("active");
    }

});


/* =========================================================
   SCROLL
========================================================= */

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", event => {

        const targetId =
            link.getAttribute("href");

        if (
            !targetId ||
            targetId === "#"
        ) {
            return;
        }

        const target =
            document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


/* =========================================================
   APPARITION DES ÉLÉMENTS
========================================================= */

const animatedElements =
    document.querySelectorAll(
        ".feature-card, .port-card, .timeline-item, .timeline-card, .evolution-panel, .level-button"
    );


if ("IntersectionObserver" in window) {

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(
                        "visible"
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


    animatedElements.forEach(element => {

        element.classList.add(
            "scroll-hidden"
        );

        observer.observe(element);

    });

}


/* =========================================================
   FORÊT
========================================================= */

const forestEvolution = {

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

};


const forestButtons =
    document.querySelectorAll(
        ".level-button"
    );

const forestLevel =
    document.getElementById(
        "forest-level"
    );

const forestName =
    document.getElementById(
        "forest-name"
    );

const forestDescription =
    document.getElementById(
        "forest-description"
    );

const forestProgress =
    document.getElementById(
        "forest-progress"
    );

const forestProgressText =
    document.getElementById(
        "forest-progress-text"
    );

const forestStatus =
    document.getElementById(
        "forest-status"
    );


function showForestEvolution(level) {

    const evolution =
        forestEvolution[level];

    if (!evolution) {
        return;
    }


    if (forestLevel) {

        forestLevel.innerHTML =
            String(level).padStart(2, "0") +
            " <span>/ 50</span>";

    }


    if (forestName) {

        forestName.textContent =
            evolution.name;

    }


    if (forestDescription) {

        forestDescription.textContent =
            evolution.description;

    }


    const percentage =
        Math.round(
            (level / 50) * 100
        );


    if (forestProgress) {

        forestProgress.style.width =
            percentage + "%";

    }


    if (forestProgressText) {

        forestProgressText.textContent =
            percentage + "%";

    }


    if (forestStatus) {

        forestStatus.textContent =
            "ÉVOLUTION " +
            String(level).padStart(2, "0");

    }


    forestButtons.forEach(button => {

        button.classList.toggle(
            "active",
            Number(button.dataset.level) === level
        );

    });

}


forestButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const level =
                Number(
                    button.dataset.level
                );

            showForestEvolution(level);

        }
    );

});


if (
    forestButtons.length > 0 &&
    forestLevel
) {

    showForestEvolution(1);

}


/* =========================================================
   PETITE ANIMATION DU BOUTON DISCORD
========================================================= */

document
    .querySelectorAll(".nav-discord")
    .forEach(button => {

        button.addEventListener(
            "mouseenter",
            () => {
                button.classList.add(
                    "discord-hover"
                );
            }
        );

        button.addEventListener(
            "mouseleave",
            () => {
                button.classList.remove(
                    "discord-hover"
                );
            }
        );

    });


/* =========================================================
   ANNÉE AUTOMATIQUE
========================================================= */

document
    .querySelectorAll(".footer-text")
    .forEach(element => {

        if (
            element.textContent.includes(
                "© 2026"
            )
        ) {

            element.textContent =
                element.textContent.replace(
                    "© 2026",
                    "© " +
                    new Date().getFullYear()
                );

        }

    });
```

});
