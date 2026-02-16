export interface AuthResponse {
    success: boolean;
    user?: {
        id: string;
        email: string;
        profile: {
            username?: string;
            display_name?: string;
            avatar_url?: string;
        };
    };
    token?: string;
    message?: string;
}

export interface GoogleAuthResponse {
    success: boolean;
    authUrl?: string;
    message?: string;
}

export class AuthService {
    static async register(email: string, password: string, username?: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, username }),
            });

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    user: data.user,
                    token: data.token,
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Registration failed',
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Network error. Please try again.',
            };
        }
    }

    static async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    user: data.user,
                    token: data.token,
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Login failed',
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Network error. Please try again.',
            };
        }
    }

    static async verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    userId: data.user.id,
                    email: data.user.email,
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    static async getUserById(userId: string): Promise<any | null> {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return null;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    _id: data.user.id,
                    email: data.user.email,
                    profile: data.user.profile,
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // Forgot Password - ส่งอีเมลรีเซ็ต
    static async forgotPassword(email: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            return {
                success: data.success,
                message: data.message,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Network error. Please try again.',
            };
        }
    }

    static async verifyResetOTP(email: string, otp: string): Promise<AuthResponse & { resetToken?: string }> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            return {
                success: data.success,
                message: data.message,
                resetToken: data.resetToken,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Network error. Please try again.',
            };
        }
    }

    static async resetPassword(resetToken: string, newPassword: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword }),
            });

            const data = await response.json();
            return {
                success: data.success,
                message: data.message,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Network error. Please try again.',
            };
        }
    }



    // Verify Reset Token - ตรวจสอบว่า token ยังใช้ได้หรือไม่
    static async verifyResetToken(token: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-reset-token/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            return {
                success: data.success,
                message: data.message,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Network error. Please try again.',
            };
        }
    }

    // Google Sign In - เริ่มต้น OAuth flow
    static async initiateGoogleSignIn(): Promise<GoogleAuthResponse> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            return {
                success: data.success,
                authUrl: data.authUrl,
                message: data.message,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Network error. Please try again.',
            };
        }
    }

    // Google Callback - รับ token หลังจาก Google authentication
    static async handleGoogleCallback(code: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback?code=${code}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    user: data.user,
                    token: data.token,
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Google authentication failed',
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Network error. Please try again.',
            };
        }
    }
}
