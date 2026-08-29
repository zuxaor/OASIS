/* =========================================================
   🌴 OASIS — AUTHENTIFICATION DISCORD
   ========================================================= */

(() => {
    "use strict";

    const DEFAULT_USER = {
        coins: 0,
        level: 0,
        xp: 0,
        clan: null,
        achievements: [],
        missions: [],
        challenges: [],
        purchases: [],
        tickets: [],
        island: {
            level: 0,
            contributions: 0
        }
    };

    let currentUser = null;

    async function getCurrentUser() {
        try {
            const response = await fetch("/api/me", {
                credentials: "include"
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            return data.user || null;

        } catch {
            return null;
        }
    }

    function loginWithDiscord() {
        window.location.href = "/auth/discord";
    }

    async function logout() {
        try {
            await fetch("/auth/logout", {
                method: "POST",
                credentials: "include"
            });
        } finally {
            window.location.href = "/";
        }
    }

    async function updateUser(patch) {
        try {
            const response = await fetch(
                "/api/me",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(patch)
                }
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            currentUser = data.user || null;

            window.dispatchEvent(
                new CustomEvent(
                    "oasis:user-updated",
                    {
                        detail: currentUser
                    }
                )
            );

            return currentUser;

        } catch {
            return null;
        }
    }

    function createAuthScreen() {
        if (document.getElementById("oasis-auth")) {
            return;
        }

        const style = document.createElement("style");

        style.textContent = `
            #oasis-auth {
                position: fixed;
                inset: 0;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                background:
                    radial-gradient(
                        circle at 20% 20%,
                        rgba(34, 197, 164, .18),
                        transparent 35%
                    ),
                    radial-gradient(
                        circle at 80% 80%,
                        rgba(32, 102, 91, .20),
                        transparent 35%
                    ),
                    #071b1a;
            }

            .oasis-auth-card {
                width: min(430px, 100%);
                padding: 40px;
                border-radius: 28px;
                text-align: center;
                background: rgba(7, 29, 28, .94);
                border: 1px solid rgba(255,255,255,.08);
                box-shadow:
                    0 30px 100px rgba(0,0,0,.5);
                backdrop-filter: blur(20px);
            }

            .oasis-auth-logo {
                font-size: 64px;
                margin-bottom: 10px;
            }

            .oasis-auth-card h1 {
                margin: 0;
                color: white;
                font-size: 36px;
                font-weight: 800;
            }

            .oasis-auth-card p {
                margin: 10px 0 30px;
                color: rgba(255,255,255,.58);
            }

            .oasis-discord-login {
                width: 100%;
                border: 0;
                border-radius: 14px;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                cursor: pointer;
                color: white;
                background: #5865F2;
                font-size: 15px;
                font-weight: 800;
                transition:
                    transform .2s ease,
                    filter .2s ease;
            }

            .oasis-discord-login:hover {
                filter: brightness(1.08);
                transform: translateY(-2px);
            }

            .oasis-auth-note {
                margin-top: 18px !important;
                margin-bottom: 0 !important;
                font-size: 12px;
                line-height: 1.5;
            }
        `;

        document.head.appendChild(style);

        const overlay = document.createElement("div");

        overlay.id = "oasis-auth";

        overlay.innerHTML = `
            <div class="oasis-auth-card">

                <div class="oasis-auth-logo">
                    🌴
                </div>

                <h1>
                    Oasis
                </h1>

                <p>
                    Connecte-toi avec ton compte Discord
                    pour accéder à la communauté.
                </p>

                <button
                    id="oasis-discord-login"
                    class="oasis-discord-login"
                    type="button"
                >
                    <span>💬</span>
                    Continuer avec Discord
                </button>

                <p class="oasis-auth-note">
                    Ton compte Oasis est automatiquement
                    lié à ton compte Discord.
                </p>

            </div>
        `;

        document.body.appendChild(overlay);

        document
            .getElementById("oasis-discord-login")
            .addEventListener(
                "click",
                loginWithDiscord
            );
    }

    function updateUserInterface(user) {
        if (!user) {
            return;
        }

        const displayName =
            user.display_name ||
            user.username ||
            "Membre";

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
            sidebarName.textContent = displayName;
        }

        if (sidebarClan) {
            sidebarClan.textContent =
                user.clan
                    ? `🏕️ ${user.clan}`
                    : "Aucun clan";
        }

        if (coins) {
            coins.textContent =
                Number(user.coins || 0).toLocaleString(
                    "fr-FR"
                );
        }

        if (avatar) {
            if (user.avatar_url) {
                avatar.innerHTML = `
                    <img
                        src="${user.avatar_url}"
                        alt="Avatar Discord"
                    >
                `;
            } else {
                avatar.textContent = "👤";
            }
        }
    }

    async function initAuth() {
        currentUser = await getCurrentUser();

        window.OasisAuth = {
            getCurrentUser: () => currentUser,
            loginWithDiscord,
            logout,
            updateUser,
            DEFAULT_USER
        };

        if (!currentUser) {
            document.documentElement.style.overflow =
                "hidden";

            createAuthScreen();

            return;
        }

        updateUserInterface(currentUser);

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

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initAuth
        );
    } else {
        initAuth();
    }

})();
