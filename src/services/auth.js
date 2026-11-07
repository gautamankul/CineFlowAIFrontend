import env from "../Env";

const REFRESH_URL = `${env}/accounts/token/refresh/`;
const LOGIN_URL = `${env}/accounts/login/`;
const REGISTER_URL = `${env}/accounts/signup/`;
const LOGOUT_URL = `${env}/accounts/logout/`;

function clearAuthData() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

async function parseResponse(response) {
    const text = await response.text();
    let data = {};

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { detail: text };
        }
    }

    if (!response.ok) {
        const message =
            data.detail ||
            data.message ||
            data.error ||
            (typeof data === "object"
                ? Object.values(data).flat().join(" ")
                : "") ||
            `Request failed (${response.status}).`;

        throw new Error(message);
    }

    return data;
}

// Login with email
export async function loginUser(email, password) {
    const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await parseResponse(response);

    if (!data.access || !data.refresh) {
        throw new Error("Login response is missing tokens.");
    }

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
    } else {
        localStorage.removeItem("user");
    }

    return data;
}

// Register with username, email, and password
export async function registerUser(username, email, password) {
    const response = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            email,
            password,
        }),
    });

    const data = await parseResponse(response);

    // Store tokens only if registration returns them
    if (data.access && data.refresh) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
    }

    if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
}

// Logout and refresh functions remain the same

export async function logoutUser() {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    try {
        if (access || refresh) {
            const response = await fetch(LOGOUT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(access
                        ? { Authorization: `Bearer ${access}` }
                        : {}),
                },
                body: JSON.stringify({ refresh }),
            });

            if (!response.ok) {
                console.error("Server-side logout failed.");
            }
        }
    } catch (error) {
        console.error("Logout request failed:", error);
    } finally {
        clearAuthData();
    }
}

export async function refreshAccessToken() {
    const refresh = localStorage.getItem("refresh");

    if (!refresh) {
        clearAuthData();
        throw new Error("No refresh token found. Please sign in again.");
    }

    const response = await fetch(REFRESH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
    });

    try {
        const data = await parseResponse(response);

        if (!data.access) {
            throw new Error("Refresh response is missing access token.");
        }

        localStorage.setItem("access", data.access);

        if (data.refresh) {
            localStorage.setItem("refresh", data.refresh);
        }

        return data.access;
    } catch (error) {
        clearAuthData();

        if (response.status === 401 || response.status === 403) {
            throw new Error("Your session has expired. Please sign in again.");
        }

        throw error;
    }
}