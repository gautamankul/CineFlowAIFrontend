import env from "../Env";
import { refreshAccessToken } from "./auth";


// This function is used for API requests that require authentication.
export async function apiFetch(path, options = {}) {
    const url = `${env}${path}`;

    const sendRequest = (access) => {
        const headers = new Headers(options.headers || {});

        if (access) {
            headers.set("Authorization", `Bearer ${access}`);
        }

        return fetch(url, {
            ...options,
            headers,
        });
    };

    let access =
        localStorage.getItem("access") || localStorage.getItem("token");

    let response = await sendRequest(access);

    if (response.status !== 401) {
        return response;
    }

    try {
        access = await refreshAccessToken();

        response = await sendRequest(access);

        return response;
    } catch (error) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        window.location.href = "/login";

        throw error;
    }
}

// This function is used for public API requests that do not require authentication.
export async function publicApiFetch(path, options = {}) {
    const url = `${env}${path}`;
    return fetch(url, options);
}


// GET PROJECTS
export async function getProjects() {
    return apiFetch(PROJECTS_URL);
}

// CREATE PROJECT
export async function createProject(projectData) {
    return apiFetch(PROJECTS_URL, {
        method: 'POST',
        body: JSON.stringify(projectData),
    });
}
