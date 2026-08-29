require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI =
    process.env.DISCORD_REDIRECT_URI ||
    `http://localhost:${PORT}/auth/discord/callback`;

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    console.error(
        "❌ DISCORD_CLIENT_ID ou DISCORD_CLIENT_SECRET est manquant dans .env"
    );
    process.exit(1);
}

if (!SESSION_SECRET) {
    console.error("❌ SESSION_SECRET est manquant dans .env");
    process.exit(1);
}

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Sessions
|--------------------------------------------------------------------------
|
| Pour cette première étape, les sessions sont stockées en mémoire.
| Plus tard, on pourra les connecter à la base de données Oasis.
|
*/

const sessions = new Map();

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 jours

/*
|--------------------------------------------------------------------------
| Fichiers statiques
|--------------------------------------------------------------------------
*/

app.use(express.static(path.join(__dirname)));

/*
|--------------------------------------------------------------------------
| Utilitaires
|--------------------------------------------------------------------------
*/

function generateSessionId() {
    return crypto.randomBytes(32).toString("hex");
}

function generateState() {
    return crypto.randomBytes(24).toString("hex");
}

function cleanExpiredSessions() {
    const now = Date.now();

    for (const [sessionId, session] of sessions.entries()) {
        if (session.expiresAt <= now) {
            sessions.delete(sessionId);
        }
    }
}

setInterval(cleanExpiredSessions, 1000 * 60 * 30);

/*
|--------------------------------------------------------------------------
| Cookies
|--------------------------------------------------------------------------
*/

function parseCookies(req) {
    const cookies = {};

    const header = req.headers.cookie;

    if (!header) {
        return cookies;
    }

    header.split(";").forEach((cookie) => {
        const separatorIndex = cookie.indexOf("=");

        if (separatorIndex === -1) {
            return;
        }

        const name = cookie
            .slice(0, separatorIndex)
            .trim();

        const value = cookie
            .slice(separatorIndex + 1)
            .trim();

        cookies[name] = decodeURIComponent(value);
    });

    return cookies;
}

function setCookie(res, name, value, options = {}) {
    const parts = [
        `${name}=${encodeURIComponent(value)}`
    ];

    if (options.maxAge !== undefined) {
        parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
    }

    if (options.httpOnly) {
        parts.push("HttpOnly");
    }

    if (options.secure) {
        parts.push("Secure");
    }

    if (options.sameSite) {
        parts.push(`SameSite=${options.sameSite}`);
    }

    if (options.path) {
        parts.push(`Path=${options.path}`);
    }

    res.append("Set-Cookie", parts.join("; "));
}

function clearCookie(res, name) {
    setCookie(res, name, "", {
        maxAge: 0,
        httpOnly: true,
        sameSite: "Lax",
        path: "/"
    });
}

/*
|--------------------------------------------------------------------------
| Auth middleware
|--------------------------------------------------------------------------
*/

function getSession(req) {
    const cookies = parseCookies(req);

    if (!cookies.oasis_session) {
        return null;
    }

    const session = sessions.get(cookies.oasis_session);

    if (!session) {
        return null;
    }

    if (session.expiresAt <= Date.now()) {
        sessions.delete(cookies.oasis_session);
        return null;
    }

    return {
        id: cookies.oasis_session,
        ...session
    };
}

function requireAuth(req, res, next) {
    const session = getSession(req);

    if (!session) {
        return res.status(401).json({
            success: false,
            error: "AUTHENTICATION_REQUIRED"
        });
    }

    req.session = session;

    next();
}

/*
|--------------------------------------------------------------------------
| Discord OAuth2
|--------------------------------------------------------------------------
*/

const DISCORD_AUTH_URL =
    "https://discord.com/oauth2/authorize";

const DISCORD_TOKEN_URL =
    "https://discord.com/api/oauth2/token";

const DISCORD_USER_URL =
    "https://discord.com/api/users/@me";

/*
|--------------------------------------------------------------------------
| Connexion Discord
|--------------------------------------------------------------------------
*/

app.get("/auth/discord", (req, res) => {
    const state = generateState();

    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: "code",
        scope: "identify",
        state
    });

    setCookie(res, "oasis_oauth_state", state, {
        maxAge: 1000 * 60 * 10,
        httpOnly: true,
        sameSite: "Lax",
        path: "/"
    });

    const discordUrl =
        `${DISCORD_AUTH_URL}?${params.toString()}`;

    res.redirect(discordUrl);
});

/*
|--------------------------------------------------------------------------
| Callback Discord
|--------------------------------------------------------------------------
*/

app.get("/auth/discord/callback", async (req, res) => {
    try {
        const {
            code,
            state,
            error
        } = req.query;

        if (error) {
            console.error(
                "❌ Discord OAuth error:",
                error
            );

            clearCookie(res, "oasis_oauth_state");

            return res.redirect(
                "/?auth=cancelled"
            );
        }

        if (!code) {
            return res.status(400).send(
                "Code Discord manquant."
            );
        }

        const cookies = parseCookies(req);

        const savedState =
            cookies.oasis_oauth_state;

        if (
            !savedState ||
            !state ||
            savedState !== state
        ) {
            clearCookie(res, "oasis_oauth_state");

            return res.status(400).send(
                "Erreur de sécurité OAuth2 : état invalide."
            );
        }

        clearCookie(res, "oasis_oauth_state");

        /*
        |--------------------------------------------------------------------------
        | Échange du code contre un access token
        |--------------------------------------------------------------------------
        */

        const tokenResponse = await fetch(
            DISCORD_TOKEN_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: new URLSearchParams({
                    client_id:
                        DISCORD_CLIENT_ID,

                    client_secret:
                        DISCORD_CLIENT_SECRET,

                    grant_type:
                        "authorization_code",

                    code,

                    redirect_uri:
                        DISCORD_REDIRECT_URI
                })
            }
        );

        if (!tokenResponse.ok) {
            const errorText =
                await tokenResponse.text();

            console.error(
                "❌ Discord token error:",
                errorText
            );

            return res.status(502).send(
                "Impossible de récupérer le token Discord."
            );
        }

        const tokenData =
            await tokenResponse.json();

        if (!tokenData.access_token) {
            return res.status(502).send(
                "Token Discord invalide."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Récupération du profil Discord
        |--------------------------------------------------------------------------
        */

        const userResponse = await fetch(
            DISCORD_USER_URL,
            {
                headers: {
                    Authorization:
                        `Bearer ${tokenData.access_token}`
                }
            }
        );

        if (!userResponse.ok) {
            const errorText =
                await userResponse.text();

            console.error(
                "❌ Discord user error:",
                errorText
            );

            return res.status(502).send(
                "Impossible de récupérer votre profil Discord."
            );
        }

        const discordUser =
            await userResponse.json();

        /*
        |--------------------------------------------------------------------------
        | Création de la session Oasis
        |--------------------------------------------------------------------------
        */

        const sessionId =
            generateSessionId();

        const session = {
            user: {
                id: discordUser.id,
                username: discordUser.username,
                globalName:
                    discordUser.global_name || null,
                discriminator:
                    discordUser.discriminator || null,
                avatar:
                    discordUser.avatar || null
            },

            discord: {
                id: discordUser.id,
                username: discordUser.username,
                globalName:
                    discordUser.global_name || null,
                avatar:
                    discordUser.avatar || null
            },

            createdAt: Date.now(),

            expiresAt:
                Date.now() +
                SESSION_DURATION
        };

        sessions.set(
            sessionId,
            session
        );

        /*
        |--------------------------------------------------------------------------
        | Cookie de session
        |--------------------------------------------------------------------------
        */

        const isProduction =
            process.env.NODE_ENV === "production";

        setCookie(
            res,
            "oasis_session",
            sessionId,
            {
                maxAge:
                    SESSION_DURATION,

                httpOnly: true,

                secure:
                    isProduction,

                sameSite: "Lax",

                path: "/"
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Retour sur Oasis
        |--------------------------------------------------------------------------
        */

        res.redirect(
            "/?auth=success"
        );

    } catch (error) {
        console.error(
            "❌ Erreur OAuth Discord:",
            error
        );

        res.status(500).send(
            "Une erreur est survenue pendant la connexion Discord."
        );
    }
});

/*
|--------------------------------------------------------------------------
| Utilisateur connecté
|--------------------------------------------------------------------------
*/

app.get(
    "/api/auth/me",
    (req, res) => {
        const session =
            getSession(req);

        if (!session) {
            return res.json({
                authenticated: false,
                user: null
            });
        }

        res.json({
            authenticated: true,

            user: {
                id: session.user.id,
                username:
                    session.user.username,
                globalName:
                    session.user.globalName,
                avatar:
                    session.user.avatar
            }
        });
    }
);

/*
|--------------------------------------------------------------------------
| Déconnexion
|--------------------------------------------------------------------------
*/

app.post(
    "/api/auth/logout",
    (req, res) => {
        const cookies =
            parseCookies(req);

        const sessionId =
            cookies.oasis_session;

        if (sessionId) {
            sessions.delete(
                sessionId
            );
        }

        clearCookie(
            res,
            "oasis_session"
        );

        res.json({
            success: true
        });
    }
);

/*
|--------------------------------------------------------------------------
| Route de test
|--------------------------------------------------------------------------
*/

app.get(
    "/api/auth/status",
    (req, res) => {
        const session =
            getSession(req);

        res.json({
            authenticated:
                Boolean(session),

            user:
                session
                    ? session.user
                    : null
        });
    }
);

/*
|--------------------------------------------------------------------------
| Route protégée de test
|--------------------------------------------------------------------------
*/

app.get(
    "/api/user",
    requireAuth,
    (req, res) => {
        res.json({
            success: true,
            user: req.session.user
        });
    }
);

/*
|--------------------------------------------------------------------------
| Fallback SPA
|--------------------------------------------------------------------------
*/

app.get(
    "*splat",
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );
    }
);

/*
|--------------------------------------------------------------------------
| Gestion des erreurs Express
|--------------------------------------------------------------------------
*/

app.use(
    (err, req, res, next) => {
        console.error(
            "❌ Erreur serveur:",
            err
        );

        if (res.headersSent) {
            return next(err);
        }

        res.status(500).json({
            success: false,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
);

/*
|--------------------------------------------------------------------------
| Démarrage
|--------------------------------------------------------------------------
*/

app.listen(
    PORT,
    () => {
        console.log("");
        console.log(
            "🌴 =============================="
        );
        console.log(
            "🌴        OASIS SERVER"
        );
        console.log(
            "🌴 =============================="
        );
        console.log("");
        console.log(
            `🌐 http://localhost:${PORT}`
        );
        console.log(
            "🔐 Authentification : Discord"
        );
        console.log(
            `🔗 Callback : ${DISCORD_REDIRECT_URI}`
        );
        console.log("");
    }
);
