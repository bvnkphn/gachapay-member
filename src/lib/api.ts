const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = localStorage.getItem("auth-storage");
    const parsedToken = token ? JSON.parse(token).state.token : null;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (parsedToken) {
        headers.Authorization = `Bearer ${parsedToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || "Request failed");
    }

    return response.json();
}

export const api = {
    // Auth
    register: (data: { email: string; password: string; name?: string }) =>
        apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    login: (data: { email: string; password: string }) =>
        apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    forgotPassword: (data: { email: string }) =>
        apiRequest("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    resetPassword: (data: { token: string; password: string }) =>
        apiRequest("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getProfile: () => apiRequest("/auth/me"),

    // Games
    getGames: () => apiRequest("/games"),
    getGame: (slug: string) => apiRequest(`/games/${slug}`),

    // Orders
    getOrders: () => apiRequest("/orders"),
    createOrder: (data: any) =>
        apiRequest("/orders", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};
