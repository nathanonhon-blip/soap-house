# SOAP HOUSE — ร้านขายสบู่ + ระบบหยิบ/แพ็ก/จัดส่ง

เว็บไซต์ตัวอย่างภาษาไทย มีสินค้าเริ่มต้น 2 SKU, ตะกร้าสินค้า, ฟอร์มสั่งซื้อ และหน้าจัดการออเดอร์สำหรับพนักงาน

## ไฟล์ในโปรเจกต์
- `index.html`, `styles.css`, `app.js` — หน้าเว็บ
- `config.js` — จุดตั้งค่า URL ของ Google Apps Script
- `Code.gs` — API เชื่อม Google Sheets
- `assets/` — โฟลเดอร์สำหรับเก็บรูปสินค้าบน GitHub

## 1) เตรียม Google Sheets
สร้าง Google Spreadsheet ใหม่ แล้วสร้างชีต 2 ชีต:

**Products** (แถวแรกเป็นหัวตาราง)
| SKU | Name | Description | Price | Stock | ImageURL | Active |
|---|---|---|---:|---:|---|---|
| SOAP-01 | สบู่สมุนไพรออร์แกนิก | กลิ่นสมุนไพรสดชื่น · 100 กรัม | 129 | 35 | | TRUE |
| SOAP-02 | สบู่น้ำนมข้าว | สัมผัสนุ่มละมุน · 100 กรัม | 149 | 28 | | TRUE |

**Orders** (แถวแรกเป็นหัวตาราง)
`OrderID, CreatedAt, Customer, Phone, Address, ItemsJSON, Total, Status, Tracking`

## 2) ติดตั้ง Google Apps Script
1. ใน Google Sheets เลือก Extensions → Apps Script
2. วางเนื้อหาไฟล์ `Code.gs` ลงใน `Code.gs` แล้ว Save
3. ไปที่ Project Settings → Script Properties เพิ่ม `ADMIN_KEY` เป็นรหัสลับที่คุณกำหนดเอง
4. เลือก Deploy → New deployment → Web app
5. Execute as: Me; Who has access: Anyone (จำเป็นเพื่อให้หน้าเว็บสาธารณะเรียก API ได้)
6. Deploy และคัดลอก Web app URL

> หมายเหตุ: API สำหรับอ่านสินค้าและส่งคำสั่งซื้อเป็นสาธารณะ ส่วนอ่านออเดอร์/แก้สถานะต้องใช้ ADMIN_KEY โปรดใช้รหัสที่คาดเดายาก และอย่าใส่รหัสนี้ในไฟล์หน้าเว็บ

## 3) เชื่อมหน้าเว็บ
เปิด `config.js` แล้วใส่ URL:
```js
window.APP_CONFIG = {
  API_URL: "วาง_WEB_APP_URL_ตรงนี้",
  CURRENCY: "฿"
};
```
บันทึกและอัปโหลดไฟล์ทั้งหมดขึ้น GitHub

## 4) ทดลองบนเครื่อง
เปิด `index.html` ผ่าน Live Server (แนะนำ) หรือ deploy ไป Vercel ได้เลย
ถ้ายังไม่ตั้ง API_URL เว็บไซต์จะใช้ข้อมูลสินค้าตัวอย่างและบันทึกออเดอร์ไว้ใน localStorage ของเบราว์เซอร์เพื่อทดลองเท่านั้น

## 5) Deploy GitHub + Vercel
1. สร้าง GitHub repository เช่น `soap-house`
2. อัปโหลดไฟล์ทั้งหมด โดยเก็บรูปไว้ใน `assets/`
3. เข้า Vercel → Add New → Project → Import Git Repository
4. Framework Preset: Other; Build Command: เว้นว่าง; Output Directory: `.`; Install Command: เว้นว่าง
5. กด Deploy แล้วทดสอบ URL ที่ได้

## 6) ขั้นตอนการทำงานของพนักงาน
1. ลูกค้าสั่งซื้อจากหน้าเว็บ → รายการลงชีต Orders
2. พนักงานกด “จัดการออเดอร์” และใส่ Admin Key
3. ดูรายการหยิบสินค้า (SKU/ชื่อ/จำนวน) แล้วเปลี่ยนสถานะเป็น “กำลังแพ็ก”
4. ตรวจสอบสินค้าและที่อยู่ จากนั้นเปลี่ยนเป็น “พร้อมจัดส่ง”
5. เมื่อส่งแล้วกรอกเลขพัสดุและเปลี่ยนเป็น “จัดส่งแล้ว”

## ข้อควรทราบก่อนใช้งานจริง
- รูปสินค้าในตัวอย่างเป็นภาพกราฟิกประกอบที่สร้างด้วย CSS; เปลี่ยนเป็นภาพถ่ายจริงได้โดยใส่ URL ใน `ImageURL` และปรับหน้าเว็บให้ใช้ภาพตามต้องการ
- เวอร์ชันเริ่มต้นนี้ยังไม่ตัดสต็อกอัตโนมัติ, ไม่มีระบบชำระเงินออนไลน์ และยังไม่ส่งแจ้งเตือนลูกค้า
- การเปิด Apps Script ให้ Anyone ต้องทดสอบสิทธิ์และนโยบายข้อมูลส่วนบุคคลก่อนใช้งานจริง; ควรเพิ่ม validation, rate limiting และการป้องกันสแปม
- Admin Key ถูกส่งจากหน้าจัดการผ่าน request; สำหรับระบบเชิงพาณิชย์ควรเพิ่มระบบล็อกอินจริงและจำกัดสิทธิ์การเข้าถึง
