// src/components/CouponValidator.tsx
/**
 * Coupon Validator Component
 * A reusable component for validating and applying coupons
 */

'use client';

import React, { useState } from 'react';
import { validateCoupon, CouponValidationResponse } from '@/lib/coupon-api';

interface CouponValidatorProps {
    userId: number;
    gameId?: number;
    packageId?: number;
    amount: number;
    onCouponValid?: (response: CouponValidationResponse) => void;
    onCouponInvalid?: (response: CouponValidationResponse) => void;
}

export const CouponValidator: React.FC<CouponValidatorProps> = ({
    userId,
    gameId,
    packageId,
    amount,
    onCouponValid,
    onCouponInvalid,
}) => {
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [validation, setValidation] = useState<CouponValidationResponse | null>(null);

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!couponCode.trim()) {
            return;
        }

        setLoading(true);

        const response = await validateCoupon(userId, {
            code: couponCode,
            gameId,
            packageId,
            amount,
        });

        setValidation(response);

        if (response.success) {
            onCouponValid?.(response);
        } else {
            onCouponInvalid?.(response);
        }

        setLoading(false);
    };

    const handleClear = () => {
        setCouponCode('');
        setValidation(null);
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 border rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Apply Coupon Code</h3>

            <form onSubmit={handleValidate} className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={loading}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading || !couponCode.trim()}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                    >
                        {loading ? 'Validating...' : 'Validate'}
                    </button>
                    {couponCode && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </form>

            {/* Validation Result */}
            {validation && (
                <div className={`mt-4 p-3 rounded-md ${
                    validation.success 
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                }`}>
                    <p className={`font-semibold ${
                        validation.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                        {validation.message}
                    </p>

                    {validation.success && validation.data && (
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Discount Type:</span>
                                <span className="font-medium">{validation.data.discountType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount Value:</span>
                                <span className="font-medium">
                                    {validation.data.discountType === 'PERCENTAGE'
                                        ? `${validation.data.discountValue}%`
                                        : `฿${validation.data.discountValue}`}
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-semibold">Discount Amount:</span>
                                <span className="font-bold text-green-700">
                                    ฿{validation.data.discountAmount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Final Amount:</span>
                                <span className="font-bold text-blue-700">
                                    ฿{validation.data.finalAmount.toFixed(2)}
                                </span>
                            </div>
                            {validation.data.usageRemaining > 0 && (
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Remaining Uses:</span>
                                    <span>{validation.data.usageRemaining}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {!validation.success && validation.errors && (
                        <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
                            {validation.errors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default CouponValidator;
