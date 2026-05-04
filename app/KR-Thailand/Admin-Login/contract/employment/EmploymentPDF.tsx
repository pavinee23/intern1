import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { employmentContractData } from './data'; // ตรวจสอบว่าใน data.ts ใช้ชื่อ export นี้


Font.register({
  family: 'THSarabunNew',
  src: '/fonts/THSarabunNew.ttf',
});

// 1. กำหนด "หน้าตา" ของข้อมูลที่รับมาจากหน้าเว็บ
interface ContractInfo {
  date?: string;
  companyName?: string;
  employerName?: string;
  employeeName?: string;
  position?: string;
  salary?: string;
  hiringDate?: string;
  responsibilityDetail?: string;
}

const styles = StyleSheet.create({
  page: { 
    padding: 60, 
    fontFamily: 'THSarabunNew', // อย่าลืม Register ฟอนต์ในไฟล์หลักนะครับ
    lineHeight: 1.5 
  },
  docTitle: { 
    fontSize: 18, 
    textAlign: 'center', 
    marginBottom: 20, 
    fontWeight: 'bold',
    textDecoration: 'underline' 
  },
  sectionHeader: { 
    marginTop: 15, 
    marginBottom: 5, 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  listItem: { 
    flexDirection: 'row', 
    marginBottom: 8 
  },
  listText: { 
    flex: 1, 
    fontSize: 12, 
    textAlign: 'justify' // ชิดขอบซ้าย-ขวาเต็มๆ ตามที่พี่ชอบ
  }
});


// 2. ระบุว่า Props คือ { data: ContractInfo }
// ... (ส่วน Import และ Font.register เหมือนเดิมของพี่) ...

const replacePlaceholders = (text: string, data: any) => {
  if (!text) return "";
  return text
    .replace(/\[Position\]/g, data.position || '..........')
    .replace(/\[Hiring Date\]/g, data.hiringDate || '..........')
    .replace(/\[End of Probation Date\]/g, data.endProbationDate || '..........')
    .replace(/\[Salary\]/g, data.salary || '..........');
};

const EmploymentAgreementPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* หัวเรื่องกึ่งกลาง */}
      <Text style={styles.docTitle}>EMPLOYMENT AGREEMENT</Text>

      {/* วนลูปตาม Section ใน data.ts */}
      {employmentContractData.map((section) => (
        <View key={section.id} break={section.id === 'section7'}> {/* สั่งขึ้นหน้าใหม่ถ้าข้อมูลยาวเกิน (Optional) */}
          
          {/* หัวข้อหลัก (ภาษาอังกฤษ) */}
          <Text style={styles.sectionHeader}>{section.titleEN}</Text>
          
          {/* หัวข้อหลัก (ภาษาไทย) */}
          <Text style={[styles.sectionHeader, { marginTop: 0, fontSize: 12 }]}>
            {section.titleTH}
          </Text>

          {/* วนลูปรายการย่อยในแต่ละ Section */}
          {section.items.map((item, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              {/* ฝั่งภาษาอังกฤษ */}
              <View style={styles.listItem}>
                <Text style={styles.listText}>
                  {replacePlaceholders(item.en, data)}
                </Text>
              </View>
              
              {/* ฝั่งภาษาไทย */}
              <View style={styles.listItem}>
                <Text style={[styles.listText, { color: '#333' }]}>
                  {replacePlaceholders(item.th, data)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);
export default EmploymentAgreementPDF;