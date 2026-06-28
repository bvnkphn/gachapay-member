const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = localStorage.getItem("auth-storage");
    const parsedToken = token ? JSON.parse(token).state.token : null;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
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
        const errorMessage = error.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('API Error Response:', { status: response.status, error });
        throw new Error(errorMessage);
    }

    // Handle empty responses (204 No Content, etc.)
    const contentLength = response.headers.get('content-length');
    if (response.status === 204 || contentLength === '0') {
        return null;
    }

    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error('Failed to parse JSON response:', text);
        throw new Error('Invalid JSON response from server');
    }
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

    sendOtp: (data: { email: string }) =>
        apiRequest("/auth/send-otp", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    verifyOtp: (data: { email: string; otp: string; newPassword: string }) =>
        apiRequest("/auth/verify-otp", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getProfile: () => apiRequest("/auth/me"),

    // Games
    getGames: () => apiRequest("/games"),
    getGame: (slug: string) => apiRequest(`/games/${slug}`),

    // Orders
    getOrders: () => apiRequest("/orders"),
    getOrder: (id: string) => apiRequest(`/orders/${id}`),
    createOrder: (data: any) =>
        apiRequest("/orders", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Account Overview
    getMe: () => apiRequest("/users/me"),
    getLoyalty: () => apiRequest("/users/me/loyalty"),
    getWalletBalance: () => apiRequest("/wallets/me/balance"),
    getRecentOrders: () => apiRequest("/orders/me/recent"),

    // Topup
    getTopupMethods: () => apiRequest("/topup/methods"),
    getTopupTransactions: (params?: { status?: string; limit?: number; offset?: number }) => {
        const q = new URLSearchParams();
        if (params?.status) q.set("status", params.status);
        if (params?.limit !== undefined) q.set("limit", String(params.limit));
        if (params?.offset !== undefined) q.set("offset", String(params.offset));
        return apiRequest(`/topup/transactions?${q.toString()}`);
    },
    createTopupIntent: (data: { amount: number; methodCode: string }) =>
        apiRequest("/topup/create-intent", { method: "POST", body: JSON.stringify(data) }),
    simulateTopupComplete: (referenceId: string) =>
        apiRequest(`/topup/${referenceId}/complete`, { method: "PATCH" }),
    simulateTopupCancel: (referenceId: string) =>
        apiRequest(`/topup/${referenceId}/cancel`, { method: "PATCH" }),
    claimGachaReward: (amount: number) =>
        apiRequest("/wallets/me/gacha-claim", { method: "POST", body: JSON.stringify({ amount }) }),
    processWalletPayment: (data: { orderId: number; amount: number; paymentMethod: string }) =>
        apiRequest("/payments/process-wallet-payment", { method: "POST", body: JSON.stringify(data) }),
    generateQRCode: (data: { orderId: number; amount: number; method: "promptpay" | "truemoney" }) =>
        apiRequest("/payments/generate-qr", { method: "POST", body: JSON.stringify(data) }),
    checkPaymentStatus: (orderId: string) =>
        apiRequest(`/payments/check-status?orderId=${orderId}`),
};
