"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen px-4 py-12 pb-24">
            <div className="max-w-4xl mx-auto">
                <Link href="/register">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับ
                    </Button>
                </Link>

                <Card className="glass-card border-border/50">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">นโยบายความเป็นส่วนตัว (Privacy Policy)</CardTitle>
                        <p className="text-sm text-muted-foreground">Top-up Game by UID</p>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none space-y-6">
                        <div className="text-muted-foreground leading-relaxed space-y-4">
                            <p>
                                บริษัทผู้ให้บริการภายใต้ชื่อโครงการ Top-up Game by UID (ต่อไปนี้เรียกว่า "บริษัท") ตระหนักถึงความสำคัญของการคุ้มครองข้อมูลส่วนบุคคลของผู้ใช้บริการ
                                ลูกค้า คู่ค้า และบุคคลที่เกี่ยวข้อง (ต่อไปนี้เรียกว่า "เจ้าของข้อมูลส่วนบุคคล" หรือ "ท่าน")
                            </p>
                            <p>
                                บริษัทจึงจัดทำนโยบายความเป็นส่วนตัวฉบับนี้ขึ้น เพื่อชี้แจงถึงหลักเกณฑ์ วิธีการ และมาตรการในการเก็บรวบรวม ใช้ เปิดเผย โอน และเก็บรักษาข้อมูลส่วนบุคคล
                                ให้เป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) และหลักการตาม General Data Protection Regulation (GDPR) ในกรณีที่เกี่ยวข้อง
                            </p>
                        </div>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. การบังคับใช้</h2>
                            <div className="text-muted-foreground leading-relaxed space-y-2">
                                <p>1.1 นโยบายฉบับนี้ใช้บังคับกับข้อมูลส่วนบุคคลทั้งหมดที่บริษัทเก็บรวบรวมจากการให้บริการเติมเกม การสมัครสมาชิก การทำธุรกรรม การติดต่อสื่อสาร หรือกิจกรรมอื่นใดที่เกี่ยวข้องกับแพลตฟอร์มของบริษัท</p>
                                <p>1.2 นโยบายนี้ครอบคลุมถึงการประมวลผลข้อมูลในรูปแบบเอกสาร อิเล็กทรอนิกส์ ระบบอัตโนมัติ และวิธีการอื่นใดที่บริษัทใช้</p>
                                <p>1.3 ในกรณีที่มีกฎหมายเฉพาะกำหนดหลักเกณฑ์เพิ่มเติม ให้ถือว่ากฎหมายดังกล่าวมีผลบังคับเหนือกว่านโยบายนี้</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. ข้อมูลส่วนบุคคล</h2>
                            <div className="text-muted-foreground leading-relaxed space-y-2">
                                <p>
                                    "ข้อมูลส่วนบุคคล" หมายถึง ข้อมูลใดๆ ที่สามารถระบุตัวบุคคลได้โดยตรงหรือโดยอ้อม ไม่ว่าจะเป็นข้อมูลในรูปแบบใด เช่น ชื่อ-นามสกุล หมายเลขโทรศัพท์ อีเมล
                                    หมายเลขประจำตัวผู้ใช้ (UID) ข้อมูลทางการเงิน IP Address หรือข้อมูลระบุตัวตนทางออนไลน์อื่นใด
                                </p>
                                <p>
                                    ในบางกรณี บริษัทอาจประมวลผลข้อมูลอ่อนไหว (Sensitive Data) เช่น ข้อมูลชีวมิติ หรือข้อมูลยืนยันตัวตนเพิ่มเติม
                                    ทั้งนี้จะดำเนินการภายใต้ความยินยอมโดยชัดแจ้ง หรือฐานกฎหมายที่รองรับ
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. บริษัทจะจัดเก็บข้อมูลของคุณเมื่อ</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                <li>ท่านสมัครสมาชิกหรือสร้างบัญชีผู้ใช้</li>
                                <li>ท่านทำรายการสั่งซื้อหรือเติมเงินเกม</li>
                                <li>ท่านติดต่อฝ่ายบริการลูกค้า</li>
                                <li>ท่านเข้าร่วมกิจกรรมทางการตลาด</li>
                                <li>ท่านเข้าใช้งานเว็บไซต์ผ่านคุกกี้หรือเทคโนโลยีติดตาม</li>
                                <li>บริษัทมีหน้าที่ตามกฎหมายให้ต้องเก็บข้อมูล</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. บริษัทจะเก็บข้อมูลใดไว้บ้าง</h2>
                            <div className="text-muted-foreground leading-relaxed space-y-2">
                                <p>4.1 ข้อมูลระบุตัวตน เช่น ชื่อ นามสกุล อีเมล เบอร์โทรศัพท์</p>
                                <p>4.2 ข้อมูลบัญชี เช่น Username, UID เกม, ประวัติธุรกรรม</p>
                                <p>4.3 ข้อมูลการชำระเงิน เช่น ช่องทางชำระเงิน ประวัติการทำรายการ (ไม่จัดเก็บข้อมูลบัตรเต็มรูปแบบ ยกเว้นตามมาตรฐาน PCI-DSS ผ่านผู้ให้บริการรับชำระเงิน)</p>
                                <p>4.4 ข้อมูลทางเทคนิค เช่น IP Address, Device ID, Browser Type, Log Files</p>
                                <p>4.5 ข้อมูลพฤติกรรมการใช้งาน เช่น เวลาที่เข้าใช้งาน หน้าที่เข้าชม ความถี่ในการทำธุรกรรม</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">5. วิธีการเก็บรักษาข้อมูลส่วนบุคคล</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                บริษัทเก็บรักษาข้อมูลในรูปแบบฐานข้อมูลอิเล็กทรอนิกส์ที่มีระบบควบคุมสิทธิ์การเข้าถึง และอาจจัดเก็บในระบบ Cloud Computing ที่มีมาตรฐานความปลอดภัยสากล
                                พร้อมมีการเข้ารหัสข้อมูล (Encryption) ทั้งขณะส่งผ่านและขณะจัดเก็บ (Encryption in Transit & At Rest)
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">6. การประมวลผลข้อมูลส่วนบุคคล</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                บริษัทประมวลผลข้อมูลโดยอาศัยฐานกฎหมายดังต่อไปนี้:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                <li>เพื่อปฏิบัติตามสัญญา</li>
                                <li>เพื่อปฏิบัติตามกฎหมาย</li>
                                <li>เพื่อประโยชน์โดยชอบด้วยกฎหมายของบริษัท</li>
                                <li>โดยได้รับความยินยอมจากเจ้าของข้อมูล</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-2">
                                การประมวลผลรวมถึง การเก็บรวบรวม บันทึก จัดเก็บ วิเคราะห์ ปรับปรุง ใช้ เปิดเผย โอน และลบข้อมูล
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">7. แหล่งที่มาของข้อมูลส่วนบุคคล</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                บริษัทอาจได้รับข้อมูลจาก:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                <li>เจ้าของข้อมูลโดยตรง</li>
                                <li>ระบบอัตโนมัติของเว็บไซต์</li>
                                <li>ผู้ให้บริการชำระเงิน</li>
                                <li>พันธมิตรทางธุรกิจ</li>
                                <li>แหล่งข้อมูลสาธารณะ (เท่าที่กฎหมายอนุญาต)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">8. วัตถุประสงค์ในการเก็บรวบรวมข้อมูลส่วนบุคคล</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                <li>เพื่อดำเนินการเติมเกมและธุรกรรม</li>
                                <li>เพื่อยืนยันตัวตนและป้องกันการทุจริต</li>
                                <li>เพื่อปฏิบัติตามกฎหมาย เช่น AML/KYC</li>
                                <li>เพื่อปรับปรุงและพัฒนาบริการ</li>
                                <li>เพื่อสื่อสารข่าวสาร โปรโมชั่น หรือกิจกรรม</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">9. การเก็บรวบรวมข้อมูลอื่นๆ</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                บริษัทอาจเก็บข้อมูลที่ไม่สามารถระบุตัวบุคคลได้โดยตรง (Non-personal Data) เช่น ข้อมูลสถิติการใช้งาน เพื่อการวิเคราะห์เชิงสถิติและพัฒนาระบบ
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">10. บริษัทคุ้มครองและเก็บรักษาข้อมูลส่วนบุคคลอย่างไรบ้าง</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                บริษัทใช้มาตรการด้านเทคนิคและองค์กร เช่น:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                <li>การเข้ารหัสข้อมูล</li>
                                <li>Firewall และ Intrusion Detection Systems</li>
                                <li>การจำกัดสิทธิ์เข้าถึงตามหน้าที่ (Role-Based Access Control)</li>
                                <li>การทำ Data Protection Impact Assessment (DPIA)</li>
                                <li>การฝึกอบรมพนักงานด้านการคุ้มครองข้อมูล</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">11. บริษัทเปิดเผยข้อมูลแก่บุคคลภายนอกหรือไม่</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                บริษัทจะไม่เปิดเผยข้อมูล เว้นแต่:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                <li>ได้รับความยินยอมจากเจ้าของข้อมูล</li>
                                <li>จำเป็นเพื่อปฏิบัติตามสัญญา</li>
                                <li>เป็นไปตามกฎหมายหรือคำสั่งศาล</li>
                                <li>เป็นการเปิดเผยต่อผู้ประมวลผลข้อมูล (Data Processor) ภายใต้สัญญาคุ้มครองข้อมูล</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">12. ระยะเวลาจัดเก็บข้อมูลส่วนบุคคล</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                บริษัทจะเก็บข้อมูลเท่าที่จำเป็นตามวัตถุประสงค์ที่กำหนด หรือระยะเวลาที่กฎหมายกำหนด เช่น 5–10 ปีตามกฎหมายบัญชีและภาษี
                                หลังจากนั้นจะลบหรือทำให้ไม่สามารถระบุตัวบุคคลได้ (Anonymization)
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">13. สิทธิของเจ้าของข้อมูลส่วนบุคคล</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                เจ้าของข้อมูลมีสิทธิ:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                <li>ขอเข้าถึงข้อมูล</li>
                                <li>ขอแก้ไขข้อมูล</li>
                                <li>ขอให้ลบข้อมูล</li>
                                <li>ขอให้จำกัดการประมวลผล</li>
                                <li>คัดค้านการประมวลผล</li>
                                <li>ขอรับข้อมูลในรูปแบบโอนย้ายได้</li>
                                <li>ถอนความยินยอม</li>
                                <li>ร้องเรียนต่อคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">14. เทคโนโลยีติดตามตัวบุคคล (Cookies)</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                บริษัทใช้ Cookies และเทคโนโลยีที่คล้ายคลึงกันเพื่อ:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                <li>จดจำการตั้งค่าของผู้ใช้</li>
                                <li>วิเคราะห์พฤติกรรมการใช้งาน</li>
                                <li>ปรับปรุงประสบการณ์การใช้งาน</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-2">
                                ผู้ใช้สามารถตั้งค่าบราวเซอร์เพื่อปฏิเสธคุกกี้ได้ แต่บางฟังก์ชันอาจไม่สามารถใช้งานได้เต็มประสิทธิภาพ
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">15. การรักษาความมั่นคงปลอดภัยของข้อมูลส่วนบุคคล</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                บริษัทดำเนินมาตรการรักษาความมั่นคงปลอดภัยตามมาตรฐานสากล เช่น ISO/IEC 27001 (ถ้ามีการรับรอง) และมีการทดสอบระบบอย่างสม่ำเสมอเพื่อป้องกันความเสี่ยง
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">16. การแจ้งเหตุละเมิดข้อมูลส่วนบุคคล</h2>
                            <p className="text-muted-foreground leading-relaxed mb-2">
                                ในกรณีเกิดเหตุละเมิดข้อมูลส่วนบุคคล บริษัทจะ:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                <li>ประเมินความเสี่ยงโดยทันที</li>
                                <li>แจ้งสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคลภายใน 72 ชั่วโมง (หากเข้าข่ายตามกฎหมาย)</li>
                                <li>แจ้งเจ้าของข้อมูลหากมีความเสี่ยงสูงต่อสิทธิและเสรีภาพ</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">17. การแก้ไขเปลี่ยนแปลงนโยบายความเป็นส่วนตัว</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                บริษัทอาจแก้ไขนโยบายนี้เป็นครั้งคราว โดยจะแจ้งผ่านเว็บไซต์หรือช่องทางที่เหมาะสม การใช้บริการต่อเนื่องหลังการแก้ไขถือเป็นการรับทราบและยอมรับการเปลี่ยนแปลงดังกล่าว
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
