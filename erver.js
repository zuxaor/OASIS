/* =========================================================
   🌴 OASIS — SERVEUR
   Discord OAuth2
   ========================================================= */

"use strict";

require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT =
    Number(process.env.PORT) || 3000;

const DISCORD_API =
    "https://discord.com/api/v10";

const CLIENT_ID =
    process.env.DISCORD_CLIENT_ID;

const CLIENT_SECRET =
    process.env.DISCORD_CLIENT_SECRET;

const REDIRECT_URI =
    process.env.DISCORD_REDIRECT_URI;

const SESSION_SECRET =
    process.env.SESSION_SECRET;

const DATABASE_FILE =
    path.join(
        __dirname,
        "database.json"
    );

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

function loadDatabase() {
    if (!fs.existsSync(DATABASE_FILE)) {
        return {
            users: {}
        };
    }

    try {
        return JSON.parse(
            fs.readFileSync(
                DATABASE_FILE,
                "utf8"
            )
        );
    } catch {
        return {
            users: {}
        };
    }
}

function saveDatabase(database) {
    fs.writeFileSync(
        DATABASE_FILE,
        JSON.stringify(
            database,
            null,
            4
        ),
        "utf8"
    );
}

function signSession(userId) {
    const payload = Buffer
        .from(
            JSON.stringify({
                userId,
                createdAt: Date.now()
            })
        )
        .toString("base64url");

    const signature =
        crypto
            .createHmac(
                "sha256",
                SESSION_SECRET
            )
            .update(payload)
            .digest("base64url");

    return `${payload}.${signature}`;
}

function verifySession(token) {
    if (!token) {
        return null;
    }

    const parts =
        token.split(".");

    if (parts.length !== 2) {
        return null;
    }

    const [
        payload,
        signature
    ] = parts;

    const expected =
        crypto
            .createHmac(
                "sha256",
                SESSION_SECRET
            )
            .update(payload)
            .digest("base64url");

    if (
        !crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expected)
        )
    ) {
        return null;
    }

    try {
        return JSON.parse(
            Buffer
                .from(
                    payload,
                    "base64url"
                )
                .toString("utf8")
        );
    } catch {
        return null;
    }
}

function getCookie(req, name) {
    const cookies =
        req.headers.cookie || "";

    const match =
        cookies
            .split(";")
            .map(cookie =>
                cookie.trim()
            )
            .find(cookie =>
                cookie.startsWith(
                    `${name}=`
                )
            );

    if (!match) {
        return null;
    }

    return decodeURIComponent(
        match.slice(
            name.length + 1
        )
    );
}

function setSessionCookie(
    res,
    token
) {
    res.setHeader(
        "Set-Cookie",
        [
            `oasis_session=${encodeURIComponent(token)}`,
            "HttpOnly",
            "Path=/",
            "SameSite=Lax",
            "Max-Age=604800"
        ].join("; ")
    );
}

function clearSessionCookie(res) {
    res.setHeader(
        "Set-Cookie",
        [
            "oasis_session=",
            "HttpOnly",
            "Path=/",
            "SameSite=Lax",
            "Max-Age=0"
        ].join("; ")
    );
}

function requireAuth(req, res, next) {
    const token =
        getCookie(
            req,
            "oasis_session"
        );

    const session =
        verifySession(token);

    if (!session) {
        return res.status(401).json({
            error: "UNAUTHORIZED"
        });
    }

    req.userId =
        session.userId;

    next();
}

/* =========================================================
   DISCORD LOGIN
   ========================================================= */

app.get(
    "/auth/discord",
    (req, res) => {
        const state =
            crypto
                .randomBytes(32)
                .toString("hex");

        res.setHeader(
            "Set-Cookie",
            [
                `oasis_oauth_state=${state}`,
                "HttpOnly",
                "Path=/",
                "SameSite=Lax",
                "Max-Age=600"
            ].join("; ")
        );

        const params =
            new URLSearchParams({
                client_id: CLIENT_ID,
                response_type: "code",
                redirect_uri: REDIRECT_URI,
                scope: "identify",
                state
            });

        res.redirect(
            `${DISCORD_API}/oauth2/authorize?${params}`
        );
    }
);

/* =========================================================
   DISCORD CALLBACK
   ========================================================= */

app.get(
    "/auth/discord/callback",
    async (req, res) => {
        try {
            const {
                code,
                state
            } = req.query;

            if (!code || !state) {
                return res.status(400).send(
                    "Authentification Discord invalide."
                );
            }

            const stateCookie =
                getCookie(
                    req,
                    "oasis_oauth_state"
                );

            if (
                !stateCookie ||
                stateCookie !== state
            ) {
                return res.status(400).send(
                    "État OAuth invalide."
                );
            }

            const tokenResponse =
                await fetch(
                    `${DISCORD_API}/oauth2/token`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded"
                        },

                        body:
                            new URLSearchParams({
                                client_id:
                                    CLIENT_ID,

                                client_secret:
                                    CLIENT_SECRET,

                                grant_type:
                                    "authorization_code",

                                code,

                                redirect_uri:
                                    REDIRECT_URI
                            })
                    }
                );

            if (!tokenResponse.ok) {
                throw new Error(
                    "Impossible d'obtenir le token Discord."
                );
            }

            const tokenData =
                await tokenResponse.json();

            const userResponse =
                await fetch(
                    `${DISCORD_API}/users/@me`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${tokenData.access_token}`
                        }
                    }
                );

            if (!userResponse.ok) {
                throw new Error(
                    "Impossible de récupérer le compte Discord."
                );
            }

            const discordUser =
                await userResponse.json();

            const database =
                loadDatabase();

            const now =
                new Date().toISOString();

            const avatarUrl =
                discordUser.avatar
                    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
                    : null;

            if (
                !database.users[
                    discordUser.id
                ]
            ) {
                database.users[
                    discordUser.id
                ] = {
                    discord_id:
                        discordUser.id,

                    username:
                        discordUser.username,

                    display_name:
                        discordUser.global_name ||
                        discordUser.username,

                    avatar_url:
                        avatarUrl,

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
                    },

                    created_at:
                        now,

                    last_login:
                        now
                };
            } else {
                const user =
                    database.users[
                        discordUser.id
                    ];

                user.username =
                    discordUser.username;

                user.display_name =
                    discordUser.global_name ||
                    discordUser.username;

                user.avatar_url =
                    avatarUrl;

                user.last_login =
                    now;
            }

            saveDatabase(database);

            const session =
                signSession(
                    discordUser.id
                );

            setSessionCookie(
                res,
                session
            );

            res.redirect("/");

        } catch (error) {
            console.error(
                "Discord OAuth error:",
                error
            );

            res.status(500).send(
                "Une erreur est survenue pendant la connexion Discord."
            );
        }
    }
);

/* =========================================================
   UTILISATEUR ACTUEL
   ========================================================= */

app.get(
    "/api/me",
    requireAuth,
    (req, res) => {
        const database =
            loadDatabase();

        const user =
            database.users[
                req.userId
            ];

        if (!user) {
            return res.status(404).json({
                error: "USER_NOT_FOUND"
            });
        }

        res.json({
            user
        });
    }
);

/* =========================================================
   MODIFICATION UTILISATEUR
   ========================================================= */

app.patch(
    "/api/me",
    requireAuth,
    (req, res) => {
        const database =
            loadDatabase();

        const user =
            database.users[
                req.userId
            ];

        if (!user) {
            return res.status(404).json({
                error: "USER_NOT_FOUND"
            });
        }

        const allowedFields = [
            "display_name",
            "clan",
            "interests"
        ];

        for (
            const field
            of allowedFields
        ) {
            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {
                user[field] =
                    req.body[field];
            }
        }

        saveDatabase(database);

        res.json({
            user
        });
    }
);

/* =========================================================
   DÉCONNEXION
   ========================================================= */

app.post(
    "/auth/logout",
    (req, res) => {
        clearSessionCookie(res);

        res.json({
            success: true
        });
    }
);

/* =========================================================
   FICHIERS OASIS
   ========================================================= */

app.use(
    express.static(__dirname)
);

/* =========================================================
   DÉMARRAGE
   ========================================================= */

if (
    !CLIENT_ID ||
    !CLIENT_SECRET ||
    !REDIRECT_URI ||
    !SESSION_SECRET
) {
    console.warn(
        "⚠️ Configuration Discord incomplète."
    );
}

app.listen(
    PORT,
    () => {
        console.log(
            `🌴 Oasis lancé sur http://localhost:${PORT}`
        );
    }
);
