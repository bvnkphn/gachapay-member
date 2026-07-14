'use client';

import React from 'react';
import { Wallet, QrCode } from 'lucide-react';

export type PaymentMethod = 'gacha_wallet' | 'promptpay' | 'truemoney';

interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethod | null;
    onMethodSelect: (method: PaymentMethod) => void;
    walletBalance?: number;
    finalPrice?: number;
    disabled?: boolean;
}

export default function PaymentMethodSelector({
    selectedMethod,
    onMethodSelect,
    walletBalance = 0,
    finalPrice = 0,
    disabled = false,
}: PaymentMethodSelectorProps) {
    const insufficientBalance = walletBalance < finalPrice;

    const methods = [
        {
            id: 'gacha_wallet' as PaymentMethod,
            name: 'Gacha Wallet',
            nameThaiEng: 'กระเป๋าเงิน Gacha | Gacha Wallet',
            description: 'ชำระเงินจากยอดเงินใน Gacha Wallet',
            icon: Wallet,
            color: 'bg-blue-500',
        },
        {
            id: 'promptpay' as PaymentMethod,
            name: 'PromptPay',
            nameThaiEng: 'พร้อมเพย์ | PromptPay',
            description: 'สแกน QR Code จากแอปธนาคารของคุณ',
            icon: QrCode,
            color: 'bg-purple-500',
        },
        {
            id: 'truemoney' as PaymentMethod,
            name: 'TrueMoney Wallet',
            nameThaiEng: 'ทรูมันนี่ วอลเล็ท | TrueMoney Wallet',
            description: 'สแกน QR Code จากแอป TrueMoney',
            icon: QrCode,
            color: 'bg-orange-500',
        },
    ];

    const isWalletMethod = selectedMethod === 'gacha_wallet';
    const isWalletDisabled = insufficientBalance && selectedMethod === 'gacha_wallet';

    return (
        <div className="space-y-4">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">เลือกช่องทางชำระเงิน | Select Payment Method</h3>
                {insufficientBalance && selectedMethod === 'gacha_wallet' && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-red-700 text-sm font-medium">
                            ⚠️ ยอดเงินใน Gacha Wallet ไม่เพียงพอ | Insufficient balance
                        </p>
                        <p className="text-red-600 text-xs mt-1">
                            จำนวนเงินที่ต้องใช้: ฿{finalPrice.toFixed(2)} | ยอดคงเหลือ: ฿{walletBalance.toFixed(2)}
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {methods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    const isDisabledOption = disabled || (method.id === 'gacha_wallet' && insufficientBalance);

                    let buttonStyles = '';
                    if (isSelected) {
                        buttonStyles = 'border-primary bg-primary/10 shadow-lg';
                    } else if (isDisabledOption) {
                        buttonStyles = 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50';
                    } else {
                        buttonStyles = 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50';
                    }

                    return (
                        <button
                            key={method.id}
                            onClick={() => !isDisabledOption && onMethodSelect(method.id)}
                            disabled={isDisabledOption}
                            className={`relative p-4 rounded-xl border-2 transition-all ${buttonStyles}`}
                        >
                            {/* Selection indicator */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg ${method.color} text-white`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900">{method.nameThaiEng}</p>
                                    <p className="text-xs text-gray-600 mt-1">{method.description}</p>

                                    {/* Wallet balance for Gacha Wallet */}
                                    {method.id === 'gacha_wallet' && (
                                        <p className={`text-xs font-semibold mt-2 ${insufficientBalance ? 'text-red-600' : 'text-green-600'}`}>
                                            ยอดคงเหลือ: ฿{walletBalance.toFixed(2)}
                                        </p>
                                    )}

                                    {/* Disabled badge */}
                                    {isDisabledOption && method.id === 'gacha_wallet' && (
                                        <p className="text-xs text-red-600 font-medium mt-2">ยอดเงินไม่เพียงพอ</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {isWalletMethod && !isWalletDisabled && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-blue-700 text-sm">
                        ✓ เมื่อคุณยืนยัน ระบบจะตัดเงินจาก Gacha Wallet ของคุณโดยอัตโนมัติ
                    </p>
                </div>
            )}

            {(selectedMethod === 'promptpay' || selectedMethod === 'truemoney') && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-amber-700 text-sm">
                        ℹ️ สแกน QR Code ด้วยแอปธนาคารของคุณเพื่อทำการชำระเงิน
                    </p>
                </div>
            )}
        </div>
    );
}
