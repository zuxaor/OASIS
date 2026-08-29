/* =========================================================
   🌴 OASIS — AUTHENTIFICATION
   ========================================================= */

(() => {
    "use strict";

    const USERS_KEY = "oasis_users";
    const SESSION_KEY = "oasis_session";

    const DEFAULT_USER_DATA = {
        coins: 0,
        level: 0,
        xp: 0,
        clan: null,
        avatar_url: "",
        interests: [],
        achievements: [],
        missions: [],
        challenges: [],
        purchases: [],
        tickets: [],
        island: {
            level: 0,
            contributions: 0
        },
        created_at: null,
        last_login: null
    };

    function getUsers() {
        try {
            const users = JSON.parse(
                localStorage.getItem(USERS_KEY)
            );

            return Array.isArray(users) ? users : [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users)
        );
    }

    function getSession() {
        const username = localStorage.getItem(SESSION_KEY);

        if (!username) {
            return null;
        }

        return getUsers().find(
            user => user.username === username
        ) || null;
    }

    function setSession(username) {
        localStorage.setItem(
            SESSION_KEY,
            username
        );
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    async function hashPassword(password) {
        const data = new TextEncoder().encode(password);

        const buffer = await crypto.subtle.digest(
            "SHA-256",
            data
        );

        return [...new Uint8Array(buffer)]
            .map(byte =>
                byte.toString(16).padStart(2, "0")
            )
            .join("");
    }

    function generateId() {
        if (crypto.randomUUID) {
            return crypto.randomUUID();
        }

        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2)
        );
    }

    function createUser(username, email, password) {
        return hashPassword(password).then(passwordHash => {
            const users = getUsers();

            const normalizedUsername =
                username.trim().toLowerCase();

            const normalizedEmail =
                email.trim().toLowerCase();

            if (!normalizedUsername) {
                throw new Error(
                    "Le nom d'utilisateur est obligatoire."
                );
            }

            if (normalizedUsername.length < 3) {
                throw new Error(
                    "Le nom d'utilisateur doit contenir au moins 3 caractères."
                );
            }

            if (!/^[a-zA-Z0-9_.-]+$/.test(normalizedUsername)) {
                throw new Error(
                    "Le nom d'utilisateur contient des caractères interdits."
                );
            }

            if (!normalizedEmail) {
                throw new Error(
                    "L'adresse e-mail est obligatoire."
                );
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
                throw new Error(
                    "L'adresse e-mail n'est pas valide."
                );
            }

            if (password.length < 8) {
                throw new Error(
                    "Le mot de passe doit contenir au moins 8 caractères."
                );
            }

            if (
                users.some(
                    user =>
                        user.username === normalizedUsername
                )
            ) {
                throw new Error(
                    "Ce nom d'utilisateur est déjà utilisé."
                );
            }

            if (
                users.some(
                    user =>
                        user.email === normalizedEmail
                )
            ) {
                throw new Error(
                    "Cette adresse e-mail est déjà utilisée."
                );
            }

            const now = new Date().toISOString();

            const user = {
                id: generateId(),

                username: normalizedUsername,

                display_name: username.trim(),

                email: normalizedEmail,

                password_hash: passwordHash,

                ...structuredClone(DEFAULT_USER_DATA),

                created_at: now,

                last_login: now
            };

            users.push(user);

            saveUsers(users);

            setSession(user.username);

            return user;
        });
    }

    function login(usernameOrEmail, password) {
        return hashPassword(password).then(passwordHash => {
            const users = getUsers();

            const identifier =
                usernameOrEmail.trim().toLowerCase();

            const user = users.find(
                current =>
                    current.username === identifier ||
                    current.email === identifier
            );

            if (!user) {
                throw new Error(
                    "Identifiants incorrects."
                );
            }

            if (user.password_hash !== passwordHash) {
                throw new Error(
                    "Identifiants incorrects."
                );
            }

            user.last_login =
                new Date().toISOString();

            saveUsers(users);

            setSession(user.username);

            return user;
        });
    }

    function logout() {
        clearSession();

        window.location.reload();
    }

    function updateUser(patch) {
        const session = getSession();

        if (!session) {
            return null;
        }

        const users = getUsers();

        const index = users.findIndex(
            user => user.id === session.id
        );

        if (index === -1) {
            return null;
        }

        users[index] = {
            ...users[index],
            ...patch
        };

        saveUsers(users);

        return users[index];
    }

    function showAuthScreen() {
        if (document.getElementById("oasis-auth")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "oasis-auth-style";

        style.textContent = `
            #oasis-auth {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                background:
                    radial-gradient(
                        circle at 20% 20%,
                        rgba(33, 170, 139, .18),
                        transparent 35%
                    ),
                    radial-gradient(
                        circle at 80% 80%,
                        rgba(15, 117, 103, .16),
                        transparent 35%
                    ),
                    #071b1a;
                overflow-y: auto;
            }

            .oasis-auth-box {
                width: min(440px, 100%);
                padding: 34px;
                border-radius: 24px;
                background: rgba(8, 30, 29, .92);
                border: 1px solid rgba(255,255,255,.08);
                box-shadow: 0 30px 100px rgba(0,0,0,.45);
                backdrop-filter: blur(20px);
            }

            .oasis-auth-brand {
                text-align: center;
                margin-bottom: 28px;
            }

            .oasis-auth-brand-icon {
                font-size: 54px;
                display: block;
                margin-bottom: 8px;
            }

            .oasis-auth-brand h1 {
                margin: 0;
                color: white;
                font-size: 32px;
                font-weight: 800;
            }

            .oasis-auth-brand p {
                margin: 8px 0 0;
                color: rgba(255,255,255,.58);
            }

            .oasis-auth-tabs {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 22px;
            }

            .oasis-auth-tab {
                border: 0;
                border-radius: 12px;
                padding: 12px;
                cursor: pointer;
                color: rgba(255,255,255,.65);
                background: rgba(255,255,255,.05);
                font-weight: 700;
            }

            .oasis-auth-tab.active {
                color: white;
                background: rgba(44, 183, 151, .2);
            }

            .oasis-auth-field {
                margin-bottom: 15px;
            }

            .oasis-auth-field label {
                display: block;
                margin-bottom: 7px;
                color: rgba(255,255,255,.75);
                font-size: 13px;
                font-weight: 700;
            }

            .oasis-auth-field input {
                width: 100%;
                box-sizing: border-box;
                border: 1px solid rgba(255,255,255,.1);
                border-radius: 12px;
                padding: 13px 14px;
                outline: none;
                color: white;
                background: rgba(255,255,255,.05);
            }

            .oasis-auth-field input:focus {
                border-color: rgba(44,183,151,.7);
            }

            .oasis-auth-submit {
                width: 100%;
                border: 0;
                border-radius: 12px;
                padding: 14px;
                cursor: pointer;
                color: white;
                background: #199d83;
                font-weight: 800;
                font-size: 15px;
                margin-top: 5px;
            }

            .oasis-auth-submit:hover {
                filter: brightness(1.08);
            }

            .oasis-auth-error {
                display: none;
                margin-bottom: 15px;
                padding: 12px;
                border-radius: 10px;
                color: #ffb4b4;
                background: rgba(255,70,70,.1);
                border: 1px solid rgba(255,70,70,.15);
                font-size: 13px;
            }

            .oasis-auth-error.visible {
                display: block;
            }
        `;

        document.head.appendChild(style);

        const overlay = document.createElement("div");

        overlay.id = "oasis-auth";

        overlay.innerHTML = `
            <div class="oasis-auth-box">

                <div class="oasis-auth-brand">
                    <span class="oasis-auth-brand-icon">
                        🌴
                    </span>

                    <h1>
                        Oasis
                    </h1>

                    <p>
                        Votre espace communautaire
                    </p>
                </div>

                <div class="oasis-auth-tabs">

                    <button
                        class="oasis-auth-tab active"
                        type="button"
                        data-auth-mode="login"
                    >
                        Connexion
                    </button>

                    <button
                        class="oasis-auth-tab"
                        type="button"
                        data-auth-mode="register"
                    >
                        Inscription
                    </button>

                </div>

                <div
                    class="oasis-auth-error"
                    id="oasis-auth-error"
                ></div>

                <form id="oasis-auth-form">

                    <div class="oasis-auth-field">
                        <label for="auth-identifier">
                            Nom d'utilisateur ou e-mail
                        </label>

                        <input
                            id="auth-identifier"
                            type="text"
                            autocomplete="username"
                            required
                        >
                    </div>

                    <div
                        class="oasis-auth-field"
                        id="auth-email-field"
                        hidden
                    >
                        <label for="auth-email">
                            E-mail
                        </label>

                        <input
                            id="auth-email"
                            type="email"
                            autocomplete="email"
                        >
                    </div>

                    <div class="oasis-auth-field">
                        <label for="auth-password">
                            Mot de passe
                        </label>

                        <input
                            id="auth-password"
                            type="password"
                            autocomplete="current-password"
                            minlength="8"
                            required
                        >
                    </div>

                    <div
                        class="oasis-auth-field"
                        id="auth-confirm-field"
                        hidden
                    >
                        <label for="auth-confirm">
                            Confirmer le mot de passe
                        </label>

                        <input
                            id="auth-confirm"
                            type="password"
                            autocomplete="new-password"
                            minlength="8"
                        >
                    </div>

                    <button
                        class="oasis-auth-submit"
                        type="submit"
                        id="oasis-auth-submit"
                    >
                        Se connecter
                    </button>

                </form>

            </div>
        `;

        document.body.appendChild(overlay);

        let mode = "login";

        const tabs = overlay.querySelectorAll(
            "[data-auth-mode]"
        );

        const identifier =
            overlay.querySelector("#auth-identifier");

        const email =
            overlay.querySelector("#auth-email");

        const emailField =
            overlay.querySelector("#auth-email-field");

        const confirm =
            overlay.querySelector("#auth-confirm");

        const confirmField =
            overlay.querySelector("#auth-confirm-field");

        const submit =
            overlay.querySelector("#oasis-auth-submit");

        const error =
            overlay.querySelector("#oasis-auth-error");

        const form =
            overlay.querySelector("#oasis-auth-form");

        function setMode(nextMode) {
            mode = nextMode;

            tabs.forEach(tab => {
                tab.classList.toggle(
                    "active",
                    tab.dataset.authMode === mode
                );
            });

            const register =
                mode === "register";

            emailField.hidden = !register;
            confirmField.hidden = !register;

            email.required = register;
            confirm.required = register;

            identifier.placeholder = register
                ? "Nom d'utilisateur"
                : "Nom d'utilisateur ou e-mail";

            submit.textContent = register
                ? "Créer mon compte"
                : "Se connecter";

            error.classList.remove("visible");
            error.textContent = "";
        }

        tabs.forEach(tab => {
            tab.addEventListener(
                "click",
                () => setMode(tab.dataset.authMode)
            );
        });

        form.addEventListener("submit", async event => {
            event.preventDefault();

            error.classList.remove("visible");

            submit.disabled = true;

            try {
                let user;

                if (mode === "register") {
                    if (confirm.value !== identifier.value) {
                        throw new Error(
                            "La confirmation du mot de passe est incorrecte."
                        );
                    }

                    user = await createUser(
                        identifier.value,
                        email.value,
                        confirm.value
                    );
                } else {
                    user = await login(
                        identifier.value,
                        document.getElementById(
                            "auth-password"
                        ).value
                    );
                }

                window.OasisAuth.currentUser = user;

                overlay.remove();

                document.body.classList.add(
                    "oasis-authenticated"
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "oasis:authenticated",
                        {
                            detail: user
                        }
                    )
                );

                window.location.hash = "#/";

                window.location.reload();

            } catch (err) {
                error.textContent =
                    err.message ||
                    "Une erreur est survenue.";

                error.classList.add("visible");

            } finally {
                submit.disabled = false;
            }
        });
    }

    function syncUserChrome(user) {
        if (!user) {
            return;
        }

        const sidebarName =
            document.getElementById(
                "sidebar-display-name"
            );

        const sidebarClan =
            document.getElementById(
                "sidebar-clan"
            );

        const coins =
            document.querySelector(
                "#header-coins span"
            );

        const avatar =
            document.getElementById(
                "header-avatar"
            );

        if (sidebarName) {
            sidebarName.textContent =
                user.display_name ||
                user.username;
        }

        if (sidebarClan) {
            sidebarClan.textContent =
                user.clan
                    ? `🏕️ ${user.clan}`
                    : "Aucun clan";
        }

        if (coins) {
            coins.textContent =
                new Intl.NumberFormat("fr-FR")
                    .format(user.coins || 0);
        }

        if (avatar) {
            avatar.textContent =
                user.avatar_url
                    ? ""
                    : "👤";

            if (user.avatar_url) {
                avatar.innerHTML = `
                    <img
                        src="${String(user.avatar_url)
                            .replaceAll('"', "&quot;")}"
                        alt="Avatar"
                    >
                `;
            }
        }
    }

    function init() {
        const currentUser = getSession();

        window.OasisAuth = {
            getCurrentUser: getSession,
            createUser,
            login,
            logout,
            updateUser,

            currentUser
        };

        if (!currentUser) {
            document.documentElement.style.overflow = "hidden";

            showAuthScreen();

            return;
        }

        syncUserChrome(currentUser);

        const logoutButton =
            document.getElementById(
                "logout-button"
            );

        if (logoutButton) {
            logoutButton.addEventListener(
                "click",
                logout
            );
        }

        window.dispatchEvent(
            new CustomEvent(
                "oasis:authenticated",
                {
                    detail: currentUser
                }
            )
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
