// src/lib/coupon-api.ts
/**
 * Coupon API Client
 * Handles all coupon validation and application requests
 */

import { api } from './api'; // Your existing axios/fetch instance

export interface ValidateCouponRequest {
    code: string;
    gameId?: number;
    packageId?: number;
    amount?: number;
}

export interface CouponValidationResponse {
    success: boolean;
    message: string;
    data?: {
        code: string;
        discountType: 'FIXED' | 'PERCENTAGE';
        discountValue: number;
        discountAmount: number;
        finalAmount: number;
        usageRemaining: number;
    };
    errors?: string[];
}

export interface ApplyCouponRequest {
    code: string;
    userId: number;
    orderId: number;
    usedAmount: number;
    ipAddress?: string;
}

/**
 * Validate if a coupon code can be used
 * @param userId - The user ID
 * @param request - Coupon validation details
 * @returns Validation response with discount details
 */
export const validateCoupon = async (
    userId: number,
    request: ValidateCouponRequest
): Promise<CouponValidationResponse> => {
    try {
        const response = await api.post(`/coupons/validate?userId=${userId}`, request);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: 'Failed to validate coupon',
            errors: [(error as any).message],
        };
    }
};

/**
 * Apply a coupon to an order
 * @param request - Coupon application details
 * @returns Application response
 */
export const applyCoupon = async (request: ApplyCouponRequest) => {
    try {
        const response = await api.post('/coupons/apply', request);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: 'Failed to apply coupon',
            error: (error as any).message,
        };
    }
};

/**
 * Get coupon details by code
 * @param code - Coupon code
 * @returns Coupon details
 */
export const getCouponDetails = async (code: string) => {
    try {
        const response = await api.get(`/coupons/${code}`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: 'Coupon not found',
            error: (error as any).message,
        };
    }
};

/**
 * Get user's coupon usage history
 * @param userId - The user ID
 * @returns List of coupon usages
 */
export const getUserCouponHistory = async (userId: number) => {
    try {
        const response = await api.get(`/coupons/history/${userId}`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: 'Failed to fetch coupon history',
            error: (error as any).message,
        };
    }
};
