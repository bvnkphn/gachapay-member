"use client";
import { createContext, useContext, useState } from "react";

export type Lang = "th" | "en";

const translations = {
  th: {
    platform: "แพลตฟอร์มเติมเกมอันดับ 1",
    fast: "เติมไว",
    fastDesc: "รับไอเทมภายใน 1-5 นาที",
    safe: "ปลอดภัย 100%",
    safeDesc: "ระบบความปลอดภัยระดับสูง",
    support: "ซัพพอร์ต",
    supportDesc: "ทีมงานพร้อมช่วยเหลือ",
    always: "24/7",
    alwaysDesc: "บริการตลอด 24 ชั่วโมง",
    search: "ค้นหาเกม...",
    login: "เข้าสู่ระบบ",
    register: "สมัครสมาชิก",
    noAccount: "ยังไม่มีบัญชี?",
    forgot: "ลืมรหัสผ่าน?",
    email: "Email",
    password: "Password",
    divider: "หรือ",
    google: "Google",
    facebook: "Facebook",
    logoDesc: "เข้าสู่ระบบเพื่อเติมเกมได้ทันที",
    errorEmpty: "กรุณากรอก Email และ Password",
    errorEmail: "รูปแบบ Email ไม่ถูกต้อง",
    errorPassword: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    errorLogin: "Email หรือรหัสผ่านไม่ถูกต้อง",
    success: "เข้าสู่ระบบสำเร็จ",
    // Support Page
    supportTitle: "ศูนย์ช่วยเหลือ",
    supportSubtitle: "ค้นหาคำตอบด้วยตนเอง หรือติดต่อทีมงานได้ตลอด 24 ชม.",
    faqTitle: "คำถามที่พบบ่อย (FAQ)",
    allCategories: "ทั้งหมด",
    noFaqFound: "ไม่พบคำถามในหมวดนี้",
    videoTitle: "วิดีโอแนะนำการใช้งาน",
    videoPlaceholder: "วิดีโอแนะนำขั้นตอนการเติมเงินและใช้งานระบบ — เร็วๆ นี้",
    contactTitle: "ช่องทางติดต่อเจ้าหน้าที่",
    contactSubtitle: "หาก FAQ ไม่สามารถแก้ปัญหาได้ สามารถติดต่อทีมงานผ่านช่องทางด้านล่าง",
    stillHaveQuestion: "หากยังมีข้อสงสัย?",
    createTicket: "สร้างตั๋ว",
    // Create Ticket Page
    back: "กลับ",
    createTicketTitle: "ติดต่อฝ่ายบริการลูกค้า",
    selectProblem: "เลือกประเภทปัญหา",
    selectProblemPlaceholder: "เลือกประเภทปัญหา",
    userId: "ไอดีผู้ใช้",
    userIdPlaceholder: "",
    userIdHelper: "...",
    paymentMethod: "วิธีการชำระเงิน",
    paymentMethodPlaceholder: "",
    paymentMethodHelper: "วิธีการชำระเงินที่คุณใช้ระหว่างการซื้อ",
    emailPlaceholder: "example@gmail.com",
    emailHelper: "อีเมลที่คุณใช้ในการลงทะเบียนหรือที่สามารถติดต่อกลับได้",
    description: "มีอะไรผิดปกติไหม",
    descriptionPlaceholder: "ให้รายละเอียดเกี่ยวกับสิ่งที่คุณกำลัง...",
    descriptionHelper: "โปรดให้ข้อมูลเพิ่มเติมที่สามารถช่วยให้เราแก้ไขปัญหาได้ ยิ่งคุณให้รายละเอียดมากเท่าไหร่ ก็ยิ่งจะเป็นการแก้ไขที่รวดเร็วยิ่งขึ้นเท่านั้น",
    imageUpload: "รูปภาพเพิ่มเติม",
    optional: "(ถ้ามี)",
    dragDrop: "ลากและวางรูปภาพหรือ",
    selectImage: "เลือกรูปภาพ",
    supportedFormats: "รูปแบบที่รองรับ: PNG, JPG, JPEG",
    infoText: "ภาพหน้าจอการโอนเงิน หรือ ไอดีผู้ใช้ในเกม จะช่วยให้เราสามารถแก้ไขปัญหาได้เร็วขึ้น",
    submit: "สร้างตั๋ว",
    successTitle: "สร้างตั๋วแล้ว",
    successMessage: "เราจะตรวจสอบปัญหาและแก้ไขโดยเร็วที่สุด",
    successSubMessage: "คุณจะได้รับการอัปเดตเพิ่มเติมทางอีเมล",
    viewTicket: "ดูตั๋ว",
    backToSupport: "กลับไปที่ช่วยเหลือ",
    fillAllFields: "กรุณากรอกข้อมูลให้ครบถ้วน",
    invalidFileType: "กรุณาอัปโหลดไฟล์ภาพเท่านั้น (PNG, JPG, JPEG)",
    problemTypes: {
      "missing-payment": "แจ้งการชำระเงินไม่เข้า",
      "incorrect-amount": "แจ้งจำนวนไอเทมไม่ถูกต้อง",
      "wrong-user-id": "User ID หรือ Server ผิด",
      "payment-gateway": "ปัญหาช่องทางชำระเงิน",
      "account-issue": "ปัญหาบัญชีผู้ใช้",
      "other": "อื่นๆ",
    },
    // FAQ Categories
    faqCategories: {
      topup: "การเติมเงิน",
      payment: "การชำระเงิน",
      security: "ความปลอดภัย",
      vip: "VIP & โปรโมชั่น",
      problem: "แก้ปัญหา",
      general: "ทั่วไป",
    }
  },
  en: {
    platform: "#1 Game Top-up Platform",
    fast: "Fast",
    fastDesc: "Receive items in 1-5 minutes",
    safe: "100% Safe",
    safeDesc: "High security system",
    support: "Support",
    supportDesc: "Our team is ready to help",
    always: "24/7",
    alwaysDesc: "Service available 24/7",
    search: "Search games...",
    login: "Login",
    register: "Register",
    noAccount: "Don't have an account?",
    forgot: "Forgot password?",
    email: "Email",
    password: "Password",
    divider: "OR",
    google: "Google",
    facebook: "Facebook",
    logoDesc: "Login to top up your game instantly",
    errorEmpty: "Please enter Email and Password",
    errorEmail: "Invalid Email format",
    errorPassword: "Password must be at least 8 characters",
    errorLogin: "Incorrect Email or Password",
    success: "Login successful",
    // Support Page
    supportTitle: "Help Center",
    supportSubtitle: "Find answers yourself or contact our team 24/7",
    faqTitle: "Frequently Asked Questions (FAQ)",
    allCategories: "All",
    noFaqFound: "No questions found in this category",
    videoTitle: "Tutorial Videos",
    videoPlaceholder: "Tutorial videos for top-up and system usage — Coming soon",
    contactTitle: "Contact Support Team",
    contactSubtitle: "If FAQ cannot solve your problem, you can contact our team through the channels below",
    stillHaveQuestion: "Still have questions?",
    createTicket: "Create Ticket",
    // Create Ticket Page
    back: "Back",
    createTicketTitle: "Contact Customer Service",
    selectProblem: "Select Problem Type",
    selectProblemPlaceholder: "Select problem type",
    userId: "User ID",
    userIdPlaceholder: "",
    userIdHelper: "...",
    paymentMethod: "Payment Method",
    paymentMethodPlaceholder: "",
    paymentMethodHelper: "Payment method you used during purchase",
    emailPlaceholder: "example@gmail.com",
    emailHelper: "Email you used for registration or can be contacted",
    description: "What's wrong",
    descriptionPlaceholder: "Provide details about what you're experiencing...",
    descriptionHelper: "Please provide additional information that can help us fix the problem. The more details you provide, the faster the resolution will be",
    imageUpload: "Additional Image",
    optional: "(Optional)",
    dragDrop: "Drag and drop image or",
    selectImage: "Select Image",
    supportedFormats: "Supported formats: PNG, JPG, JPEG",
    infoText: "Screenshot of money transfer or user ID in game will help us fix the problem faster",
    submit: "Create Ticket",
    successTitle: "Ticket Created",
    successMessage: "We will review the issue and fix it as soon as possible",
    successSubMessage: "You will receive updates via email",
    viewTicket: "View Ticket",
    backToSupport: "Back to Support",
    fillAllFields: "Please fill in all required fields",
    invalidFileType: "Please upload image files only (PNG, JPG, JPEG)",
    problemTypes: {
      "missing-payment": "Report Missing Payment",
      "incorrect-amount": "Report Incorrect Item Amount",
      "wrong-user-id": "Wrong User ID or Server",
      "payment-gateway": "Payment Gateway Issues",
      "account-issue": "Account Issues",
      "other": "Other",
    },
    // FAQ Categories
    faqCategories: {
      topup: "Top-up",
      payment: "Payment",
      security: "Security",
      vip: "VIP & Promotions",
      problem: "Troubleshooting",
      general: "General",
    }
  }
};

const LanguageContext = createContext({
  lang: "th" as Lang,
  setLang: (l: Lang) => { },
  t: translations.th,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("th");
  const t = translations[lang];
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
