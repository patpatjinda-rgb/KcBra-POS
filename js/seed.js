/**
 * KC Bra / KCP&P Shop - Seed Data Generator
 * Extracted directly from user Google Sheet + Assorted Colors (คละสี) option for all products
 */

const SEED_DATA = (() => {

    const RAW_ITEMS = [
        { sku: "No. 023", category: "Bra", colors: ["ดำ", "ชมพู", "เนื้อ"], size: "36, 38, 40, 42", price: 660 },
        { sku: "No. 068", category: "Bra", colors: ["ดำ", "เทา", "เนื้อ", "ขาว", "ชมพู"], size: "M, L, XL", price: 640 },
        { sku: "No. 0777", category: "Bra", colors: ["ดำ", "ดำชมพู", "เทา", "น้ำเงิน", "น้ำตาลเข้ม", "ทอง", "เนื้อ", "มังคุด", "กะปิ"], size: "34, 36, 38, 40, 42, 44, 46", price: 840 },
        { sku: "No. B009", category: "Shapewear Control", colors: ["กรม", "เนื้อ", "ขาว", "แดง"], size: "Freesize", price: 480 },
        { sku: "No. B010", category: "Bra", colors: ["ดำ", "เทาเข้ม", "เทาอ่อน", "เทาเขียว", "กรม", "ฟ้า", "แดง", "ม่วงเข้ม", "ม่วงอ่อน", "ชมพูเข้ม", "กะปิ", "ชมพูอ่อน", "น้ำตาลเข้ม", "ชาไทย", "ทอง", "เนื้อ", "ไข่ไก่", "ขาว"], size: "34, 36, 38, 40, 42, 44, 46, 48", price: 640 },
        { sku: "No. B016", category: "Bra", colors: ["ดำ", "เนื้อ", "ขาว"], size: "34, 36, 38, 40", price: 640 },
        { sku: "No. W094", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "XL, 2XL, 3XL", price: 920 },
        { sku: "No. 12", category: "Panty", colors: ["ดำ", "แดง", "เนื้อ", "ขาว"], size: "M, L, XL, 2XL", price: 115 },
        { sku: "No. 113", category: "Bra", colors: ["ดำ", "เทา", "น้ำตาล", "ทอง", "เนื้อ", "กะปิ"], size: "34, 36, 38, 40, 42", price: 640 },
        { sku: "No. 118", category: "Bra", colors: ["ดำ", "น้ำเงิน", "เนื้อ", "โอรส", "ขาว"], size: "34, 36, 38, 40", price: 780 },
        { sku: "No. 188", category: "Bra", colors: ["ดำ", "ขาว", "ชมพู"], size: "Freesize", price: 720 },
        { sku: "No. 1001", category: "Bra", colors: ["ดำ", "เทา", "เนื้อ", "ขาว", "ชมพู"], size: "M, L, XL, 2XL", price: 760 },
        { sku: "No. 1009", category: "Bra", colors: ["ดำ", "เทาเข้ม", "น้ำตาล", "ทอง", "เนื้อ", "กะปิ", "ชมพู", "ม่วง"], size: "32, 34, 36, 38, 40", price: 740 },
        { sku: "No. 1112", category: "Inner Bra Tops", colors: ["เขียวนีออน", "ชมพูนีออน", "ม่วง", "เหลือง", "ขาว"], size: "Freesize", price: 40 },
        { sku: "No. 1118", category: "Bra", colors: ["ดำ", "เนื้อ", "ขาว", "ชมพู"], size: "Freesize", price: 780 },
        { sku: "No. 11180", category: "Bra", colors: ["ดำ", "น้ำตาล", "เนื้อ", "เทา", "น้ำเงิน"], size: "34, 36, 38, 40, 42", price: 840 },
        { sku: "No. 1310", category: "Panty", colors: ["ดำ", "เทา", "น้ำเงิน", "เนื้อ"], size: "M, L, XL, 2XL", price: 105 },
        { sku: "No. 1687", category: "Bra", colors: ["ดำ", "เทา", "น้ำเงิน", "เนื้อ", "ขาว", "ชมพูเข้ม", "ชมพูอ่อน"], size: "34, 36, 38, 40", price: 600 },
        { sku: "No. 1711", category: "Bra", colors: ["ดำ", "เทาเข้ม", "เทาอ่อน", "น้ำตาล", "โอวัลติน", "เนื้อ", "กะปิ"], size: "34, 36, 38, 40, 42, 44", price: 740 },
        { sku: "No. 1908", category: "Bra", colors: ["ดำ", "เทา", "เนื้อ", "ชมพู"], size: "34, 36, 38", price: 860 },
        { sku: "No. B3599", category: "Bra", colors: ["ดำ", "เทา", "น้ำเงิน", "เนื้อ", "ชมพู", "ม่วง"], size: "34, 36, 38, 40, 42", price: 640 },
        { sku: "No. FE119", category: "Inner Bra Tops", colors: ["เนื้อ", "ขาว", "เขียวนีออน", "ชมพูนีออน"], size: "Freesize", price: 380 },
        { sku: "No. H190", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "L, XL", price: 780 },
        { sku: "No. W119", category: "Bra", colors: ["ดำ", "เนื้อ", "ชมพู"], size: "L, XL", price: 840 },
        { sku: "No. W146", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "L, XL", price: 840 },
        { sku: "No. 220", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "M, L, XL", price: 780 },
        { sku: "No. 231", category: "Bra", colors: ["ดำ", "ขาว", "ชมพู"], size: "32, 34, 36", price: 720 },
        { sku: "No. 235", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "34, 36, 38", price: 720 },
        { sku: "No. 267", category: "Bra", colors: ["ดำ", "เนื้อ", "ชมพู", "เทา"], size: "32, 34, 36, 38", price: 680 },
        { sku: "No. 268", category: "Bra", colors: ["ดำ", "แดง"], size: "32, 34, 36, 38", price: 680 },
        { sku: "No. 269", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "32, 34, 36, 38", price: 720 },
        { sku: "No. 274", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "32, 34, 36, 38", price: 720 },
        { sku: "No. 2008", category: "Bra", colors: ["ดำ", "เนื้อ", "ไวน์แดง"], size: "34, 36, 38, 40, 42", price: 680 },
        { sku: "No. 2019", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "38, 40, 42, 44, 46, 48, 50, 52", price: 660 },
        { sku: "No. 2020", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "38, 40, 42, 44, 46, 48, 50, 52", price: 710 },
        { sku: "No. 2044", category: "Bra", colors: ["ดำ", "เนื้อ", "โกโก้"], size: "34, 36, 38, 40, 42, 44, 46", price: 760 },
        { sku: "No. 2054", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "36, 38, 40, 42, 44", price: 710 },
        { sku: "No. 2061", category: "Bra", colors: ["ดำ", "เนื้อ", "น้ำตาล", "กะปิ", "เทา"], size: "36, 38, 40, 42, 44, 46", price: 690 },
        { sku: "No. 312", category: "Panty", colors: ["ดำ", "เนื้อ", "พาสเทล"], size: "M, L, XL, 2XL", price: 120 },
        { sku: "No. 328", category: "Panty", colors: ["ดำ", "เนื้อ", "ชมพู"], size: "34, 36, 38, 40, 42", price: 110 },
        { sku: "No. 329", category: "Panty", colors: ["ดำ", "เนื้อ"], size: "34, 36, 38", price: 110 },
        { sku: "No. 330", category: "Panty", colors: ["ดำ", "เนื้อ"], size: "34, 36, 38", price: 110 },
        { sku: "No. 343", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "34, 36, 38, 40, 42, 44", price: 670 },
        { sku: "No. 368", category: "Bra", colors: ["ดำ", "ไวน์แดง"], size: "34, 36, 38, 40, 42", price: 600 },
        { sku: "No. 3020", category: "Bra", colors: ["ดำ", "โอวัลติน", "เนื้อ"], size: "34, 36, 38", price: 780 },
        { sku: "No. 3036", category: "Bra", colors: ["ดำ", "เทา", "น้ำเงิน", "น้ำตาล", "เนื้อ", "กะปิ", "ไข่ไก่"], size: "34, 36, 38, 40, 42", price: 670 },
        { sku: "No. 3081", category: "Bra", colors: ["ดำ", "ไข่ไก่", "เนื้อ", "โอรส", "ชมพู"], size: "36, 38, 40, 42, 44, 46, 48, 50, 52", price: 690 },
        { sku: "No. 3228", category: "Bra", colors: ["ดำ", "เทา", "น้ำตาล", "เนื้อ", "กะปิ"], size: "34, 36, 38, 40, 42", price: 670 },
        { sku: "No. 3313", category: "Bra", colors: ["ดำ", "ขาว", "ชมพู", "เทา", "เขียว"], size: "32, 34, 36", price: 640 },
        { sku: "No. 3355", category: "Bra", colors: ["ดำ", "เทา", "ฟ้าอ่อน", "แดง", "ชมพู", "โอรส", "เนื้อ"], size: "34, 36, 38, 40, 42, 44, 46", price: 740 },
        { sku: "No. 3366", category: "Bra", colors: ["ดำ", "เทา", "น้ำเงิน", "ฟ้าอ่อน", "แดง", "น้ำตาลเข้ม", "น้ำตาลอ่อน", "เนื้อ", "กะปิ"], size: "34, 36, 38, 40, 42, 44, 46", price: 720 },
        { sku: "No. 3688", category: "Bra", colors: ["ดำ", "น้ำเงิน", "น้ำตาล", "เนื้อ", "ไข่ไก่", "กะปิ", "ชมพู", "ขาว"], size: "32, 34, 36, 38, 40, 42", price: 640 },
        { sku: "No. 407", category: "Bra", colors: ["ดำ", "น้ำเงิน", "ม่วง", "แดง", "เนื้อ"], size: "38, 40, 42, 44, 46", price: 840 },
        { sku: "No. 450", category: "Bra", colors: ["ดำ", "โอวัลติน", "เนื้อ"], size: "32, 34, 36, 38", price: 720 },
        { sku: "No. 503", category: "Bra", colors: ["ดำ", "ทอง", "เนื้ออ่อน", "ชมพู", "ขาว"], size: "34, 36, 38, 40, 42", price: 660 },
        { sku: "No. 5830", category: "Bra", colors: ["ดำ", "เทา", "น้ำตาล", "เนื้อ", "แดง"], size: "32, 34, 36, 38", price: 690 },
        { sku: "No. 675", category: "Panty", colors: ["ดำ", "เนื้อ"], size: "M, L, XL", price: 60 },
        { sku: "No. 6218", category: "Bra", colors: ["ดำ", "เทา", "ชมพู", "ขาว", "เนื้อ", "ไข่ไก่"], size: "32, 34, 36, 38", price: 560 },
        { sku: "No. 6328", category: "Bra", colors: ["ดำ", "เทา", "น้ำตาล", "ไข่ไก่", "เนื้อ", "กะปิ"], size: "32, 34, 36, 38", price: 680 },
        { sku: "No. 6687", category: "Bra", colors: ["ดำ", "เทาควัน", "น้ำตาล", "เนื้อ", "โอรส"], size: "34, 36, 38, 40, 42, 44, 46", price: 780 },
        { sku: "No. 772", category: "Bra", colors: ["ดำ", "เนื้อ", "ขาว"], size: "34, 36, 38, 40, 42", price: 780 },
        { sku: "No. 779", category: "Bra", colors: ["ดำ", "เทา", "กรม", "ฟ้า", "น้ำตาลเข้ม", "น้ำตาลอ่อน", "เนื้อ", "โอรส", "ชมพู", "แดง"], size: "34, 36, 38, 40, 42, 44, 46", price: 740 },
        { sku: "No. 7320", category: "Bra", colors: ["ดำ", "เทา", "เทาดำ", "กะปิ", "ม่วงเข้ม", "ชมพูเข้ม", "เนื้อ"], size: "34, 36, 38", price: 840 },
        { sku: "No. 7878", category: "Bra", colors: ["ดำ", "ฟ้าเขียว", "ม่วงชมพู", "ชมพูส้ม", "เนื้อ"], size: "34, 36, 38, 40", price: 600 },
        { sku: "No. A86", category: "Bra", colors: ["ดำ", "เทา", "ชาไทย", "กรม", "ม่วงเข้ม", "ม่วงอ่อน", "กะปิ"], size: "36, 38, 40, 42, 44, 46, 48", price: 720 },
        { sku: "No. A87", category: "Bra", colors: ["ดำ", "แดง", "เนื้อ", "ไข่ไก่", "ม่วง", "ชมพู", "โอรส"], size: "36, 38, 40, 42, 44, 46", price: 840 },
        { sku: "No. 812", category: "Panty", colors: ["ดำ", "เนื้อ", "ขาว"], size: "Freesize", price: 60 },
        { sku: "No. 826-1", category: "Bra", colors: ["ดำ", "ม่วง", "เนื้อ", "ขาว"], size: "38, 40, 42, 44, 46, 48", price: 960 },
        { sku: "No. 8261", category: "Bra", colors: ["ดำ", "เนื้อ", "ขาว", "ม่วง"], size: "38, 40, 42, 44, 46", price: 780 },
        { sku: "No. 8262", category: "Bra", colors: ["ดำ", "ขาว", "เนื้อเข้ม", "เนื้ออ่อน"], size: "38, 40, 42, 44", price: 780 },
        { sku: "No. 8263", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "36, 38, 40, 42", price: 780 },
        { sku: "No. 8501", category: "Panty", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 80 },
        { sku: "No. 8533", category: "Bra", colors: ["ดำ", "เนื้อ", "กะปิ"], size: "34, 36, 38, 40, 42", price: 900 },
        { sku: "No. 8561", category: "Bra", colors: ["ดำ", "ฟ้าเทา", "น้ำตาล", "เนื้อ", "แดง", "โอรส", "ขาว"], size: "32, 34, 36, 38", price: 720 },
        { sku: "No. 8801", category: "Panty", colors: ["ดำ", "ม่วง", "ฟ้า", "บานเย็น", "กะปิ", "ชมพูอ่อน", "น้ำตาล", "เนื้อ", "ทอง"], size: "32, 34, 36", price: 30 },
        { sku: "No. 8802", category: "Bra", colors: ["ดำ", "ควันเทา", "น้ำตาล", "ทอง", "เนื้อ", "กะปิ", "ชมพู", "ขาว"], size: "32, 34, 36, 38, 40, 42, 44", price: 860 },
        { sku: "No. 8806", category: "Bra", colors: ["ดำ", "ม่วง", "กะปิ", "น้ำตาลเข้ม", "ทอง", "น้ำตาลเทา", "เนื้อ"], size: "34, 36, 38, 40, 42, 44", price: 960 },
        { sku: "No. 8807", category: "Bra", colors: ["ดำ", "เทา", "น้ำตาล"], size: "42, 44, 46, 48, 50", price: 1020 },
        { sku: "No. 8809", category: "Bra", colors: ["ดำ", "กะปิ", "น้ำตาล", "น้ำตาลเทา", "ทอง", "เนื้อ"], size: "34, 36, 38, 40, 42", price: 780 },
        { sku: "No. 8810", category: "Bra", colors: ["ดำ", "ม่วง", "กะปิ", "โอรส", "ชมพู", "ขาว", "น้ำตาลเข้ม", "น้ำตาลเทา", "ทอง", "เนื้อ"], size: "34, 36, 38, 40, 42", price: 760 },
        { sku: "No. 8811", category: "Bra", colors: ["ดำ", "ควันบุหรี่", "น้ำตาล", "ทอง", "เนื้อ", "กะปิ", "ชมพู"], size: "34, 36, 38, 40, 42", price: 760 },
        { sku: "No. 8823", category: "Bra", colors: ["ดำ", "เทา", "น้ำเงิน", "ฟ้าอ่อน", "น้ำตาล", "เนื้อเข้ม", "เนื้ออ่อน", "ขาว", "กะปิ", "ชมพู"], size: "32, 34, 36", price: 680 },
        { sku: "No. 8826", category: "Bra", colors: ["ดำ", "เทา", "น้ำตาล", "เนื้อ", "ไข่ไก่", "ขาว", "กะปิ"], size: "32, 34, 36, 38", price: 720 },
        { sku: "No. 8833", category: "Bra", colors: ["ดำ", "เทา", "น้ำเงิน", "ฟ้าอ่อน", "น้ำตาล", "เนื้อเข้ม", "เนื้ออ่อน", "ขาว", "กะปิ", "ชมพู"], size: "32, 34, 36", price: 620 },
        { sku: "No. 8868", category: "Bra", colors: ["ดำ", "เทา", "น้ำตาล", "เนื้อ"], size: "32, 34, 36, 38", price: 720 },
        { sku: "No. 8869", category: "Bra", colors: ["ดำ", "เทาเข้ม", "เทาอ่อน", "เลือดหมู", "กะปิ", "โอรส", "ชมพู"], size: "34, 36, 38", price: 720 },
        { sku: "No. 8881", category: "Bra", colors: ["ดำ", "เทา", "เลือดหมู", "ชมพู", "เนื้อเข้ม", "เนื้ออ่อน"], size: "32, 34, 36, 38", price: 820 },
        { sku: "No. 909", category: "Bra", colors: ["ดำ", "ม่วง", "น้ำเงิน", "เทาอ่อน", "ชมพู", "บานเย็น", "น้ำตาล", "เนื้อ", "ขาว"], size: "32, 34, 36", price: 780 },
        { sku: "No. 921", category: "Bottom-Hip Push up", colors: ["ชมพู", "โอรส", "เนื้อ"], size: "34, 36, 38, 40", price: 600 },
        { sku: "No. 927", category: "Bottom-Hip Push up", colors: ["ไข่ไก่", "ชมพู"], size: "34, 36, 38, 40", price: 620 },
        { sku: "No. 937", category: "Bra", colors: ["ดำ", "เทา", "เลือดหมู", "ชมพู", "เนื้อ", "กะปิ"], size: "36, 38, 40, 42", price: 840 },
        { sku: "No. 955", category: "Bottom-Hip Push up", colors: ["เนื้อ", "ไข่ไก่", "ชมพู"], size: "34, 36, 38, 40, 42", price: 600 },
        { sku: "No. 9001", category: "Bra", colors: ["ดำ", "ม่วง", "แดง", "น้ำตาล", "เนื้อ"], size: "32, 34, 36, 38", price: 690 },
        { sku: "No. 9683", category: "Bra", colors: ["ดำ", "เทา", "น้ำเงิน", "น้ำตาล", "เนื้อ", "กะปิ"], size: "34, 36, 38", price: 760 },
        { sku: "No. 9762", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "32, 34, 36, 38", price: 780 },
        { sku: "No. 9801", category: "Bra", colors: ["ดำ", "เทา", "น้ำตาล", "เนื้อ", "แดง"], size: "32, 34, 36, 38", price: 690 },
        { sku: "No. 9931", category: "Bra", colors: ["ดำ", "กะปิ", "โอวัลติน", "เนื้อ"], size: "44, 46, 48, 50", price: 790 },
        { sku: "บราปีกนกตะขอ", category: "Bottom-Hip Push up", colors: ["ดำ", "เนื้อ"], size: "A, B, C, D", price: 65 },
        { sku: "บราปีกนกเชือก", category: "Bottom-Hip Push up", colors: ["ดำ", "เนื้อ"], size: "A, B, C, D", price: 90 },
        { sku: "No. J003", category: "Panty", colors: ["ดำ", "เทา", "เนื้อ"], size: "XL, 2XL, 3XL, 4XL", price: 110 },
        { sku: "No. W049", category: "Inner Bra Tops", colors: ["ดำ", "ขาว", "น้ำตาล", "เนื้อ", "ชมพู"], size: "XL, 2XL, 3XL", price: 960 },
        { sku: "No. 1330", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "34, 36, 38, 40, 42, 44", price: 1440 },
        { sku: "No. 1336", category: "Bra", colors: ["ดำ", "เทา", "เนื้อ"], size: "34, 36, 38, 40, 42, 44", price: 1440 },
        { sku: "No. 9006", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 1040 },
        { sku: "No. 002", category: "Panty", colors: ["ดำ", "ขาว"], size: "Freesize", price: 40 },
        { sku: "No. B003", category: "Shapewear Control", colors: ["ดำ", "เนื้อ", "ขาว"], size: "Freesize", price: 480 },
        { sku: "No. E002", category: "Inner Bra Tops", colors: ["ดำ", "เนื้อ", "ขาว"], size: "Freesize", price: 600 },
        { sku: "No. E003", category: "Inner Bra Tops", colors: ["ดำ", "เนื้อ", "ขาว"], size: "Freesize", price: 550 },
        { sku: "No. W001", category: "Shapewear Control", colors: ["ดำ", "เนื้อ", "ขาว"], size: "Freesize", price: 480 },
        { sku: "No. W002", category: "Shapewear Control", colors: ["ดำ", "เนื้อ", "ขาว"], size: "Freesize", price: 480 },
        { sku: "No. W008", category: "Bra", colors: ["ดำ", "เนื้อ", "ขาว"], size: "Freesize", price: 980 },
        { sku: "No. W012", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 660 },
        { sku: "No. W014", category: "Inner Bra Tops", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 550 },
        { sku: "No. 10", category: "Panty", colors: ["ดำ", "เนื้อ", "พาสเทล"], size: "S, M, L, XL, 2XL", price: 280 },
        { sku: "No. 1301", category: "Panty", colors: ["ดำ", "เนื้อ"], size: "M, L, XL, 2XL", price: 90 },
        { sku: "No. 226", category: "Panty", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 560 },
        { sku: "No. 3366", category: "Shapewear Control", colors: ["ดำ", "เนื้อ"], size: "XL, 2XL, 3XL", price: 100 },
        { sku: "No. 3608", category: "Shapewear Control", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 660 },
        { sku: "No. 5093", category: "Shapewear Control", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 500 },
        { sku: "No. 5299", category: "Shapewear Control", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 600 },
        { sku: "No. 5562", category: "Shapewear Control", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 600 },
        { sku: "No. 6601", category: "Shapewear Control", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 550 },
        { sku: "No. 6602", category: "Shapewear Control", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 600 },
        { sku: "No. 741", category: "Shapewear Control", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 600 },
        { sku: "No. 883", category: "Bra", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 600 },
        { sku: "No. 888", category: "Panty", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 50 },
        { sku: "No. 889", category: "Panty", colors: ["ดำ", "เนื้อ"], size: "L, XL, 2XL", price: 100 },
        { sku: "No. 8808", category: "Shapewear Control", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 660 },
        { sku: "No. 8888", category: "Panty", colors: ["ดำ", "เนื้อ", "คละสี"], size: "M, L, XL, 2XL, 3XL, 4XL", price: 370 },
        { sku: "No. 971", category: "Panty", colors: ["ดำ", "เนื้อ"], size: "Freesize", price: 780 }
    ];

    function getProducts() {
        return RAW_ITEMS.map((item, idx) => {
            // USER REQUIREMENT: Always include "คละสี" (Assorted Colors) as an option for every SKU!
            const allColors = [...item.colors];
            if (!allColors.includes("คละสี")) {
                allColors.push("คละสี");
            }

            const colorStock = {};
            allColors.forEach(col => {
                colorStock[col] = 0;
            });

            return {
                id: `prod_${idx + 1}`,
                sku: item.sku,
                name: item.category,
                category: item.category,
                colors: allColors,
                colorStock: colorStock,
                size: item.size,
                standardPrice: item.price,
                minStockAlert: 10
            };
        });
    }

    return {
        getProducts: getProducts,
        getCustomers: () => [], // Clean start
        getInvoices: () => []   // Clean start
    };
})();
