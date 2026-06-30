const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
) {
    // Try admin token first (admin-auth-storage), then fallback to user token (auth-storage)
    let parsedToken: string | null = null;
    try {
        const adminAuth = localStorage.getItem("admin-auth-storage");
        if (adminAuth) {
            const adminState = JSON.parse(adminAuth);
            parsedToken = adminState?.state?.token || null;
        }
    } catch {}
    if (!parsedToken) {
        try {
            const userAuth = localStorage.getItem("auth-storage");
            if (userAuth) {
                const userState = JSON.parse(userAuth);
                parsedToken = userState?.state?.token || null;
            }
        } catch {}
    }

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
        if (response.status === 401) {
            if (typeof window !== "undefined") {
                const isAdminPage = window.location.pathname.startsWith("/admin");
                if (!isAdminPage) {
                    // Only clear user auth and redirect for non-admin pages
                    localStorage.removeItem("auth-storage");
                    window.location.href = "/login?expired=true";
                }
            }
            throw new Error("เซสชันการใช้งานหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        }
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
    register: (data: { email: string; password: string; name?: string; referredBy?: string }) =>
        apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getReferrals: () => apiRequest("/users/me/referrals"),

    setReferrer: (referrerCode: string) =>
        apiRequest("/users/me/referred-by", {
            method: "POST",
            body: JSON.stringify({ referrerCode }),
        }),

    getPublicStats: () => apiRequest("/orders/public/stats"),

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
    validateCoupon: (data: { code: string; gameId?: number; packageId?: number; amount?: number }, userId: string) =>
        apiRequest(`/coupons/validate?userId=${userId}`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Account Overview
    getMe: () => apiRequest("/users/me"),
    getLoyalty: () => apiRequest("/users/me/loyalty"),
    getWalletBalance: () => apiRequest("/wallets/me/balance"),
    getRecentOrders: () => apiRequest("/orders/me/recent"),
    deleteAccount: (data: { confirmPhrase: string; password: string }) =>
        apiRequest("/users/me", { method: "DELETE", body: JSON.stringify(data) }),

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
    recordGachaSpin: (data: { prizeAmount: number; prizeLabel?: string; won?: boolean; orderId?: number | null }) =>
        apiRequest("/wallets/me/gacha-spin", { method: "POST", body: JSON.stringify(data) }),
    getGachaSpins: (params?: { limit?: number; offset?: number }) => {
        const q = new URLSearchParams();
        if (params?.limit !== undefined) q.set("limit", String(params.limit));
        if (params?.offset !== undefined) q.set("offset", String(params.offset));
        return apiRequest(`/users/me/gacha-spins?${q.toString()}`);
    },
    processWalletPayment: (data: { orderId: number; amount: number; paymentMethod: string }) =>
        apiRequest("/payments/process-wallet-payment", { method: "POST", body: JSON.stringify(data) }),
    generateQRCode: (data: { orderId: number; amount: number; method: "promptpay" | "truemoney" | "bank_transfer" }) =>
        apiRequest("/payments/generate-qr", { method: "POST", body: JSON.stringify(data) }),
    checkPaymentStatus: (orderId: string) =>
        apiRequest(`/payments/check-status?orderId=${orderId}`),
    getPaymentAdminSettings: () => apiRequest("/payments/admin/settings"),
    savePaymentAdminSettings: (settings: any) =>
        apiRequest("/payments/admin/settings", { method: "POST", body: JSON.stringify({ settings }) }),
    getActivePaymentMethods: () => apiRequest("/payments/active-methods"),
    getPaymentAdminLogs: () => apiRequest("/payments/admin/logs"),
    adminUpdateTopupStatus: (referenceId: string, status: 'completed' | 'failed', adminNote?: string) =>
        apiRequest(`/topup/${referenceId}/admin-status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, adminNote }),
        }),

    // Slip upload (multipart/form-data — needs raw fetch, not JSON)
    uploadSlip: async (file: File) => {
        const token = localStorage.getItem("auth-storage");
        const parsedToken = token ? JSON.parse(token).state.token : null;
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/upload/slip`,
            {
                method: "POST",
                headers: parsedToken ? { Authorization: `Bearer ${parsedToken}` } : {},
                body: formData,
            }
        );
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Upload failed" }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return response.json();
    },

    submitSlip: (referenceId: string, slipUrl: string, bankCode?: string) =>
        apiRequest(`/topup/${referenceId}/submit-slip`, {
            method: "PATCH",
            body: JSON.stringify({ slipUrl, bankCode }),
        }),

    // Addresses
    getAddresses: () => apiRequest("/users/me/addresses"),
    addAddress: (data: any) =>
        apiRequest("/users/me/addresses", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    updateAddress: (id: string, data: any) =>
        apiRequest(`/users/me/addresses/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    deleteAddress: (id: string) =>
        apiRequest(`/users/me/addresses/${id}`, {
            method: "DELETE",
        }),
    setDefaultAddress: (id: string) =>
        apiRequest(`/users/me/addresses/${id}/default`, {
            method: "PATCH",
        }),

    // Bookmarks
    getBookmarks: () => apiRequest("/users/me/bookmarks"),
    toggleBookmark: (gameId: number) =>
        apiRequest("/users/me/bookmarks", {
            method: "POST",
            body: JSON.stringify({ gameId }),
        }),
};
