// src/components/TopupValidator.tsx
/**
 * Top-up Validator Component
 * Validates and prepares top-up data before order creation
 * ตัวตรวจสอบการเติมเกมและเตรียมข้อมูล
 */

'use client';

import React, { useState } from 'react';
import { validateTopup } from '@/lib/payment-api';

export interface TopupValidationData {
    gameId: number;
    packageId: number;
    email: string;
    playerFields: Array<{
        key: string;
        value: string;
    }>;
    couponCode?: string;
}

export interface TopupValidationResponse {
    success: boolean;
    message: string;
    data?: {
        gameId: number;
        gameName: string;
        packageId: number;
        packageName: string;
        packagePrice: number;
        email: string;
        playerFieldsValid: boolean;
        couponApplied?: {
            code: string;
            discountAmount: number;
            finalPrice: number;
        };
        estimatedPrice: number;
    };
    errors?: string[];
    warnings?: string[];
}

interface TopupValidatorProps {
    userId: number;
    validationData: TopupValidationData;
    onValidationSuccess?: (result: TopupValidationResponse) => void;
    onValidationError?: (result: TopupValidationResponse) => void;
    disabled?: boolean;
}

export default function TopupValidator({
    userId,
    validationData,
    onValidationSuccess,
    onValidationError,
    disabled = false,
}: TopupValidatorProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TopupValidationResponse | null>(null);

    const handleValidate = async () => {
        setLoading(true);

        const response = await validateTopup(userId, validationData);

        setResult(response);

        if (response.success && onValidationSuccess) {
            onValidationSuccess(response);
        } else if (!response.success && onValidationError) {
            onValidationError(response);
        }

        setLoading(false);
    };

    const handleClear = () => {
        setResult(null);
    };

    return (
        <div className="space-y-4">
            {/* Validate Button */}
            <div className="flex gap-2">
                <button
                    onClick={handleValidate}
                    disabled={loading || disabled}
                    className="flex-1 py-2 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {loading ? 'กำลังตรวจสอบ... | Validating...' : 'ตรวจสอบ | Validate'}
                </button>

                {result && (
                    <button
                        onClick={handleClear}
                        className="py-2 px-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition"
                    >
                        ล้าง | Clear
                    </button>
                )}
            </div>

            {/* Validation Result */}
            {result && (
                <div
                    className={`rounded-lg p-4 border ${
                        result.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                    }`}
                >
                    {/* Success State */}
                    {result.success && result.data && (
                        <div className="space-y-3">
                            <p className="font-bold text-green-700">✅ {result.message}</p>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">เกม | Game</span>
                                    <span className="font-medium">{result.data.gameName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">แพ็กเกจ | Package</span>
                                    <span className="font-medium">{result.data.packageName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">ราคา | Price</span>
                                    <span className="font-medium">
                                        ฿{result.data.packagePrice.toFixed(2)}
                                    </span>
                                </div>

                                {result.data.couponApplied && (
                                    <>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between text-green-600">
                                                <span>คูปอง | Coupon</span>
                                                <span className="font-medium">
                                                    {result.data.couponApplied.code}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-green-600">
                                                <span>ส่วนลด | Discount</span>
                                                <span className="font-medium">
                                                    -฿{result.data.couponApplied.discountAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                    <span>รวม | Total</span>
                                    <span className="text-blue-600">
                                        ฿{result.data.estimatedPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {!result.success && (
                        <div className="space-y-2">
                            <p className="font-bold text-red-700">❌ {result.message}</p>

                            {result.errors && result.errors.length > 0 && (
                                <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                                    {result.errors.map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                </ul>
                            )}

                            {result.warnings && result.warnings.length > 0 && (
                                <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                                    <p className="text-sm font-medium text-yellow-700 mb-1">
                                        ⚠️ คำเตือน | Warnings
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600">
                                        {result.warnings.map((warning, idx) => (
                                            <li key={idx}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
