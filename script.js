/* =========================================================
   🌴 OASIS — APPLICATION CORE
   ========================================================= */

(() => {
    "use strict";

    const CLANS = Object.freeze([
        { id: "palmiers", name: "Palmiers", emoji: "🌴" },
        { id: "lagune", name: "Lagune", emoji: "🏝️" },
        { id: "hibiscus", name: "Hibiscus", emoji: "🌺" },
        { id: "corail", name: "Corail", emoji: "🐚" },
        { id: "perroquets", name: "Perroquets", emoji: "🦜" },
        { id: "sirenes", name: "Sirènes", emoji: "🌊" }
    ]);

    const INTERESTS = Object.freeze([
        ["creative", "🎨 Créatif"],
        ["music", "🎵 Musicien"],
        ["cinema", "🎬 Cinéma / Séries"],
        ["reading", "📚 Lecture"],
        ["gaming", "🎮 Gaming"],
        ["technology", "💻 Technologie"],
        ["photography", "📸 Photographie"],
        ["travel", "✈️ Voyage"],
        ["sport", "⚽ Sport"],
        ["cooking", "🍳 Cuisine"],
        ["animals", "🐾 Animaux"],
        ["automobile", "🚗 Automobile"],
        ["anime", "🎤 Anime / Manga"],
        ["astronomy", "🌌 Astronomie"],
        ["science", "🧠 Sciences"]
    ]);

    const state = {
        user: null,
        notifications: [],
        route: getRoute(),
        loading: false
    };

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];

    function getRoute() {
        const hash = window.location.hash
            .replace(/^#\/?/, "")
            .trim();

        return hash || "home";
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("fr-FR")
            .format(Number(value) || 0);
    }

    function clanById(id) {
        return CLANS.find(clan => clan.id === id) || null;
    }

    function showToast(title, message, icon = "🌴") {
        const root = $("#toast-root");

        if (!root) return;

        const toast = document.createElement("article");

        toast.className = "toast";

        toast.innerHTML = `
            <div class="toast-icon">
                ${escapeHTML(icon)}
            </div>

            <div class="toast-content">
                <p class="toast-title">
                    ${escapeHTML(title)}
                </p>

                <p class="toast-message">
                    ${escapeHTML(message)}
                </p>
            </div>
        `;

        root.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, 5200);
    }

    function setLoading(value) {
        state.loading = value;

        const loader = $("#page-loader");

        if (loader) {
            loader.hidden = !value;
        }
    }

    function updateNavigation(route) {
        $$("[data-route]").forEach(link => {
            link.classList.toggle(
                "active",
                link.dataset.route === route
            );
        });
    }

    function updateUserChrome() {
        const user = state.user;

        const coinNode = $("#header-coins span");
        const avatar = $("#header-avatar");
        const sidebarName = $("#sidebar-display-name");
        const sidebarClan = $("#sidebar-clan");

        if (!user) {
            if (coinNode) coinNode.textContent = "0";
            if (avatar) avatar.textContent = "👤";
            if (sidebarName) sidebarName.textContent = "Invité";
            if (sidebarClan) sidebarClan.textContent = "Aucun clan";

            return;
        }

        if (coinNode) {
            coinNode.textContent = formatNumber(user.coins);
        }

        if (avatar) {
            avatar.innerHTML = user.avatar_url
                ? `<img src="${escapeHTML(user.avatar_url)}" alt="Avatar">`
                : "👤";
        }

        if (sidebarName) {
            sidebarName.textContent =
                user.display_name ||
                user.username ||
                "Membre";
        }

        if (sidebarClan) {
            const clan = clanById(user.clan);

            sidebarClan.textContent = clan
                ? `${clan.emoji} ${clan.name}`
                : "Aucun clan";
        }
    }

    function renderPage(content) {
        const root = $("#page-root");

        if (!root) return;

        root.innerHTML = `
            <div class="page-enter">
                ${content}
            </div>
        `;
    }

    function pageHeader(eyebrow, title, description) {
        return `
            <div class="page-header">
                <span class="eyebrow">
                    ${escapeHTML(eyebrow)}
                </span>

                <h1>
                    ${escapeHTML(title)}
                </h1>

                <p>
                    ${escapeHTML(description)}
                </p>
            </div>
        `;
    }

    function statCard(icon, label, value, note = "") {
        return `
            <article class="stat-card oasis-card">

                <div class="stat-icon">
                    ${icon}
                </div>

                <div>
                    <span>
                        ${escapeHTML(label)}
                    </span>

                    <strong>
                        ${escapeHTML(value)}
                    </strong>

                    ${
                        note
                            ? `<small>${escapeHTML(note)}</small>`
                            : ""
                    }
                </div>

            </article>
        `;
    }

    function homePage() {
        return `
            <section class="hero oasis-card">

                <div class="hero-copy">

                    <span class="eyebrow">
                        🌴 Communauté Oasis
                    </span>

                    <h1>
                        Bienvenue sur
                        <span>Oasis</span>
                    </h1>

                    <p>
                        Une communauté où chacun peut participer,
                        progresser, rencontrer de nouvelles personnes
                        et faire évoluer Oasis.
                    </p>

                    <div class="hero-actions">

                        <a
                            class="button button-primary"
                            href="#/dashboard"
                        >
                            Découvrir Oasis
                        </a>

                        <a
                            class="button button-secondary"
                            href="#/clans"
                        >
                            Voir les clans
                        </a>

                    </div>

                </div>

                <div
                    class="hero-orb"
                    aria-hidden="true"
                >
                    🏝️
                </div>

            </section>

            <section class="section-block">

                <div class="section-heading">

                    <span>🌴</span>

                    <div>
                        <h2>
                            La communauté
                        </h2>

                        <p>
                            Les statistiques proviennent
                            de la source de données Oasis.
                        </p>
                    </div>

                </div>

                <div class="stats-grid">

                    ${statCard(
                        "👥",
                        "Membres",
                        "—"
                    )}

                    ${statCard(
                        "🏕️",
                        "Clans",
                        String(CLANS.length),
                        "Clans officiels"
                    )}

                    ${statCard(
                        "🏝️",
                        "Île Oasis",
                        "—"
                    )}

                    ${statCard(
                        "💰",
                        "Coins en circulation",
                        "—"
                    )}

                </div>

            </section>

            <section class="section-block">

                <div class="section-heading">

                    <span>🏕️</span>

                    <div>
                        <h2>
                            Les six clans
                        </h2>

                        <p>
                            Les seuls clans officiels d'Oasis.
                        </p>
                    </div>

                </div>

                <div class="cards-grid clans-preview">

                    ${CLANS.map(clan => `
                        <a
                            class="oasis-card clan-card"
                            href="#/clans"
                        >

                            <span class="clan-emoji">
                                ${clan.emoji}
                            </span>

                            <h3>
                                ${clan.name}
                            </h3>

                            <span>
                                Voir le clan →
                            </span>

                        </a>
                    `).join("")}

                </div>

            </section>
        `;
    }

    function dashboardPage() {
        const user = state.user;

        const clan = user
            ? clanById(user.clan)
            : null;

        const level = user?.level ?? 0;
        const xp = user?.xp ?? 0;
        const coins = user?.coins ?? 0;

        return `
            ${pageHeader(
                "🌴 Oasis",
                "Dashboard",
                "Votre espace communautaire en un seul endroit."
            )}

            <section class="stats-grid dashboard-stats">

                ${statCard(
                    "💰",
                    "Oasis Coins",
                    formatNumber(coins)
                )}

                ${statCard(
                    "⭐",
                    "Niveau",
                    String(level),
                    `${formatNumber(xp)} XP`
                )}

                ${statCard(
                    clan?.emoji || "🏕️",
                    "Clan",
                    clan?.name || "Aucun clan"
                )}

                ${statCard(
                    "🏝️",
                    "Île Oasis",
                    "—",
                    "Progression communautaire"
                )}

            </section>

            <section class="dashboard-grid">

                <article class="oasis-card panel-card">

                    <div class="card-heading">

                        <h2>
                            Progression
                        </h2>

                        <span>
                            ⭐ Niveau ${escapeHTML(level)}
                        </span>

                    </div>

                    <div class="progress-track">
                        <span
                            style="width:${Math.min(
                                100,
                                xp % 100
                            )}%"
                        ></span>
                    </div>

                    <p class="muted">
                        ${formatNumber(xp)} XP
                    </p>

                </article>

                <article class="oasis-card panel-card">

                    <div class="card-heading">

                        <h2>
                            Actions rapides
                        </h2>

                    </div>

                    <div class="quick-actions">

                        <a
                            class="button button-primary"
                            href="#/daily"
                        >
                            🎁 Daily
                        </a>

                        <a
                            class="button button-secondary"
                            href="#/work"
                        >
                            💼 Work
                        </a>

                        <a
                            class="button button-secondary"
                            href="#/boutique"
                        >
                            🏪 Boutique
                        </a>

                        <a
                            class="button button-secondary"
                            href="#/ile"
                        >
                            🏝️ Île
                        </a>

                    </div>

                </article>

            </section>
        `;
    }

    function clansPage() {
        return `
            ${pageHeader(
                "🏕️ Communauté",
                "Clans Oasis",
                "Les six clans officiels de la communauté."
            )}

            <div class="cards-grid clans-grid">

                ${CLANS.map(clan => `
                    <article class="oasis-card clan-card clan-card-large">

                        <div class="clan-card-top">

                            <span class="clan-emoji">
                                ${clan.emoji}
                            </span>

                            <span class="badge">
                                Officiel
                            </span>

                        </div>

                        <h2>
                            ${clan.name}
                        </h2>

                        <p>
                            Clan officiel Oasis.
                            Les statistiques et objectifs
                            sont chargés depuis les données
                            persistantes.
                        </p>

                        <div class="mini-stats">

                            <span>
                                👥 — membres
                            </span>

                            <span>
                                🏆 — points
                            </span>

                        </div>

                        <a
                            class="button button-secondary"
                            href="#/clan"
                        >
                            Voir mon clan
                        </a>

                    </article>
                `).join("")}

            </div>
        `;
    }

    function rankingsPage() {
        const tabs = [
            "Général",
            "Coins",
            "XP",
            "Île",
            "Missions",
            "Défis",
            "Succès",
            "Clans"
        ];

        return `
            ${pageHeader(
                "🏆 Compétition",
                "Classements",
                "Classements calculés à partir des données réelles d'Oasis."
            )}

            <div
                class="tabs"
                role="tablist"
            >

                ${tabs.map((name, index) => `
                    <button
                        class="tab ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                        type="button"
                        data-ranking="${escapeHTML(name)}"
                    >
                        ${escapeHTML(name)}
                    </button>
                `).join("")}

            </div>

            <section class="oasis-card ranking-card">

                <div class="podium">

                    <div class="podium-place second">
                        <span>🥈</span>
                        <strong>—</strong>
                        <small>2e</small>
                    </div>

                    <div class="podium-place first">
                        <span>🥇</span>
                        <strong>—</strong>
                        <small>1er</small>
                    </div>

                    <div class="podium-place third">
                        <span>🥉</span>
                        <strong>—</strong>
                        <small>3e</small>
                    </div>

                </div>

                <div class="ranking-empty">

                    <span>
                        🏝️
                    </span>

                    <h2>
                        Données de classement
                    </h2>

                    <p>
                        Aucun score fictif n'est injecté.
                        Les données apparaîtront depuis
                        la source persistante.
                    </p>

                </div>

            </section>
        `;
    }

    function islandPage() {
        return `
            ${pageHeader(
                "🏝️ Oasis",
                "Île Oasis",
                "Une progression communautaire composée exactement de 50 niveaux."
            )}

            <section class="island-stage oasis-card">

                <div
                    class="island-visual"
                    aria-hidden="true"
                >
                    <div class="island-sun"></div>

                    <div class="island-land">
                        🌴 🏝️ 🌊
                    </div>
                </div>

                <div class="island-info">

                    <span class="eyebrow">
                        Progression communautaire
                    </span>

                    <h2>
                        Niveau — / 50
                    </h2>

                    <p>
                        Les niveaux de l'île ne donnent
                        aucun avantage ni aucune récompense.
                    </p>

                    <div class="progress-track large">
                        <span style="width:0%"></span>
                    </div>

                    <strong>
                        — / objectif
                    </strong>

                    <a
                        class="button button-primary"
                        href="#/contribuer-ile"
                    >
                        🤝 Contribuer à l'île
                    </a>

                </div>

            </section>
        `;
    }

    function genericPage(title, description, icon) {
        return `
            ${pageHeader(
                icon,
                title,
                description
            )}

            <section class="oasis-card empty-state">

                <span>
                    ${icon}
                </span>

                <h2>
                    ${escapeHTML(title)}
                </h2>

                <p>
                    Cette page est prête à recevoir
                    les données persistantes et les
                    actions sécurisées du serveur.
                </p>

            </section>
        `;
    }

    function routePage(route) {
        switch (route) {

            case "home":
                return homePage();

            case "dashboard":
                return dashboardPage();

            case "clans":
                return clansPage();

            case "classements":
                return rankingsPage();

            case "ile":
                return islandPage();

            case "profil":
                return genericPage(
                    "Profil",
                    "Votre espace personnel.",
                    "👤"
                );

            case "profils":
                return genericPage(
                    "Profils",
                    "Découvrez les membres de la communauté.",
                    "👥"
                );

            case "missions":
                return genericPage(
                    "Missions",
                    "Missions actives de votre clan.",
                    "🎯"
                );

            case "defis":
                return genericPage(
                    "Défis",
                    "Défis actifs de votre clan.",
                    "⚔️"
                );

            case "succes":
                return genericPage(
                    "Succès",
                    "Vos succès débloqués et verrouillés.",
                    "🏅"
                );

            case "oasis-coins":
                return genericPage(
                    "Oasis Coins",
                    "Votre économie Oasis.",
                    "💰"
                );

            case "daily":
                return genericPage(
                    "Daily",
                    "Récompense quotidienne de 500 Oasis Coins avec cooldown serveur de 24 heures.",
                    "🎁"
                );

            case "work":
                return genericPage(
                    "Work",
                    "Récompense de 100 à 300 Oasis Coins avec cooldown serveur de 1 heure.",
                    "💼"
                );

            case "boutique":
                return genericPage(
                    "Boutique",
                    "Articles et conditions provenant de la source de vérité Oasis.",
                    "🏪"
                );

            case "acheter":
                return genericPage(
                    "Acheter",
                    "Création sécurisée d'une demande d'achat.",
                    "🛒"
                );

            case "tickets":
                return genericPage(
                    "Tickets",
                    "Suivi de vos demandes boutique.",
                    "🎫"
                );

            case "achats":
                return genericPage(
                    "Achats",
                    "Historique de vos achats.",
                    "📦"
                );

            case "contribuer-ile":
                return genericPage(
                    "Contribuer à l'île",
                    "Contribution réelle en Oasis Coins.",
                    "🤝"
                );

            case "evenements":
                return genericPage(
                    "Événements",
                    "Événements de la communauté.",
                    "🎉"
                );

            case "parametres":
                return genericPage(
                    "Paramètres",
                    "Gérez votre compte et vos préférences.",
                    "⚙️"
                );

            case "moderation":
                return genericPage(
                    "Modération",
                    "Interface réservée au staff autorisé.",
                    "🛡️"
                );

            case "tickets-staff":
                return genericPage(
                    "Gestion des tickets",
                    "Traitement sécurisé des tickets boutique.",
                    "🎫"
                );

            case "clan":
                return genericPage(
                    "Mon clan",
                    "Informations de votre clan.",
                    "🏕️"
                );

            default:
                return genericPage(
                    "Page introuvable",
                    "Cette route n'existe pas dans Oasis.",
                    "🧭"
                );
        }
    }

    function render() {
        setLoading(true);

        const route = getRoute();

        state.route = route;

        updateNavigation(route);
        updateUserChrome();

        window.requestAnimationFrame(() => {

            renderPage(
                routePage(route)
            );

            setLoading(false);

            window.scrollTo({
                top: 0,
                behavior: "instant"
            });
        });
    }

    function setupCursor() {
        const cursor = $("#cursor-oasis");

        if (!cursor) return;

        const finePointer =
            window.matchMedia(
                "(pointer: fine)"
            ).matches;

        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

        if (!finePointer || reducedMotion) {
            return;
        }

        document.body.classList.add(
            "oasis-cursor-active"
        );

        cursor.style.opacity = "1";

        let targetX = -100;
        let targetY = -100;

        let currentX = targetX;
        let currentY = targetY;

        let raf = 0;

        const move = event => {
            targetX = event.clientX;
            targetY = event.clientY;

            if (!raf) {
                raf = requestAnimationFrame(
                    update
                );
            }
        };

        const update = () => {

            currentX +=
                (targetX - currentX) * 0.22;

            currentY +=
                (targetY - currentY) * 0.22;

            cursor.style.transform =
                `translate3d(
                    ${currentX}px,
                    ${currentY}px,
                    0
                ) translate3d(-50%, -50%, 0)`;

            raf = 0;

            if (
                Math.abs(targetX - currentX) > 0.5 ||
                Math.abs(targetY - currentY) > 0.5
            ) {
                raf = requestAnimationFrame(
                    update
                );
            }
        };

        const hoverIn = event => {
            if (
                event.target.closest(
                    "a,button,input,textarea,select,.oasis-card"
                )
            ) {
                cursor.classList.add(
                    "cursor-hover"
                );
            }
        };

        const hoverOut = event => {
            if (
                !event.relatedTarget ||
                !event.relatedTarget.closest?.(
                    "a,button,input,textarea,select,.oasis-card"
                )
            ) {
                cursor.classList.remove(
                    "cursor-hover"
                );
            }
        };

        window.addEventListener(
            "pointermove",
            move,
            { passive: true }
        );

        window.addEventListener(
            "pointerover",
            hoverIn,
            { passive: true }
        );

        window.addEventListener(
            "pointerout",
            hoverOut,
            { passive: true }
        );

        window.addEventListener(
            "beforeunload",
            () => {

                window.removeEventListener(
                    "pointermove",
                    move
                );

                window.removeEventListener(
                    "pointerover",
                    hoverIn
                );

                window.removeEventListener(
                    "pointerout",
                    hoverOut
                );

                if (raf) {
                    cancelAnimationFrame(raf);
                }

            },
            { once: true }
        );
    }

    function setupParticles() {
        const root =
            $(".oasis-particles");

        if (!root) return;

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            return;
        }

        if (
            !window.matchMedia(
                "(pointer: fine)"
            ).matches
        ) {
            return;
        }

        const fragment =
            document.createDocumentFragment();

        for (let i = 0; i < 18; i += 1) {

            const particle =
                document.createElement("span");

            particle.className =
                "oasis-particle";

            particle.style.left =
                `${Math.random() * 100}%`;

            particle.style.top =
                `${Math.random() * 100}%`;

            particle.style.animationDelay =
                `${Math.random() * -8}s`;

            fragment.appendChild(
                particle
            );
        }

        root.appendChild(fragment);
    }

    function setupEvents() {

        window.addEventListener(
            "hashchange",
            render
        );

        document.addEventListener(
            "click",
            event => {

                const logout =
                    event.target.closest(
                        "#logout-button"
                    );

                if (logout) {

                    state.user = null;

                    updateUserChrome();

                    showToast(
                        "Déconnexion",
                        "La session a été fermée.",
                        "↪"
                    );

                    window.location.hash =
                        "#/";
                }

                const notificationButton =
                    event.target.closest(
                        "#notifications-button"
                    );

                if (notificationButton) {

                    showToast(
                        "Notifications",
                        state.notifications.length
                            ? `${state.notifications.length} notification(s).`
                            : "Aucune nouvelle notification.",
                        "🔔"
                    );
                }

            }
        );
    }

    function init() {
        updateUserChrome();
        setupEvents();
        setupCursor();
        setupParticles();
        render();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();
