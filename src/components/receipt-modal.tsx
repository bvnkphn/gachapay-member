"use client";

import { useRef, useState, useEffect } from "react";
import { X, Printer } from "lucide-react";
import { api } from "@/lib/api";

interface ReceiptOrder {
  order_id: string;
  created_at: string;
  game_name: string;
  package_name: string;
  total_price: number | string;
  payment_method: string;
  status_label: string;
}

interface ReceiptModalProps {
  order: ReceiptOrder;
  user: { name?: string; email?: string } | null;
  onClose: () => void;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear() + 543; // Thai Buddhist year format
  return `${dd}/${mm}/${yyyy}`;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

function fmtCurrency(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PAYMENT_LABELS: Record<string, string> = {
  coin: "Coin Wallet", wallet: "Coin Wallet", gacha_wallet: "Coin Wallet",
  truemoney: "TrueMoney Wallet", truewallet: "TrueMoney Wallet", true_wallet: "TrueMoney Wallet",
  qr: "PromptPay QR", promptpay: "PromptPay QR",
  bank_transfer: "Bank Transfer (โอนเงินสด)", banktransfer: "Bank Transfer (โอนเงินสด)",
  free: "ไม่มีค่าบริการ",
};
function fmtPayment(raw: string | null | undefined): string {
  if (!raw || raw === "-" || raw === "unknown") return "-";
  return PAYMENT_LABELS[raw.toLowerCase()] ?? raw;
}

function numberToThaiText(n: number): string {
  if (n === 0) return "ศูนย์บาทถ้วน";
  const digits = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const positions = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);

  function convertInt(num: number): string {
    if (num === 0) return "";
    const s = String(num);
    let result = "";
    const len = s.length;
    for (let i = 0; i < len; i++) {
      const d = Number.parseInt(s[i]);
      const pos = len - i - 1;
      if (d === 0) continue;
      if (pos === 0 && d === 1 && len > 1) {
        result += "เอ็ด";
      } else if (pos === 1 && d === 1) {
        result += "สิบ";
      } else if (pos === 1 && d === 2) {
        result += "ยี่สิบ";
      } else {
        result += digits[d] + positions[pos];
      }
    }
    return result;
  }

  let text = convertInt(intPart) + "บาท";
  if (decPart > 0) {
    text += convertInt(decPart) + "สตางค์";
  } else {
    text += "ถ้วน";
  }
  return text;
}

const PRINT_STYLE = `
@media print {
  /* Hide all elements on the screen during print */
  body * {
    visibility: hidden !important;
  }
  /* Show only the receipt paper card and its children */
  #print-receipt-paper, #print-receipt-paper * {
    visibility: visible !important;
  }
  /* Position the paper container at the absolute top-left of the page */
  #print-receipt-paper {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  /* Hide input editing form in print */
  .print-hide {
    display: none !important;
  }
  /* Show printed version of user inputs in print */
  .print-show {
    display: block !important;
  }
}
`;

export default function ReceiptModal({ order, user, onClose }: ReceiptModalProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const price = typeof order.total_price === "string" ? Number.parseFloat(order.total_price) : order.total_price;
  const docNumber = `QT${new Date(order.created_at).getFullYear()}${String(new Date(order.created_at).getMonth() + 1).padStart(2, "0")}${order.order_id.padStart(5, "0")}`;

  // Interactive customer input details (pre-filled from database addresses)
  const [customerName, setCustomerName] = useState(user?.name || "ลูกค้าทั่วไป");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  useEffect(() => {
    api.getAddresses()
      .then((addrList: any[]) => {
        if (addrList && addrList.length > 0) {
          // Find default address or fall back to first address in the array
          const addr = addrList.find((a: any) => a.isDefault) || addrList[0];
          if (addr) {
            setCustomerName(addr.recipientName || user?.name || "ลูกค้าทั่วไป");
            setCustomerPhone(addr.phone || "");
            
            const line2Str = addr.addressLine2 ? ` ${addr.addressLine2}` : "";
            const formatted = `${addr.addressLine1}${line2Str} ต. ${addr.subDistrict} อ. ${addr.district} จ. ${addr.province} ${addr.postalCode}`;
            setCustomerAddress(formatted);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load user address for receipt prefill:", err);
      });
  }, [user]);

  const priceBeforeVat = price / 1.07;
  const vatAmount = price - priceBeforeVat;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLE }} />

      <div
        className="receipt-print-root fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-xs"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Backdrop overlay */}
        <div className="receipt-overlay fixed inset-0" />

        {/* Content Container Box */}
        <div className="relative z-10 w-full max-w-[800px] my-2">
          
          {/* Action header bar */}
          <div className="receipt-actions flex items-center justify-end gap-2.5 mb-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition shadow-md cursor-pointer"
            >
              <Printer size={14} />
              พิมพ์ใบเสร็จ / บันทึก PDF
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 hover:text-black transition border border-neutral-300 shadow-md cursor-pointer font-bold text-xs"
              aria-label="Close"
            >
              <X size={14} className="stroke-[3px]" />
              <span>ปิดหน้าต่าง</span>
            </button>
          </div>

          {/* Receipt paper sheet */}
          <div
            id="print-receipt-paper"
            ref={paperRef}
            className="receipt-paper bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden relative text-neutral-800"
          >
            {/* Top-Right Decorative Corner Triangle (Primary Sky Blue) */}
            <div
              className="absolute top-0 right-0 w-0 h-0"
              style={{
                borderStyle: "solid",
                borderWidth: "0 110px 110px 0",
                borderColor: "transparent #0ea5e9 transparent transparent",
              }}
            />

            {/* Inner Content Padding */}
            <div className="p-10 space-y-8">
              
              {/* Header: Company & Title info */}
              <div className="flex justify-between items-start">
                
                {/* Left: Company Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    {/* Stylized blue game controller / isometric cube logo */}
                    <div className="text-sky-500">
                      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 22 7 22 17 12 22 2 17 2 7 12 2" fill="rgba(14,165,233,0.06)"/>
                        <polyline points="2 7 12 12 22 7" />
                        <line x1="12" y1="12" x2="12" y2="22" />
                        <polyline points="12 12 22 17" />
                        <polyline points="12 12 2 17" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-black tracking-tight text-sky-500 leading-none">GACHAPAY</h1>
                      <span className="text-[10px] text-sky-400 font-semibold tracking-wider">Game Top-up Platform</span>
                    </div>
                  </div>
                  
                  <div className="text-[11px] leading-relaxed text-neutral-500">
                    <p className="font-semibold text-neutral-800">บริษัท กาชาเพย์ จำกัด (สำนักงานใหญ่)</p>
                    <p>เลขที่ 1 อาคารเอ็มไพร์ ทาวเวอร์ ชั้น 47 ห้อง 4703 ถ.สาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ 10120</p>
                    <p>เลขประจำตัวผู้เสียภาษี <span className="font-semibold text-neutral-700">0105563164674</span></p>
                    <p>โทร. 02-686-1209 &nbsp;|&nbsp; อีเมล: support@gachapay.in.th</p>
                    <p>www.gachapay.in.th</p>
                  </div>
                </div>

                {/* Right: Invoice details */}
                <div className="text-right space-y-4 pt-4 pr-12 flex-shrink-0">
                  <h2 className="text-2xl font-bold tracking-wide text-sky-500">ใบเสร็จรับเงิน</h2>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-left">
                    <span className="font-semibold text-sky-500 text-right">เลขที่</span>
                    <span className="font-mono text-neutral-800">: &nbsp;{docNumber}</span>
                    
                    <span className="font-semibold text-sky-500 text-right">วันที่</span>
                    <span className="font-mono text-neutral-800">: &nbsp;{fmtDate(order.created_at)}</span>
                    
                    <span className="font-semibold text-sky-500 text-right">ผู้ขาย</span>
                    <span className="text-neutral-800">: &nbsp;บริษัท กาชาเพย์ จำกัด</span>
                  </div>
                </div>

              </div>

              {/* Customer Box Info - Unified plain text style matching company layout */}
              <div className="py-3.5 space-y-1 border-t border-neutral-200">
                <span className="text-[10px] font-extrabold text-sky-500 uppercase tracking-wider block">ข้อมูลลูกค้า / Customer Details</span>
                <div className="text-[11px] leading-relaxed text-neutral-500">
                  <p className="font-semibold text-neutral-800">{customerName || "ลูกค้าทั่วไป"}</p>
                  {user?.email && <p>อีเมล: <span className="font-mono text-neutral-700">{user.email}</span></p>}
                  <p>เบอร์โทรศัพท์: <span className="text-neutral-700">{customerPhone || "ไม่มี"}</span></p>
                  <p>ที่อยู่สำหรับออกใบกำกับภาษี: <span className="text-neutral-700">{customerAddress || "ไม่มี"}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-800 border-b border-neutral-200">
                      <th className="py-2.5 px-4 font-bold text-center w-12 border-r border-neutral-200">#</th>
                      <th className="py-2.5 px-4 font-bold border-r border-neutral-200">รายละเอียด</th>
                      <th className="py-2.5 px-4 font-bold text-center w-16 border-r border-neutral-200">จำนวน</th>
                      <th className="py-2.5 px-4 font-bold text-right w-28 border-r border-neutral-200">ราคาต่อหน่วย</th>
                      <th className="py-2.5 px-4 font-bold text-center w-20 border-r border-neutral-200">ส่วนลด</th>
                      <th className="py-2.5 px-4 font-bold text-right w-32">มูลค่า</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-neutral-800 border-b border-neutral-100 last:border-b-0">
                      <td className="py-4 px-4 text-center text-neutral-400 border-r border-neutral-200">1</td>
                      <td className="py-4 px-4 space-y-0.5 border-r border-neutral-200">
                        <p className="font-bold text-neutral-950 text-xs">เติมเกม {order.game_name}</p>
                        <p className="text-[10px] text-neutral-400">แพ็กเกจ: {order.package_name}</p>
                      </td>
                      <td className="py-4 px-4 text-center border-r border-neutral-200">1</td>
                      <td className="py-4 px-4 text-right font-mono border-r border-neutral-200">{fmtCurrency(price)}</td>
                      <td className="py-4 px-4 text-center text-neutral-400 border-r border-neutral-200">-</td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-neutral-950">{fmtCurrency(price)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom calculations & Thai Text */}
              <div className="flex justify-between items-start gap-6 pt-2">
                
                {/* Left: Word amount in Thai */}
                <div className="flex-1">
                  <span className="text-[10px] text-neutral-400 font-bold block mb-1">จำนวนเงิน (ตัวอักษร)</span>
                  <p className="text-xs font-semibold text-neutral-700 italic">
                    ({numberToThaiText(price)})
                  </p>
                </div>

                {/* Right: Subtotal & Tax Grand Totals */}
                <div className="w-64 text-xs space-y-2 border-t border-neutral-100 pt-2">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span>รวมเป็นเงิน</span>
                    <span className="font-mono font-semibold text-neutral-800">{fmtCurrency(priceBeforeVat)} บาท</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-500">
                    <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                    <span className="font-mono font-semibold text-neutral-800">{fmtCurrency(vatAmount)} บาท</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-800 border-t border-sky-200 pt-2 font-bold text-sm">
                    <span className="text-sky-500">จำนวนเงินรวมทั้งสิ้น</span>
                    <span className="font-mono text-neutral-950">{fmtCurrency(price)} บาท</span>
                  </div>
                </div>

              </div>

              {/* Remarks Notes Section */}
              <div className="pt-2">
                <span className="text-xs font-bold text-sky-500 block mb-1">หมายเหตุ</span>
                <div className="text-[10px] leading-relaxed text-neutral-400 space-y-0.5">
                  <p>• สินค้ารวมภาษีมูลค่าเพิ่มแล้ว</p>
                  <p>• เงื่อนไขชำระเงิน: ชำระเงินเรียบร้อยผ่านระบบอิเล็กทรอนิกส์ ({fmtPayment(order.payment_method)}) เมื่อวันที่ {fmtDate(order.created_at)} เวลา {fmtTime(order.created_at)} น.</p>
                  <p>• ราคาก่อนภาษีมูลค่าเพิ่ม: ฿{fmtCurrency(priceBeforeVat)} &nbsp;|&nbsp; ภาษีมูลค่าเพิ่ม (7%): ฿{fmtCurrency(vatAmount)}</p>
                </div>
              </div>

              {/* Signature blocks divider */}
              <div className="border-t border-dashed border-neutral-300 my-6" />

              {/* Footers: Signatures */}
              <div className="flex items-end justify-between gap-12 pt-4">
                
                {/* Left signature: Customer */}
                <div className="text-center space-y-5 flex-1 max-w-[260px]">
                  <p className="text-[10px] text-neutral-400">ในนามลูกค้า</p>
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-xs font-bold text-neutral-800">{customerName || "-"}</span>
                  </div>
                  <div className="border-t border-neutral-300 pt-1.5 mx-2">
                    <p className="text-[10px] text-neutral-500">ผู้สั่งซื้อสินค้า</p>
                  </div>
                </div>

                {/* Center brand logo representation */}
                <div className="flex flex-col items-center justify-center opacity-80">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-6 h-6 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="12 2 22 7 22 17 12 22 2 17 2 7 12 2" fill="rgba(14,165,233,0.06)"/>
                      <polyline points="2 7 12 12 22 7" />
                      <line x1="12" y1="12" x2="12" y2="22" />
                    </svg>
                    <span className="text-xs font-black tracking-tight text-sky-500 leading-none">GACHAPAY</span>
                  </div>
                  <span className="text-[7px] text-neutral-400">บริษัท กาชาเพย์ จำกัด</span>
                </div>

                {/* Right signature: Company Approver */}
                <div className="text-center space-y-5 flex-1 max-w-[260px]">
                  <p className="text-[10px] text-neutral-400">ในนาม บริษัท กาชาเพย์ จำกัด</p>
                  <div className="h-10 flex items-center justify-center">
                    <span className="font-mono text-sky-600/80 italic text-sm select-none">GachaPay Co.</span>
                  </div>
                  <div className="border-t border-neutral-300 pt-1.5 mx-2 flex justify-between text-[10px] text-neutral-500 px-1">
                    <span>ผู้อนุมัติ</span>
                    <span className="font-mono">{fmtDate(order.created_at)}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom accent border bar */}
            <div className="h-2" style={{ background: "linear-gradient(90deg, #38bdf8, #0ea5e9, #0284c7)" }} />
          </div>
        </div>
      </div>
    </>
  );
}
