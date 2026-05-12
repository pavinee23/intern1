import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

Font.register({
  family: 'THSarabunNew',
  fonts: [
    { src: '/fonts/THSarabunNew.ttf', fontWeight: 'normal' },
    { src: '/fonts/THSarabunNew-Bold.ttf', fontWeight: 'bold' },
  ],
});

const S = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingLeft: 60,
    paddingRight: 60,
    fontFamily: 'THSarabunNew',
    fontSize: 15,
  },

  // โลโก้
  logoWrap: { alignItems: 'center', marginBottom: 15 },
  logo: { width: 140 },
  
  // หัวเอกสาร
  docTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    marginBottom: 16,
  },

  // หัวข้อมาตรา
  secTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    marginTop: 12,
    marginBottom: 6,
  },
  
  secTitleCenter: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },

  // ย่อหน้าทั่วไป 
  para: {
    fontSize: 15,
    fontFamily: 'THSarabunNew',
    textAlign: 'justify', 
    lineHeight: 1.3,
    textIndent: 36, // ย่อหน้า 1 แท็บ
    marginBottom: 6,
  },

  // บรรทัดที่มีเลขข้อ 
  itemRow: {
    flexDirection: 'row',
    marginLeft: 15, 
    marginBottom: 4,
  },
  itemNum: {
    width: 25, 
    fontFamily: 'THSarabunNew',
    fontSize: 15,
  },
  itemBody: {
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 15,
    lineHeight: 1.3,
    textAlign: 'justify',
  },

  // บรรทัด Bullet 
  bullet: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 40,  
  },
  bulletMark: { width: 15, fontSize: 15, fontFamily: 'THSarabunNew' },
  bulletBody: { flex: 1, fontSize: 15, fontFamily: 'THSarabunNew', lineHeight: 1.3, textAlign: 'justify' },

  // ลายเซ็น
  signatureSection: {
    marginTop: 40,
    alignItems: 'center',
    width: '100%',
  },
  signatureBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  witnessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 20, // ขยับพยานซ้ายขวาไม่ให้ชิดขอบกระดาษเกินไป
  },
  witnessCol: {
    alignItems: 'center',
    width: '45%',
  },
  txt: { fontSize: 15, fontFamily: 'THSarabunNew' },

  // เลขหน้า 
  pageNum: {
    position: 'absolute',
    fontSize: 13,
    bottom: 25,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#555',
  },
});

// Components ช่วยจัดหน้า
const Item = ({ num, children }: { num?: string; children: React.ReactNode }) => (
  <View style={S.itemRow}>
    {num ? <Text style={S.itemNum}>{num}</Text> : <Text style={S.itemNum}></Text>}
    <Text style={S.itemBody}>{children}</Text>
  </View>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <View style={S.bullet}>
    <Text style={S.bulletMark}>•</Text>
    <Text style={S.bulletBody}>{children}</Text>
  </View>
);

// แก้ไขตรงนี้: รับค่า props 'lang' ให้ตรงกับที่ page.tsx ส่งมา
const SalesrepresentativePDF = ({ data, lang = 'TH' }: { data: any, lang?: string }) => {
  // แปลงค่าเป็นตัวพิมพ์เล็ก เพื่อให้จัดการง่ายขึ้น (รองรับทั้ง 'TH', 'th', 'EN', 'en')
  const currentLang = lang?.toLowerCase() === 'en' ? 'en' : 'th';

  return (
    <Document>
      <Page size="A4" style={S.page} wrap={true}>
        
        {/* เลขหน้า (เปลี่ยนภาษาอัตโนมัติ) */}
        <Text
          style={S.pageNum}
          render={({ pageNumber, totalPages }) => 
            currentLang === 'th' ? `หน้า ${pageNumber} จาก ${totalPages}` : `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />

        <View style={S.logoWrap}>
          <Image src="/k-energy-save-logo.jpg" style={S.logo} />
        </View>

        {/* ==================== ส่วนภาษาไทย ==================== */}
        {currentLang === 'th' ? (
          <View>
            <Text style={S.docTitle}>สัญญาแต่งตั้งตัวแทนจำหน่าย (Dealer Agreement)</Text>

            <Text style={S.para}>
              บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด (ซึ่งต่อไปนี้จะเรียกว่า “บริษัท”) และตัวแทนจำหน่าย (ซึ่งต่อไปนี้จะเรียกว่า “ตัวแทน”) ตกลงเข้าทำสัญญาแต่งตั้งตัวแทน (ซึ่งต่อไปนี้จะเรียกว่า “สัญญา”) โดยมีข้อความดังต่อไปนี้:
            </Text>

            <Text style={S.secTitle}>มาตรา 1 (วัตถุประสงค์)</Text>
            <Text style={S.para}>
              สัญญานี้มีวัตถุประสงค์เพื่อกำหนดรายละเอียดที่จำเป็นในการกำกับดูแลความสัมพันธ์การแต่งตั้งระหว่างบริษัทและ
              ผู้ปฏิบัติงานอย่างสมเหตุสมผล เช่น สถานภาพของผู้ปฏิบัติงาน ข้อควรปฏิบัติ งานที่บริษัทมอบหมาย เกณฑ์การจ่าย
              ค่าตอบแทน (Commission) และเหตุแห่งการเลิกสัญญา เป็นต้น
            </Text>
            
            <Text style={S.secTitle}>มาตรา 2 (สถานภาพของตัวแทนจำหน่าย)</Text>
            <Item num="2.1">ผู้แทนจำหน่ายมีสถานะเป็น “คู่ค้าทางธุรกิจอิสระ (Independent Business Partner)” มิใช่ลูกจ้าง ตัวแทน หรือผู้มีอำนาจผูกพันบริษัท</Item>       
            <Item num="2.2">ผู้แทนจำหน่ายไม่มีอำนาจในการทำสัญญาหรือก่อภาระผูกพันใดๆ ในนามบริษัทเว้นแต่ได้รับมอบอำนาจเป็น ลายลักษณ์อักษรจากบริษัทเท่านั้น</Item>
            <Item num="2.3">ผู้แทนจำหน่ายเป็นผู้รับผิดชอบค่าใช้จ่าย การดำเนินงาน และความเสี่ยงทางธุรกิจของตนเองทั้งหมด</Item>
            <Item num="2.4">ความสัมพันธ์ตามสัญญานี้ไม่ถือเป็นการร่วมทุนหุ้นส่วนหรือความสัมพันธ์ทางกฎหมายอื่นใด นอกเหนือจาก ที่ระบุไว้โดยชัดแจ้งในสัญญานี้</Item>

            <Text style={S.secTitle}>มาตรา 3 (ความเป็นอิสระในการปฏิบัติงาน)</Text>
            <Text style={S.para}>
              ผู้ปฏิบัติงานมีอิสระในการตัดสินใจเรื่องเวลา สถานที่ และวิธีการในการปฏิบัติงานที่ได้รับมอบหมายและบริษัท จะไม่มีการชี้แจง สั่งการ หรือกำกับดูแลรายละเอียดในการทำงานของผู้ปฏิบัติงานโดยตรง
            </Text>

            <Text style={S.secTitle}>มาตรา 4 (หลักการด้านความปลอดภัยและความรับผิดชอบ)</Text>
            <Item num="4.1">ผู้ปฏิบัติงานมีหน้าที่รับผิดชอบในการปฏิบัติตามกฎหมายที่เกี่ยวข้องและกฎความปลอดภัยทั่วไปด้วยตนเอง เพื่อป้องกันอุบัติเหตุที่อาจเกิดขึ้นระหว่างการปฏิบัติงานที่ได้รับมอบหมาย</Item>
            <Item num="4.2">ผู้ปฏิบัติงานสามารถสวมใส่อุปกรณ์ความปลอดภัยหรือดำเนินการตามมาตรการที่จำเป็นได้ตามการตัดสินใจ และความรับผิดชอบของตนเองในขณะปฏิบัติงาน</Item>
            <Item num="4.3">บริษัทจะไม่สั่งการเรื่องวิธีการหรือขั้นตอนการทำงานเฉพาะเจาะจง และบริษัทจะไม่รับผิดชอบต่ออุบัติเหตุ ที่เกิดขึ้นระหว่างการปฏิบัติงานของผู้ปฏิบัติงานเว้นแต่จะเป็นความผิดที่เกิดจากความจงใจหรือ ความประมาทเลินเล่ออย่างร้ายแรงของบริษัท</Item>
            <Item num="4.4">ผู้ปฏิบัติงานต้องรับผิดชอบทั้งทางแพ่งและทางอาญาต่ออุบัติเหตุหรือความเสียหายที่เกิดจากความผิดพลาด ความประมาท หรือการไม่ปฏิบัติตามกฎความปลอดภัยของผู้ปฏิบัติงานเอง</Item>
            <Item num="4.5">หากเกิดความเสียหายต่อทรัพย์สินของลูกค้า เนื่องจากการติดตั้งหรือการกระทำของผู้ปฏิบัติงาน ผู้ปฏิบัติงาน ต้องเป็นคนรับผิดชอบค่าเสียหายต่อบุคคลที่สามนั้นแต่เพียงผู้เดียว</Item>
            <Item num="4.6">ผู้ปฏิบัติงานสามารถเลือกทำประกันอุบัติเหตุส่วนบุคคลหรือประกันความรับผิดได้ตามการตัดสินใจของตนเอง หากจำเป็น</Item>
            <Item num="4.7">ผู้ปฏิบัติงานสามารถเลือกจ้างช่างเทคนิคไฟฟ้าได้ตามการตัดสินใจของตนเองหากจำเป็น</Item>

            <Text style={S.secTitle}>มาตรา 5 (ระยะเวลาสัญญา)</Text>
            <Item num="5.1">ระยะเวลาของสัญญานี้คือ 1 ปี นับตั้งแต่วันที่ลงนามในสัญญา</Item>
            <Item num="5.2">หากบริษัทหรือผู้ปฏิบัติงานไม่ได้แจ้งความประสงค์เป็นลายลักษณ์อักษรว่าจะไม่ต่อสัญญา ก่อนวันสิ้นสุดสัญญา อย่างน้อย 1 เดือน ให้ถือว่าสัญญานี้ถูกต่ออายุโดยอัตโนมัติออกไปอีก 1 ปี ภายใต้เงื่อนไขเดิม</Item>

            <Text style={S.secTitle}>มาตรา 6 (งานที่ได้รับมอบหมาย)</Text>
            <Item num="6.1">งานที่ผู้ปฏิบัติงานต้องดำเนินการมีดังนี้:</Item>
            <Bullet>ทำสัญญาขายและดูแลการขายผลิตภัณฑ์เครื่องประหยัดไฟฟ้า K-SAVER (รุ่นเดิม)</Bullet>
            <Bullet>งานเสริมที่เกี่ยวข้องโดยตรงกับสัญญาขาย</Bullet>
            <Bullet>งานอื่นๆ ที่บริษัทอนุมัติล่วงหน้า</Bullet>
            <Item num="6.2">ในกรณีที่มีการเปิดตัวผลิตภัณฑ์ใหม่ การจ่ายค่าตอบแทน (Commission) จะต้องมีการเจรจาตกลงกันใหม่</Item>

            <Text style={S.secTitle}>มาตรา 7 (ค่าตอบแทน/ค่าคอมมิชชัน)</Text>
            <Item num="7.1">บริษัทจะจ่ายค่าตอบแทนให้แก่ผู้ปฏิบัติงาน โดยเกณฑ์การจ่าย, อัตรา, ระยะเวลา และรายละเอียดอื่นๆ ให้เป็นไปตาม "หนังสือสัญญาแนบท้าย (ระเบียบการจ่ายค่าตอบแทน)" ที่บริษัทกำหนดและบริษัทสามารถ ปรับเปลี่ยนได้โดยต้องแจ้งล่วงหน้าไม่น้อยกว่า 30 วัน</Item>
            <Item num="7.2">เกณฑ์การจ่ายค่าตอบแทนให้เป็นไปตามนโยบายการขายของบริษัทและสัญญาแนบท้าย</Item>
            <Item num="7.3">มาตรฐานค่าตอบแทนอาจมีการเปลี่ยนแปลงตามนโยบายของบริษัท</Item>
            <Item num="7.4">บริษัทมีสิทธิ์ระงับ ชะลอ หรือปฏิเสธการจ่ายค่าตอบแทน ในกรณีที่พบหรือสงสัยว่ามีการกระทำที่อาจก่อให้ เกิดความเสียหายแก่บริษัท จนกว่าจะมีการตรวจสอบข้อเท็จจริงแล้วเสร็จ</Item>

            <Text style={S.secTitle}>มาตรา 8 (การฝึกอบรม)</Text>
            <Item num="8.1">บริษัทมีสิทธิ์กำหนดให้ผู้แทนจำหน่ายเข้ารับการฝึกอบรมเกี่ยวกับสินค้าการขาย และมาตรฐานการให้บริการ ตามที่บริษัทกำหนด</Item>
            <Item num="8.2">ผู้แทนจำหน่ายต้องเข้ารับการฝึกอบรมเบื้องต้นก่อนเริ่มดำเนินงานและอาจต้องเข้ารับการอบรมเพิ่มเติม ตามที่บริษัทแจ้ง</Item>
            <Item num="8.3">บริษัทมีสิทธิ์ระงับสิทธิ์การขาย การสนับสนุน หรือค่าตอบแทนบางส่วน หากผู้แทนจำหน่ายไม่เข้ารับการฝึก อบรมตามที่กำหนด</Item>
            <Item num="8.4">ค่าใช้จ่ายในการฝึกอบรมให้เป็นไปตามที่บริษัทกำหนด โดยบริษัทอาจให้การสนับสนุนบางส่วนตามความ เหมาะสม</Item>
            
            <Text style={S.secTitle}>มาตรา 9 (ข้อควรปฏิบัติและการห้ามกระทำการไม่เป็นธรรม)</Text>
            <Item>ผู้ปฏิบัติงานต้องปฏิบัติตามข้อกำหนดต่อไปนี้ และห้ามกระทำการดังนี้:</Item>
            <Item num="9.1">การขายที่บิดเบือนความจริง/เกินจริง หรือการปลอมแปลงข้อมูล</Item>
            <Item num="9.2">การประชาสัมพันธ์ โฆษณา หรือแจกจ่ายเอกสารโดยไม่ได้รับอนุมัติจากบริษัท</Item>
            <Item num="9.3">การรั่วไหลความลับทางการค้าหรือนโยบายราคาของบริษัท</Item>
            <Item num="9.4">การใช้ชื่อหรือตำแหน่งของบริษัทเพื่อวัตถุประสงค์ที่ไม่เกี่ยวข้องกับสัญญานี้</Item>
            <Item num="9.5">การไม่ให้ความร่วมมือเมื่อบริษัทขอตรวจสอบข้อเท็จจริงในกรณีที่มีข้อพิพาทกับลูกค้า</Item>
            <Item num="9.6">ห้ามมิให้ผู้ปฏิบัติงานประกอบธุรกิจที่แข่งขันกับบริษัท หรือเป็นตัวแทนจำหน่ายสินค้าประเภทเดียวกันเป็นเวลา 1 ปีหลังจากสิ้นสุดสัญญา</Item>               

            <Text style={S.secTitle}>มาตรา 10 (การเลิกสัญญา)</Text>
            <Item num="10.1">ผู้ปฏิบัติงานสามารถร้องขอเลิกสัญญาต่อบริษัทเป็นลายลักษณ์อักษรเมื่อใดก็ได้</Item>
            <Item num="10.2">บริษัทสามารถเลิกสัญญาได้ทันทีหากมีเหตุดังนี้:</Item>
            <Bullet>ปลอมแปลงหรือบิดเบือนเอกสารที่เกี่ยวข้อง เช่น เอกสารสมัครงาน หรือรายงานการขาย</Bullet>
            <Bullet>ก่อให้เกิดความเสียหายแก่บริษัทจากการฟ้องร้องหรือข้อร้องเรียน เนื่องจากความจงใจหรือความประมา เลินเล่ออย่างร้ายแรงของผู้ปฏิบัติงาน</Bullet>
            <Bullet>กระทำการผิดกฎหมายหรือไม่เหมาะสมที่ทำให้เสื่อมเสียชื่อเสียงหรือเกียรติยศของบริษัท ทั้งทางตรงและ ทางอ้อม</Bullet>
            <Bullet>มีการรับเงินจากลูกค้าโดยตรง โดยไม่ผ่านบริษัท ให้ถือเป็นการผิดสัญญาขั้นร้ายแรง</Bullet>
            <Item num="10.3">หากผู้ปฏิบัติงานมียอดขายไม่ถึงเป้า (KPI) ที่กำหนดติดต่อกัน 3 เดือน บริษัทมีสิทธิบอกเลิกสัญญาได้ทันที โดยไม่ต้องจ่ายค่าชดเชยใดๆ</Item>
            <Item num="10.4">เมื่อสัญญาสิ้นสุดลง ไม่ว่าด้วยเหตุใด ให้สิทธิและหน้าที่ที่ยังไม่สิ้นสุด รวมถึงค่าตอบแทนที่เกิดขึ้นก่อนวันสิ้นสุด สัญญายังคงมีผลบังคับใช้</Item>

            <Text style={S.secTitle}>มาตรา 11 (การชดใช้ความเสียหาย)</Text>
            <Item num="11.1">บริษัทสามารถเรียกค่าเสียหายหรือใช้สิทธิไล่เบี้ยต่อความเสียหายที่เกิดจากความจงใจหรือความประมาทของผู้ปฏิบัติงาน</Item>
            <Item num="11.2">หากสัญญาเลิกกัน ภาระผูกพันในการชดใช้ความเสียหายที่เกิดขึ้นก่อนการเลิกสัญญายังคงมีอยู่จนกว่าจะดำเนิน การเสร็จสิ้น</Item>
            <Text>{"\n"}</Text>
            <Item num="11.3">หากบริษัทเลิกสัญญาโดยไม่มีเหตุอันควรจนทำให้ผู้ปฏิบัติงานเสียหาย ผู้ปฏิบัติงานสามารถเรียกค่าเสียหายจาก บริษัทได้</Item>       

            <Text style={S.secTitle}>มาตรา 12 (ความรับผิดชอบด้านภาษี)</Text>
            <Text style={S.para}>ภาษีและค่าธรรมเนียมต่างๆ ที่เกิดจากค่าตอบแทนหรือรายได้ที่ได้รับจากบริษัท ผู้ปฏิบัติงานจะเป็นผู้รับผิดชอบ ทั้งหมด</Text>

            <Text style={S.secTitle}>มาตรา 13 (การค้ำประกันและการส่งมอบกรมธรรม์)</Text>
            <Item num="13.1">เมื่อทำสัญญานี้หรือเมื่อบริษัทร้องขอผู้ปฏิบัติงานต้องส่งมอบกรมธรรม์ประกันค้ำประกันบุคคล (Fidelity Bond) หรือประกันค้ำประกันการปฏิบัติงาน (Performance Bond) ตามจำนวนที่บริษัทกำหนดหรือส่งเอกสาร การรับรองโดยโนตารี (Notary) ตามวิธีที่บริษัทกำหนดแทนได้</Item>
            <Item num="13.2">ข้อจำกัดกรณีไม่ส่งกรมธรรม์ : หากไม่ส่งมอบตามที่ร้องขอ บริษัทอาจจำกัดการทำงานหรือเลิกสัญญานี้ได้</Item>
            <Item num="13.3">บริษัทอาจให้โอกาสในการส่งมอบและขอให้คำชี้แจงก่อนจะทำการจำกัดงานหรือเลิกสัญญา</Item>

            <Text style={S.secTitle}>มาตรา 14 (การระงับข้อพิพาท)</Text>
            <Item num="14.1">ข้อพิพาทให้แก้ไขโดยการเจรจาระหว่างบริษัทและผู้ปฏิบัติงานเป็นอันดับแรก</Item>             
            <Item num="14.2">หากตกลงกันไม่ได้ ให้ถือเอาศาลที่มีเขตอำนาจเหนือที่ตั้งสำนักงานใหญ่ของบริษัทหรือที่อยู่ของผู้ปฏิบัติงาน เป็นศาลที่มีอำนาจตัดสิน</Item>

            <Text style={S.secTitle}>มาตรา 15 (วันมีผลบังคับใช้)</Text>
            <Text style={S.para}>สัญญานี้มีผลบังคับใช้ตั้งแต่วันที่ ________________ เป็นต้นไป</Text>
            
            <Text style={S.secTitle}>มาตรา 16 (อื่นๆ)</Text>
            <Item num="16.1">เมื่อสัญญาจบลงหรือเลิกสัญญา ผู้ปฏิบัติงานต้องคืนเอกสาร, เงิน, สื่อการสอนและข้อมูลคอมพิวเตอร์ที่เป็น ของบริษัท (หรือที่สังกัดอยู่กับบริษัท) โดยทันทีผู้ปฏิบัติงานยืนยันว่าได้เข้าใจเนื้อหาในสัญญาอย่างครบถ้วนและ ยินยอมตกลงตามนี้</Item>
            <Item num="16.2">เพื่อเป็นหลักฐาน บริษัทและผู้ปฏิบัติงานได้จัดทำสัญญาไว้ 2 ฉบับ และเก็บรักษาไว้ฝ่ายละ 1 ฉบับ</Item>

            <Text>{"\n"}</Text>
            <Text style={S.secTitleCenter}>[สัญญาแนบท้าย: การจ่ายและเรียกคืนค่าคอมมิชชัน]</Text>

            <Text style={S.secTitle}>มาตรา 2-2 (เกณฑ์การคำนวณค่าตอบแทน)</Text>
            <Item num="1.">ผลิตภัณฑ์รุ่นเดิม: 30% ของยอดขาย (ก่อนภาษี)</Item>
            <Bullet>หมายเหตุ: หากสำนักงานใหญ่ต้องดำเนินการตรวจสอบหน้างาน (Survey) และควบคุมงานทั้งหมด ค่าตอบแทน 20% จะตกเป็นของสำนักงานใหญ่ (ใช้ในกรณีที่ผู้ปฏิบัติงานทำหน้าที่เพียงแนะนำลูกค้าเท่านั้น)</Bullet>
            <Item num="2.">ผลิตภัณฑ์ใหม่: ตกลงแยกต่างหากเป็นลายลักษณ์อักษร</Item>
            <Item num="3.">การตัดสินผลการคำนวณสุดท้ายถือเป็นสิทธิ์ของระบบคอมพิวเตอร์บริษัท</Item>

            <Text style={S.secTitle}>มาตรา 4 (เงื่อนไขการจ่าย)</Text>
            <Item num="1.">จะจ่ายเมื่อ:</Item>
            <Bullet>บริษัทเช่าซื้อชำระเงินเรียบร้อย</Bullet>
            <Bullet>ติดตั้งและวัดผลเสร็จสิ้น</Bullet>
            <Bullet>รายงานผลแก่ลูกค้าเรียบร้อยแล้ว</Bullet>
            <Item num="2.">หากสิ้นสุดสถานะผู้ปฏิบัติงาน (เลิกสัญญา) บริษัทจะจ่ายค่าตอบแทนเฉพาะรายการขายที่:</Item>
            <Bullet>ลูกค้าชำระเงินครบถ้วน</Bullet>
            <Bullet>การติดตั้งและส่งมอบงานเสร็จสมบูรณ์</Bullet>
            <Bullet>ไม่มีข้อพิพาทหรือการร้องเรียน</Bullet>
            <Text style={S.para}>บริษัทขอสงวนสิทธิ์ในการตรวจสอบความถูกต้องของรายการขายก่อนการจ่ายเงิน และในกรณีที่พบความผิดปกติ บริษัทมีสิทธิ์ชะลอการจ่ายจนกว่าการตรวจสอบจะแล้วเสร็จ</Text>

            <Text style={S.secTitle}>มาตรา 6 (การเรียกคืนเงิน - Chargeback)</Text>
            <Item>บริษัทมีสิทธิ์เรียกคืนค่าตอบแทน ในกรณีดังต่อไปนี้:</Item>
            <Bullet>ลูกค้ายกเลิกสัญญา หรือไม่ชำระเงิน</Bullet>
            <Bullet>การขายเกิดจากข้อมูลอันเป็นเท็จ หรือไม่ถูกต้อง</Bullet>
            <Bullet>งานติดตั้งหรือบริการไม่เป็นไปตามมาตรฐานที่บริษัทกำหนด</Bullet>
            <Item>การเรียกคืนจะดำเนินการโดย:</Item>
            <Bullet>เงินที่ต้องเรียกคืนจะถูกหักลบจากค่าตอบแทนที่จะได้รับในอนาคตก่อน</Bullet>
            <Bullet>หากไม่เพียงพอ จะเรียกคืนผ่านประกันค้ำประกันหรือผู้ค้ำประกันร่วมหรือบริษัทสามารถเรียกคืนตาม ความเสียหายที่เกิดขึ้นจริง</Bullet>
            <Text style={S.para}>เงินประกันค้ำประกัน: บริษัทจะเรียกหลักประกันในอัตราที่เหมาะสมตามระดับยอดขายและต้องแจ้งรายละเอียด ล่วงหน้าเป็นลายลักษณ์อักษร</Text>
            <Text style={S.para}>ทั้งนี้ บริษัทจะแจ้งรายละเอียดและเหตุผลให้ผู้แทนจำหน่ายทราบก่อนการดำเนินงาน</Text>

            <Text>{"\n"}</Text>
            <Text>{"\n"}</Text>
            <Text>{"\n"}</Text>
            <Text>{"\n"}</Text>
            <Text>{"\n"}</Text>
            <Text style={S.secTitleCenter}>[รายละเอียดอุปกรณ์ที่ต้องซื้อเมื่อเปิดศูนย์/สำนักงาน]</Text>
            
            <Item num="1.">วัตถุประสงค์: เพื่อการทำงานที่ราบรื่น</Item>
            <Bullet>กล่องทดสอบไดร์เป่าผม (1 ชุด)</Bullet>
            <Bullet>เครื่องเทสเตอร์แรงดัน/กระแสไฟ (1 ชุด)</Bullet>
            <Bullet>แคตตาล็อก (100 ชุด), ซองเอกสารใหญ่ (100 ซอง), นามบัตร (200 ใบ)</Bullet>
            <Bullet>เครื่องวัดค่าไฟฟ้าความแม่นยำสูง (1 ชุด - เช่า)</Bullet>
            <Bullet>สนับสนุนฟรี: การสอนงานหน้างานโดยทีมเทคนิค 3 ครั้งแรก</Bullet>
            <Item>ค่าใช้จ่าย: 42,000 บาท (ไม่รวม VAT)</Item>
            <Item>หากไม่ต้องการซื้ออุปกรณ์ : ค่าตอบแทน (Commission) จะถูกปรับลดจาก 30% เหลือ 15%</Item>
            
            <Item num="2.">ค่าใช้จ่ายทีมเทคนิค (หลังจาก 3 ครั้งแรก):</Item>
            <Bullet>ค่าสนับสนุนด้านเทคนิคและการขาย: 4,000 บาท (ไม่รวมค่าที่พักและค่าเดินทางเพิ่มเติม)</Bullet>
            <Bullet>ต้องชำระก่อนวันลงพื้นที่จริง โดยอาจมีการตกลงหักออกจากยอดสัญญาภายหลังได้</Bullet>

            <View style={S.signatureSection}>
              <View style={S.witnessRow}>
                <View style={S.witnessCol}>
                  <Text style={S.txt}>Signature..........................................Employer </Text>
                  <Text style={[S.txt, { marginTop: 8 }]}> (Mr. Patrick Jang) </Text>
                </View>
                <View style={S.witnessCol}>
                  <Text style={S.txt}>Signature..........................................Employee</Text>
                  <Text style={[S.txt, { marginTop: 8 }]}> (Miss Paranya JANTRAPORN) </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
        /* ==================== ส่วนภาษาอังกฤษ ==================== */
          <View>
            <Text style={S.docTitle}>Appointment Agreement for Sales Representative</Text>
            <Text style={S.para}>
              K Energy Save Co., Ltd. (hereinafter referred to as the "Company") and the Sales Representative (hereinafter referred to as the "Representative") hereby enter into this Appointment Agreement (hereinafter referred to as the "Agreement") under the following terms and conditions:
            </Text>

            <Text style={S.secTitle}>Article 1 (Purpose)</Text>
            <Text style={S.para}>
              The purpose of this Agreement is to establish the terms and conditions governing the entrustment relationship between the Company and the Representative, including the status of the Representative, compliance requirements, entrusted duties, commission payment standards, and grounds for termination.
            </Text>

            <Text style={S.secTitle}>Article 2 (Status of the Representative)</Text>
            <Item num="2.1">The Representative shall perform the duties entrusted by the Company under this Agreement as an independent business partner.</Item>
            <Item num="2.2">The Representative is not an employee under the Labor Standards Act, and no employer-employee relationship shall exist between the Company and the Representative.</Item>
            <Item num="2.3">The Representative is not subject to the Company’s internal employment rules or personnel regulations.</Item>
            <Item num="2.4">The Representative has no authority to enter into contracts or create obligations on behalf of the Company, unless expressly authorized in writing.</Item>

            <Text style={S.secTitle}>Article 3 (Independence of Performance)</Text>
            <Text style={S.para}>
              The Representative shall independently determine the time, location, and method of performing the entrusted duties. The Company shall not exercise direct command, supervision, or issue specific instructions regarding the Representative’s work processes.
            </Text>

            <Text style={S.secTitle}>Article 4 (Safety and Liability Principles)</Text>
            <Item num="4.1">The Representative is responsible for complying with relevant laws and general safety regulations to prevent accidents during the performance of duties.</Item>
            <Item num="4.2">The Representative may use safety equipment or take necessary measures at their own discretion.</Item>
            <Item num="4.3">The Company shall not be liable for any accidents occurring during the performance of duties, except in cases caused by the Company’s willful misconduct or gross negligence.</Item>
            <Item num="4.4">The Representative shall bear all civil and criminal liability for damages resulting from their own negligence or failure to comply with safety standards.</Item>
            <Item num="4.5">If damage is caused to a customer property during installation, the Representative shall be solely liable to such third party.</Item>
            <Item num="4.6">The Representative may obtain personal accident or liability insurance at their own discretion.</Item>

            <Text style={S.secTitle}>Article 5 (Term of Agreement)</Text>
            <Item num="5.1">The term of this Agreement shall be one year from the date of execution.</Item>
            <Item num="5.2">Unless either party notifies the other in writing of their intent not to renew at least one month prior to the expiration date, this Agreement shall be automatically renewed for an additional year under the same terms and conditions.</Item>

            <Text style={S.secTitle}>Article 6 (Entrusted Duties)</Text>
            <Item num="6.1">The Representative shall perform the following:</Item>
            <Bullet>Execution and management of sales contracts for existing K-SAVER Electricity Saver products.</Bullet>
            <Bullet>Ancillary duties directly related to sales contracts.</Bullet>
            <Bullet>Other duties as approved in advance by the Company.</Bullet>
            <Item num="6.2">Upon the launch of new products, commission payment terms shall be subject to renegotiation.</Item>

            <Text style={S.secTitle}>Article 7 (Commission)</Text>
            <Item num="7.1">The Company shall pay commissions in accordance with the "Supplementary Agreement (Commission Regulations)" established by the Company regarding payment criteria, rates, and timing. The Company may amend such standards with at least 30 days' prior notice.</Item>
            <Item num="7.2">Payment criteria are subject to the Company’s sales policies and the supplementary agreement.</Item>
            <Item num="7.3">The Company reserves the right to adjust commission standards in alignment with corporate policy changes.</Item>
            <Item num="7.4">The Company reserves the right to suspend, delay, or withhold commission payments in cases where misconduct or potential loss to the Company is suspected, pending a full investigation.</Item>

            <Text style={S.secTitle}>Article 8: Training</Text>
            <Item num="8.1">The Company reserves the right to require the Representative to attend training sessions regarding product knowledge and service standards.</Item>
            <Item num="8.2">The Representative shall complete introductory training before commencing operations.</Item>
            <Item num="8.3">The Company may suspend sales rights or support if the Representative fails to complete mandatory training.</Item>

            <Text style={S.secTitle}>Article 9: Compliance and Prohibition of Unfair Practices</Text>
            <Item>The Representative shall strictly adhere to the following and refrain from:</Item>
            <Item num="9.1">Misrepresentation, exaggerated sales claims, or data falsification.</Item>
            <Item num="9.2">Distribution of marketing materials without prior Company approval.</Item>
            <Item num="9.3">Disclosure of trade secrets or the Company’s confidential pricing policies.</Item>
            <Item num="9.4">Unauthorized use of the Company’s name or brand for purposes unrelated to this Agreement.</Item>
            <Item num="9.5">Non-cooperation during fact-checking procedures regarding customer disputes.</Item>
            <Item num="9.6">Engaging in any business that competes with the Company or acting as a representative for similar product categories for one year following the termination of this Agreement.</Item>

            <Text style={S.secTitle}>Article 10: Termination of Agreement</Text>
            <Item num="10.1">The Representative may terminate this Agreement at any time via written notice.</Item>
            <Item num="10.2">The Company may terminate the Agreement immediately upon the occurrence of any of the following events:</Item>
            <Bullet>Falsification of documents (e.g., employment applications, sales reports).</Bullet>
            <Bullet>Actions resulting in legal claims or significant loss to the Company due to the Representative’s intent or gross negligence.</Bullet>
            <Bullet>Illegal or unethical acts that defame the Company’s reputation.</Bullet>
            <Bullet>Direct acceptance of payments from customers bypassing the Company (deemed a severe breach).</Bullet>
            <Item num="10.3">If the Representative fails to meet sales performance targets (KPIs) for three consecutive months, the Company reserves the right to terminate without compensation.</Item>
            <Item num="10.4">Upon expiration or termination, all outstanding obligations and commission rights established prior to the termination date shall remain in full force and effect.</Item>

            <Text style={S.secTitle}>Article 11: Damages and Indemnity</Text>
            <Item num="11.1">The Company reserves the right to claim damages or seek indemnification for losses caused by the Representative's intent or negligence.</Item>
            <Item num="11.2">Liability for damages incurred prior to termination remains in effect until fully resolved.</Item>
            <Text> </Text>
            <Item num="11.3">If the Company terminates the Agreement without reasonable cause, the Representative may claim damages for resulting losses.</Item>

            <Text style={S.secTitle}>Article 12: Tax Liability</Text>
            <Text style={S.para}>The Representative shall be solely responsible for all taxes and fees arising from any commission or income received from the Company.</Text>

            <Text style={S.secTitle}>Article 13: Guarantee and Bonds</Text>
            <Item num="13.1">Upon execution or Company request, the Representative shall submit a fidelity bond or Performance Bond in the amount specified by the Company, or provide notarized certification.</Item>
            <Item num="13.2">Failure to provide the required bonds may result in the limitation of duties or termination of this Agreement.</Item>
            <Item num="13.3">The Company may, at its discretion, allow an opportunity for explanation prior to taking action regarding the lack of bond submission.</Item>

            <Text style={S.secTitle}>Article 14: Dispute Resolution</Text>
            <Item num="14.1">In the event of any dispute, the Company and the Representative shall first attempt to resolve the matter through good-faith negotiations.</Item>
            <Item num="14.2">If no mutual agreement is reached, the dispute shall be submitted to the jurisdiction of the court where the Company’s headquarters is located or the court having jurisdiction over the Representative’s residence.</Item>

            <Text style={S.secTitle}>Article 15: Effective Date</Text>
            <Text style={S.para}>This Agreement shall become effective on [Date] …………………………………………..and shall remain in effect thereafter.</Text>

            <Text style={S.secTitle}>Article 16: Miscellaneous Provisions</Text>
            <Item num="16.1">Upon the expiration or termination of this Agreement, the Representative shall immediately return all corporate assets, including documents, funds, training materials, and digital data belonging to the Company (or its affiliates). The Representative hereby acknowledge and agrees to all terms stipulated in this Agreement.</Item>
            <Item num="16.2">This Agreement is executed in duplicate. Each party shall retain one original copy as evidence of the agreement.</Item>

            <Text>{"\n"}</Text>
            <Text style={S.secTitleCenter}>[Supplementary Agreement: Commission Payment and Chargeback Policy]</Text>

            <Text style={S.secTitle}>Article 2-2: Remuneration Calculation Criteria</Text>
            <Item num="1.">Existing Product Line: 30% of Total Sales (Pre-tax).</Item>
            <Item >Note: If the Headquarters is required to conduct on-site surveys and manage the entire installation process, the commission shall be adjusted to 20%.(This applies when the Representative provides customer referrals only).</Item>
            <Item num="2.">New Product Line: Subject to a separate written agreement.</Item>
            <Item num="3.">All final commission calculations are determined by the Company’s automated computing system.</Item>

            <Text style={S.secTitle}>Article 4: Payment Terms and Conditions</Text>
            <Item num="1.">Commission Eligibility: Payment shall be processed upon the fulfillment of the following:</Item>
            <Bullet>Full payment has been received by the Company or the financing entity.</Bullet>
            <Bullet>Installation and post-performance measurements are complete.</Bullet>
            <Bullet>Final performance reports have been submitted to the customer.</Bullet>
            <Item>Post-Termination Payments: Upon termination of the Representative's status, commissions will only be paid for sales where:</Item>
            <Bullet>The customer has settled the balance in full.</Bullet>
            <Bullet>Installation and handovers are completed.</Bullet>
            <Bullet>There are no outstanding disputes or grievances.</Bullet>
            <Item>The Company reserves the right to audit the accuracy of sales records prior to disbursement and may withhold payment if irregularities are identified until the verification process is complete.</Item>

            <Text style={S.secTitle}>Article 6: Commission Recovery (Chargeback Policy)</Text>
            <Item>The Company reserves the right to reclaim previously paid commissions under the following circumstances:</Item>
            <Bullet>Contract cancellation or non-payment by the customer.</Bullet>
            <Bullet>Sales resulting from falsified or inaccurate data.</Bullet>
            <Bullet>Installation or services that fail to meet the Company’s quality standards.</Bullet>
            <Item>Recovery Procedures:</Item>
            <Bullet>Reclamation shall be executed via deduction from future commission payments.</Bullet>
            <Bullet>In cases where future commissions are insufficient, the Company may seek recovery through performance bonds, guarantors, or legal claims for actual damages.</Bullet>
            <Text></Text>
            <Bullet>The Company shall implement a security deposit/bond system at a rate appropriate to the sales volume, with specific details provided in writing.</Bullet>
            <Item>The Company shall provide the Representative with detailed reasons and documentation prior to initiating any recovery action.</Item>

            <Text style={S.secTitleCenter}>[Operational Equipment Requirements for Branch/Office Opening]</Text>
            
            <Item num="1.">Purpose: To ensure seamless operational performance.</Item>
            <Bullet>Hair Dryer Test Box (1 set)</Bullet>
            <Bullet>Voltage/Current Tester (1 set)</Bullet>
            <Bullet>Product Catalogs (100 sets), Large Envelopes (100 units), Business Cards (200 units)</Bullet>
            <Bullet>High-Precision Power Meter (1 set - Rental basis)</Bullet>
            <Bullet>Complimentary Support: On-site operational training by the Technical Team for the first three sessions.</Bullet>
            <Item>Equipment Acquisition Costs: 42,000 THB (excluding VAT).</Item>
            <Item>Note: If the Dealer opts not to purchase the equipment set, the Commission rate shall be adjusted from 30% to 15%.</Item>
            
            <Item num="2.">Technical Team Support Fees (Effective after the first 3 complimentary sessions):</Item>
            <Bullet>Technical and Sales Support: 4,000 THB (excluding accommodation and additional travel expenses).</Bullet>
            <Bullet>Payment shall be made prior to on-site deployment. The Parties may alternatively agree to deduct these fees from the final contract value.</Bullet>

            <View style={S.signatureSection}>
              <View style={S.witnessRow}>
                <View style={S.witnessCol}>
                  <Text style={S.txt}>Signature..........................................Employer </Text>
                  <Text style={[S.txt, { marginTop: 8 }]}> (Mr. Patrick Jang) </Text>
                </View>
                <View style={S.witnessCol}>
                  <Text style={S.txt}>Signature..........................................Employee</Text>
                  <Text style={[S.txt, { marginTop: 8 }]}> (Miss Paranya JANTRAPORN) </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default SalesrepresentativePDF;
