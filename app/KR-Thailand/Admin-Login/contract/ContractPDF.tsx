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
  logoWrap: { alignItems: 'center', marginBottom: 15 },
  logo: { width: 140 },
  docTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    marginBottom: 16,
  },
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
  para: {
    fontSize: 15,
    fontFamily: 'THSarabunNew',
    textAlign: 'justify',
    lineHeight: 1.3,
    textIndent: 36,
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    marginLeft: 15,
    marginBottom: 4,
  },
  itemNum: {
    width: 28,
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
  bullet: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 40,
  },
  bulletMark: { width: 15, fontSize: 15, fontFamily: 'THSarabunNew' },
  bulletBody: { flex: 1, fontSize: 15, fontFamily: 'THSarabunNew', lineHeight: 1.3, textAlign: 'justify' },
  signatureSection: {
    marginTop: 15,
    alignItems: 'center',
    width: '100%',
  },
  signatureBlock: {
    alignItems: 'center',
    marginBottom: 10,
  },
  witnessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  witnessCol: {
    alignItems: 'center',
    width: '45%',
  },
  txt: { fontSize: 15, fontFamily: 'THSarabunNew' },
  pageNum: {
    position: 'absolute',
    fontSize: 13,
    bottom: 25,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#555',
  },
  subItem: {
    marginLeft: 40,
  },
  row: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 6,
  flexWrap: 'wrap',
},
line: {
  flex: 1,
  borderBottomWidth: 1,
  borderBottomColor: '#000',
  marginHorizontal: 4,
  minWidth: 20,
},
});

// ─── Helper Components ───────────────────────────────────────────────────────

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

// ─── Props Type ───────────────────────────────────────────────────────────────

type EmploymentPDFProps = {
  data: {
    date: string;
    companyName: string;
    name: string;
    taxId: string;
    address1: string;
    address2: string;
    position: string;
    phone: string;
    salary: string;
    hiringDate: string;
    responsibilityDetail: string;
  };
  lang?: 'EN' | 'TH'; // ← รับ prop ภาษา
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SalesrepresentativePDF = ({ data, lang }: EmploymentPDFProps) => {

  // ✅ ตัวแปรนี้คือหัวใจหลัก: ถ้า lang === 'TH' → แสดงภาษาไทย, อื่นๆ → อังกฤษ
  const isTH = lang === 'TH';

  return (
    <Document>
      <Page size="A4" style={S.page} wrap={true}>

        {/* เลขหน้า */}
        <Text
          style={S.pageNum}
          render={({ pageNumber, totalPages }) =>
            isTH
              ? `หน้า ${pageNumber} จาก ${totalPages}`
              : `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />

        {/* โลโก้ */}
        <View style={S.logoWrap}>
          <Image src="/k-energy-save-logo.jpg" style={S.logo} />
        </View>

        {/* ─── หัวเอกสาร ─── */}
        <Text style={S.docTitle}>
          {isTH ? 'สัญญาซื้อขายและติดตั้ง (บริษัท/ห้างหุ้นส่วน) ' : 'Sales and Installation Agreement (Company /Limited Partnership) '}
        </Text>

        {isTH ? (
  <>
    <View style={S.row}>
      <Text style={S.txt}>สัญญาฉบับนี้ทำขึ้น ณ</Text>
      <View style={S.line} />
      <Text style={S.txt}>เมื่อวันที่</Text>
      <View style={[S.line, { maxWidth: 50 }]} />
      <Text style={S.txt}>เดือน</Text>
      <View style={S.line} />
      <Text style={S.txt}>ปี</Text>
      <View style={[S.line, { maxWidth: 60 }]} />
    </View>
    <Text style={[S.txt, { marginBottom: 6 }]}>ระหว่าง :</Text>
    <View style={S.row}>
      <Text style={S.txt}>บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด สำนักงานตั้งอยู่เลขที่</Text>
      <View style={S.line} />
    </View>
    <View style={S.row}>
      <Text style={S.txt}>โดย</Text>
      <View style={S.line} />
      <Text style={S.txt}>ผู้มีอำนาจลงนามบริษัท (ซึ่งต่อไปนี้จะเรียกว่า "บริษัท")</Text>
    </View>
    <Text style={[S.txt, { marginBottom: 6 }]}>กับ:</Text>
    <View style={S.row}>
      <Text style={S.txt}>(ชื่อบริษัท/ห้างหุ้นส่วน คู่สัญญา)</Text>
      <View style={S.line} />
      <Text style={S.txt}>เลขประจำตัวผู้เสียภาษี</Text>
      <View style={S.line} />
    </View>
    <View style={S.row}>
      <Text style={S.txt}>สำนักงานตั้งอยู่เลขที่</Text>
      <View style={S.line} />
      <Text style={S.txt}>โดย</Text>
      <View style={S.line} />
    </View>
    <Text style={[S.txt, { marginBottom: 14 }]}>
      ในฐานะกรรมการผู้มีอำนาจลงนาม (ซึ่งต่อไปนี้จะเรียกว่า "ผู้ซื้อ") อีกฝ่ายหนึ่ง
    </Text>
  </>
) : (
  <>
    <View style={S.row}>
      <Text style={S.txt}>This Agreement is made at</Text>
      <View style={S.line} />
      <Text style={S.txt}>on Date</Text>
      <View style={S.line} />
      <Text style={[S.txt, { marginBottom: 6 }]}>between:</Text>
    </View>
    <View style={S.row}>
      <Text style={S.txt}>K Energy Save Co., Ltd., having its registered office at</Text>
      <View style={S.line} />
    </View>
    <View style={S.row}>
      <Text style={S.txt}>represented by</Text>
      <View style={S.line} />
      <Text style={S.txt}>its authorized signatory (hereinafter referred to as the "Company /Limited Partnership").</Text>
    </View>
    <Text style={[S.txt, { marginBottom: 6 }]}>and</Text>
    <View style={S.row}>
      <Text style={S.txt}>[Company /Limited Partnership Name], Tax ID</Text>
      <View style={S.line} />
      <Text style={S.txt}>having its registered office at</Text>
      <View style={S.line} />
    </View>
    <View style={S.row}>
      <Text style={S.txt}>represented by</Text>
      <View style={S.line} />
    </View>
    <Text style={[S.txt, { marginBottom: 14 }]}>
      in the capacity of Director/Authorized Signatory (hereinafter referred to as the "Buyer"). Both parties hereby agree to the following terms and conditions:
    </Text>
  </>
)}

        {/* ─── มาตรา 1 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 1 (วัตถุประสงค์)' : 'Article 1 (Purpose)'}
        </Text>

        <Text style={S.para}>
          {isTH
            ? `สัญญานี้จัดทำขึ้นเพื่อกำหนดเงื่อนไขการซื้อขายสินค้าหรือบริการติดตั้ง รวมถึงบริการที่เกี่ยวข้อง ระหว่าง บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด (“บริษัท”) และคู่สัญญาซึ่งเป็นนิติบุคคล (“ผู้ซื้อ”) โดยมีวัตถุประสงค์เพื่อกำหนดสิทธิ หน้าที่ และความรับผิดของแต่ละฝ่ายให้ชัดเจนทั้งนี้ คู่สัญญาตกลงว่า การทำสัญญานี้เป็นเพียงความสัมพันธ์ในฐานะ “ผู้ซื้อสินค้า” เท่านั้น มิใช่การแต่งตั้งตัวแทนจำหน่าย ตัวแทนทางการค้า หุ้นส่วน หรือความสัมพันธ์ทางกฎหมายในลักษณะอื่นใด การซื้อขาย การติดตั้ง และการให้บริการทั้งหมด ให้เป็นไปตามเงื่อนไขในสัญญานี้ และเอกสารแนบท้าย เช่น ใบเสนอราคา หรือข้อตกลงเพิ่มเติม ซึ่งให้ถือเป็นส่วนหนึ่งของสัญญานี้
`
            : `The purpose of this Agreement is to define the terms and conditions for the sale of goods and/or installation services, including related services, between the Company and the Buyer (being a juristic person), and to clearly establish the rights, duties, and liabilities of each party.
          Both parties agree that this Agreement constitutes a relationship solely as "Seller and Buyer." It shall not be construed as an appointment of a distributor, commercial agent, partnership, or any other legal relationship. All sales, installations, and services shall be governed by the terms herein and appended documents, such as quotations or additional agreements, which are considered integral parts of this Agreement.
 `
          }
        </Text>

        {/* ─── มาตรา 2 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 2 (สถานะคู่สัญญา)' : 'Article 2 (Legal Status of the Parties)'}
        </Text>

        <Item num="2.1">
          {isTH
            ? `ผู้ซื้อมีสถานะเป็นผู้ซื้อสินค้า มิใช่ตัวแทนจำหน่าย นายหน้า หุ้นส่วนหรือตัวแทนทางกฎหมาย ของบริษัท และไม่มีอำนาจกระทำการใดๆในนามของบริษัท เว้นแต่จะได้รับมอบอำนาจเป็นลายลักษณ์อักษร จากบริษัทโดยชัดแจ้ง`
            : `The Buyer’s status is strictly that of a “Customer” and not an agent, distributor, broker, partner, or legal representative of the Company. The Buyer has no authority to act on behalf of the Company unless expressly authorized in writing. `
          }
        </Item>

          <Item num="2.2">
            {isTH ? 'ผู้ซื้อไม่มีสิทธิใช้ชื่อทางการค้า เครื่องหมายการค้า โลโก้ หรือสื่อใดๆของบริษัท เพื่อวัตถุประสงค์ทางการค้า การโฆษณาหรือการแสดงตนต่อบุคคลภายนอก เว้นแต่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากบริษัท' 
                  : 'The Buyer has no right to use the Company’s trademarks, logos, or any corporate media for commercial, advertising, or self-representation purposes to third parties, unless written permission is granted by the Company. '}
          </Item>

        <Item num="2.3">
          {isTH
            ? `การซื้อสินค้าตามสัญญานี้เป็นการซื้อเพื่อใช้งานของผู้ซื้อเอง ไม่ถือเป็นการได้รับสิทธิในการนำสินค้า ไปจำหน่ายต่อ เว้นแต่ จะได้รับความยินยอมเป็นลายลักษณ์อักษรจากบริษัท`
            : `This Agreement pertains to the purchase of products for the Buyer’s own internal use. It does not grant the Buyer the right to resell the products to third parties, unless written consent is obtained from the Company.  `
          }
        </Item>

        <Item num="2.4">
          {isTH
            ? `ผู้ซื้อเป็นผู้รับผิดชอบค่าใช้จ่าย การดำเนินงาน และความเสี่ยงใดๆที่เกิดขึ้นจากการใช้สินค้า การติดตั้ง หรือการดำเนินกิจการของผู้ซื้อเองทั้งหมด เว้นแต่จะเป็นความผิดโดยตรงของบริษัท`
            : `The Buyer shall be solely responsible for all costs, operations, and risks arising from the use of products, installations, or the Buyer’s business activities, except in cases where damage is directly caused by the Company. `
          }
        </Item>
        <View wrap={false}>
        <Item num="2.5">
          {isTH
            ? `ความสัมพันธ์ตามสัญญานี้ไม่ถือเป็นการร่วมทุน หุ้นส่วนหรือความสัมพันธ์ทางกฎหมายอื่นใดนอกเหนือจากที่ ระบุไว้โดยชัดแจ้งในสัญญานี้`
            : `Nothing in this Agreement shall be deemed to create a joint venture, partnership, or any other legal relationship beyond what is explicitly stated herein.`
          }
        </Item>
        </View>

        {/* ─── มาตรา 3 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 3 (ภาษีเงินได้และเงินสมทบประกันสังคม)' : 'Article 3 (INCOME TAXES AND SOCIAL SECURITY CONTRIBUTION)'}
        </Text>

        <Item num="3.1">
          {isTH
            ? `การซื้อขายสินค้าตามสัญญานี้ อาจรวมถึงการติดตั้งหรือไม่รวมก็ได้ โดยให้เป็นไปตามรายละเอียดที่ระบุใน ใบเสนอราคาหรือข้อตกลงเพิ่มเติมเป็นลายลักษณ์อักษร`
            : `The sale of goods under this Agreement may or may not include installation services, as specified in the quotation or separate written agreement.`
          }
        </Item>

        <Item num="3.2">
          {isTH
            ? `กรณีที่บริษัทเป็นผู้ดำเนินการติดตั้ง บริษัทจะดำเนินการตามมาตรฐานของบริษัท โดยผู้ซื้อยินยอมให้ความร่วมมือ ในการเข้าพื้นที่และจัดเตรียมสภาพแวดล้อมที่เหมาะสมสำหรับการติดตั้ง`
            : `Where the Company performs the installation, it shall be conducted according to the Company’s standards. The Buyer agrees to cooperate regarding site access and to prepare the environment suitable for installation. `
          }
        </Item>

         <Item num="3.3">
          {isTH
            ? `กรณีที่ผู้ซื้อดำเนินการติดตั้งเองหรือว่าจ้างบุคคลภายนอก ผู้ซื้อจะต้องรับผิดชอบต่อการติดตั้งทั้งหมด รวมถึง ความเสียหายใดๆ ที่เกิดขึ้นจากการติดตั้งดังกล่าวแต่เพียงผู้เดียว`
            : `If the Buyer performs the installation or hires a third party, the Buyer shall be solely responsible for the entire process, including any damages arising therefrom. `
          }
        </Item>

         <Item num="3.4">
          {isTH
            ? `เมื่อมีการส่งมอบสินค้าคืนหรือดำเนินการติดตั้งแล้วเสร็จ ให้ถือว่างานได้เสร็จสมบูรณ์ และความเสี่ยงในสินค้า และการใช้งานจะโอนไปยังผู้ซื้อทันที`
            : `Upon delivery and/or completion of installation, the work shall be deemed fulfilled, and the risk of loss or damage to the goods and the results of use shall immediately transfer to the Buyer. `
          }
        </Item>

         <Item num="3.5">
          {isTH
            ? `บริษัทไม่มีหน้าที่ควบคุม ดูแลหรือรับผิดชอบต่อวิธีการใช้งาน การติดตั้งหรือการดำเนินงานของผู้ซื้อ เว้นแต่จะได้ ตกลงเป็นลายลักษณ์อักษรไว้เป็นอย่างอื่น`
            : `The Company has no obligation to control, oversee, or be liable for the Buyer’s methods of use, installation, or operations, unless otherwise agreed upon in writing. `
          }
        </Item>

         <Item num="3.6">
          {isTH
            ? `ผู้ซื้อยินยอมรับผิดชอบต่อความเสียหายใดๆ ที่เกิดขึ้นกับทรัพย์สินของผู้ซื้อหรือบุคคลภายนอก อันเนื่องมาจาก การใช้งานสินค้า เว้นแต่จะพิสูจน์ได้ว่าเกิดจากความบกพร่องของสินค้าโดยตรง`
            : `The Buyer agrees to be responsible for any damages occurring to the Buyer’s property or third parties resulting from the use of the product, unless it can be proven that such damage was caused directly by a product defect.`
          }
        </Item>

        {/* ─── มาตรา 4 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 4 (หลักการด้านความปลอดภัยและความรับผิดชอบ)' : 'Article 4 (Safety and Liability Principles)'}
        </Text>

        <Item num="4.1">
          {isTH
            ? `ผู้ซื้อยินยอมรับผิดชอบต่อความเสียหายใดๆ ที่เกิดขึ้นต่อชีวิต ร่างกายหรือทรัพย์สินของตนเอง พนักงาน หรือบุคคลภายนอก อันเนื่องมาจากการติดตั้งการใช้งานหรือการดำเนินงานของผู้ซื้อเอง เว้นแต่จะพิสูจน์ได้ ว่าเกิดจากความบกพร่องของสินค้าโดยตรง`
            : `Notice of Termination: If the Employee wishes to resign voluntarily, the Employee must provide the Employer with at least 30 days' written advance notice. The Employee must return any funds paid in advance and outstanding debts on the final day of employment.`
          }
        </Item>

        <Item num="4.2">
          {isTH
            ? `ในกรณีที่บริษัทถูกเรียกร้องค่าเสียหาย หรือถูกฟ้องร้องจากบุคคลภายนอก อันมีสาเหตุมาจากการกระทำ การติดตั้ง หรือการใช้งานของผู้ซื้อ ผู้ซื้อยินยอมรับผิดชอบชดใช้ค่าเสียหายทั้งหมดแทนบริษัท รวมถึง ค่าทนายความ ค่าศาล และค่าใช้จ่ายอื่น ๆ ที่เกี่ยวข้อง`
            : `Termination without Severance Pay: The Employer is entitled to terminate an employment agreement without paying severance pay in any of the following cases:`
          }
        </Item>

         <Item num="4.3">
          {isTH
            ? `ผู้ซื้อมีหน้าที่จัดให้มีมาตรการด้านความปลอดภัยที่เหมาะสม รวมถึงอุปกรณ์ป้องกันความปลอดภัย (PPE) และ ต้องปฏิบัติตามกฎหมายที่เกี่ยวข้องอย่างเคร่งครัด โดยบริษัทไม่ต้องรับผิดชอบต่ออุบัติเหตุหรือความเสียหาย ที่เกิดขึ้นจากการไม่ปฏิบัติตามดังกล่าว`
            : `Notice of Termination: If the Employee wishes to resign voluntarily, the Employee must provide the Employer with at least 30 days' written advance notice. The Employee must return any funds paid in advance and outstanding debts on the final day of employment.`
          }
        </Item>

        <Item num="4.4">
          {isTH
            ? `บริษัทไม่มีหน้าที่ควบคุม ดูแลหรือรับผิดชอบต่อวิธีการติดตั้งหรือการใช้งานของผู้ซื้อ เว้นแต่จะมีข้อตกลง เป็นลายลักษณ์อักษรไว้เป็นอย่างอื่น`
            : `Termination without Severance Pay: The Employer is entitled to terminate an employment agreement without paying severance pay in any of the following cases:`
          }
        </Item>
       
         <Item num="4.5">
          {isTH
            ? `บริษัทมีสิทธิหักเงินใดๆที่ต้องชำระให้แก่ผู้ซื้อ หรือเรียกคืนค่าเสียหายจากผู้ซื้อได้ทันที หากพบว่าความ เสียหายนั้น เกิดจากการกระทำของผู้ซื้อ`
            : `Notice of Termination: If the Employee wishes to resign voluntarily, the Employee must provide the Employer with at least 30 days' written advance notice. The Employee must return any funds paid in advance and outstanding debts on the final day of employment.`
          }
        </Item>

        <Item num="4.6">
          {isTH
            ? `ผู้ซื้อยินยอมรับผิดชอบต่อการกระทำของพนักงาน ลูกจ้าง ผู้รับจ้าง หรือบุคคลใดๆที่เกี่ยวข้องกับการ ดำเนินงานของผู้ซื้อ เสมือนเป็นการกระทำของผู้ซื้อเอง`
            : `Termination without Severance Pay: The Employer is entitled to terminate an employment agreement without paying severance pay in any of the following cases:`
          }
        </Item>


        {/* ─── มาตรา 5 ─── */}
        <View wrap={false}>
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 5 (การชำระเงิน)' : 'Article 5 (Terms of Payment)'}
        </Text>
       
        <Item num="5.1">
          {isTH
            ? `ผู้ซื้อตกลงชำระค่าสินค้าหรือค่าบริการตามจำนวน ราคาและเงื่อนไขที่ระบุไว้ในใบเสนอราคา หรือเอกสาร แนบท้ายสัญญา`
            : `The Buyer agrees to pay for the goods and/or service fees in the amounts, prices, and under the conditions specified in the Quotation or the Annexed Documents. `
          }
        </Item>
        </View>
        <Item num="5.2">
          {isTH
            ? `ผู้ซื้อจะต้องชำระเงินภายในระยะเวลาที่กำหนด หากผู้ซื้อไม่ชำระเงินตามกำหนด บริษัทมีสิทธิระงับ การส่งมอบสินค้า การติดตั้งหรือการให้บริการได้ทันที โดยไม่ต้องรับผิดชอบต่อความเสียหายใด ๆ ที่เกิดขึ้น`
            : `The Buyer shall settle payments within the designated timeframe. Failure to comply entitles the Company to immediately suspend delivery, installation, or services without liability for any resulting damages. `
          }
        </Item>

         <Item num="5.3">
          {isTH
            ? `ในกรณีที่มีการกำหนดให้ชำระเงินมัดจำ ผู้ซื้อจะต้องชำระเงินมัดจำก่อนการดำเนินการใดๆของบริษัทและ เงินมัดจำ ดังกล่าวไม่สามารถขอคืนได้ เว้นแต่บริษัทจะพิจารณาเป็นกรณีไป`
            : `The Buyer shall settle payments within the designated timeframe. Failure to comply entitles the Company to immediately suspend delivery, installation, or services without liability for any resulting damages. `
          }
        </Item>

        <Item num="5.4">
          {isTH
            ? `กรณีผู้ซื้อชำระเงินล่าช้า ผู้ซื้อยินยอมให้บริษัทคิดดอกเบี้ยผิดนัด ในอัตราสูงสุดตามที่กฎหมายกำหนด นับตั้งแต่ วันครบกำหนดชำระจนกว่าจะชำระเสร็จสิ้น`
            : `In the event of late payment, the Buyer agrees to be charged interest at the maximum rate permitted by law, calculated from the due date until the payment is settled in full. `
          }
        </Item>
       
         <Item num="5.5">
          {isTH
            ? `บริษัทขอสงวนสิทธิ์ในการระงับ ยกเลิกหรือเปลี่ยนแปลงการให้บริการหรือการส่งมอบสินค้า หากผู้ซื้อ ผิดนัดชำระเงิน หรือมีเหตุอันควรสงสัยว่าผู้ซื้ออาจไม่สามารถชำระเงินได้`
            : `The Company reserves the right to suspend, cancel, or modify service delivery if the Buyer defaults on payment or if there is reasonable cause to suspect the Buyer’s insolvency. `
          }
        </Item>

         <Item num="5.6">
          {isTH
            ? `การชำระเงินจะถือว่าสมบูรณ์เมื่อบริษัทได้รับเงินครบถ้วนเรียบร้อยแล้วเท่านั้น`
            : `5.6  Payment shall be deemed complete only upon the Company’s receipt of the full amount.`
          }
        </Item>

        {/* ─── มาตรา 6 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 6 (การส่งมอบสินค้าและการโอนความเสี่ยง)' : 'Article 6 (Delivery and Transfer of Risk)'}
        </Text>

        <Item num="6.1">
          {isTH
            ? `บริษัทจะดำเนินการส่งมอบสินค้าหรือดำเนินการติดตั้ง ตามระยะเวลาและเงื่อนไขที่ระบุไว้ในใบเสนอราคาหรือ ข้อตกลงเพิ่มเติม `
            : `The Company shall deliver the goods or perform the installation according to the timeframe and conditions specified in the Quotation or additional agreements.`
          }
        </Item>

        <Item num="6.2">
          {isTH
            ? 'การส่งมอบสินค้าให้ถือว่าเสร็จสมบูรณ์เมื่อเกิดเหตุการณ์ใดเหตุการณ์หนึ่งดังต่อไปนี้:'
            : 'Delivery shall be deemed complete upon the occurrence of any of the following:'
          }
        </Item>
        <View style={S.subItem}>
          <Item num="•">
            {isTH
              ? 'ผู้ซื้อได้รับมอบสินค้าแล้ว'
              : 'The Buyer has received the goods.'
            }
          </Item>
          <Item num="•">
            {isTH
              ? 'บริษัทดำเนินการติดตั้งแล้วเสร็จ'
              : 'The Company has completed the installation.'
            }
          </Item>
          <Item num="•">
            {isTH
              ? 'ผู้ซื้อเริ่มใช้งานสินค้าไม่ว่าทั้งหมดหรือบางส่วน'
              : 'The Buyer commences use of the goods, whether in whole or in part. '
            }
          </Item>
          </View>

        <Item num="6.3">
          {isTH
            ? 'เมื่อการส่งมอบเสร็จสมบูรณ์ตามข้อ 6.2 ให้ถือว่าความเสี่ยงในสินค้ารวมถึงความเสียหาย การสูญหาย หรือ ความบกพร่องใด ๆ โอนไปยังผู้ซื้อทันที'
            : 'Upon completion of delivery under Clause 6.2, all risks associated with the goods including damage, loss, or defects shall transfer immediately to the Buyer. '
          }
        </Item>
        
        <Item num="6.4">
          {isTH
            ? 'ผู้ซื้อมีหน้าที่ตรวจสอบสินค้าโดยทันทีหลังการส่งมอบ หากพบความเสียหายหรือความไม่ครบถ้วน ผู้ซื้อ ต้องแจ้งบริษัท เป็นลายลักษณ์อักษรภายใน 7 วัน นับแต่วันที่ได้รับสินค้า มิฉะนั้นให้ถือว่าผู้ซื้อยอมรับ สินค้าโดยสมบูรณ์'
            : 'The Buyer is obligated to inspect the goods immediately upon delivery. Any damage or discrepancy must be reported to the Company in writing within 7 days '
          }
        </Item>

        <View wrap={false}>
        <Item num="6.5">
          {isTH
            ? 'ในกรณีที่ผู้ซื้อไม่สามารถรับมอบสินค้า หรือไม่ให้ความร่วมมือในการติดตั้งตามกำหนดเวลา บริษัทมีสิทธิถือว่า การส่งมอบเสร็จสมบูรณ์และเรียกเก็บค่าใช้จ่ายที่เกิดขึ้นเพิ่มเติมได้'
            : 'Should the Buyer be unable to accept delivery or fail to cooperate within the agreed timeframe, the Company shall deem the delivery complete and reserves the right to charge for any additional expenses incurred. '
          }
        </Item>
        </View>
        <Item num="6.6">
          {isTH
            ? 'บริษัทไม่ต้องรับผิดชอบต่อความเสียหายที่เกิดขึ้นภายหลังการส่งมอบ อันมิได้ เกิดจากความบกพร่อง ของสินค้าโดยตรง'
            : 'The Company shall not be liable for any damages occurring after delivery, unless such damages are proven to have resulted directly from a manufacturing defect.'
          }
        </Item>

        {/* ─── มาตรา 7 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 7 (การรับประกันสินค้า)' : 'Article 7 (Product Warranty)'}
        </Text>

        <Item num="7.1">
          {isTH
            ? `บริษัทรับประกันสินค้าเฉพาะในส่วนของตัวสินค้า ว่าอยู่ในสภาพพร้อมใช้งานและไม่มีความบกพร่องจากการผลิต เป็นระยะเวลา …… ปี นับแต่วันที่ส่งมอบสินค้า`
            : `The Company warrants the product components to be in good working condition and free from manufacturing defects for a period of ...... years, effective from the delivery date. `
          }
        </Item>
        <View wrap={false}>
        <Item num="7.2">
          {isTH
            ? 'การรับประกันตามสัญญานี้ ครอบคลุมเฉพาะความบกพร่องที่เกิดจากการผลิต หรือความผิดพลาดของ บริษัทเท่านั้น และไม่ครอบคลุมกรณีดังต่อไปนี้:'
            : 'This warranty covers only manufacturing defects or errors caused by the Company. It specifically excludes the following:'
          }
        </Item>
        </View>
        <View style={S.subItem}>
          <Item num="•">
            {isTH
              ? 'การใช้งานผิดวิธี หรือไม่เป็นไปตามคำแนะนำของบริษัท'
              : 'Improper use or failure to follow the Company’s instructions.'
            }
          </Item>
          <Item num="•">
            {isTH
              ? 'การติดตั้งโดยบุคคลที่ไม่ได้รับอนุญาตจากบริษัท'
              : 'Installation by unauthorized personnel.'
            }
          </Item>
          <Item num="•">
            {isTH
              ? 'การดัดแปลง แก้ไข หรือซ่อมแซมสินค้าโดยไม่ได้รับอนุญาต'
              : 'Unauthorized modification, alteration, or repair.'
            }
          </Item>
          <Item num="•">
            {isTH
              ? 'ความเสียหายจากไฟฟ้าผิดปกติ อุบัติเหตุ หรือเหตุสุดวิสัย'
              : 'Damage caused by electrical irregularities, accidents, or Force Majeure.'
            }
          </Item>
          <Item num="•">
            {isTH
              ? 'การเสื่อมสภาพตามการใช้งานปกติ'
              : 'Normal wear and tear from regular use. '
            }
          </Item>      
          </View>

        <Item num="7.3">
          {isTH
            ? 'ในกรณีที่สินค้ามีความบกพร่องตามเงื่อนไขการรับประกัน บริษัทจะพิจารณาซ่อมแซมหรือเปลี่ยนสินค้าให้ตาม ความเหมาะสม โดยถือเป็นการชดเชยเพียงอย่างเดียวของผู้ซื้อรวมถึงค่าแรง ค่าขนส่ง ค่าเสียโอกาสหรือ ความเสียหายทางอ้อมใด ๆ'
            : 'For defects covered under the warranty, the Company shall, at its discretion, repair or replace the product. This constitutes the sole remedy; the Company shall not be liable for labor costs, transportation, loss of opportunity, or any indirect or consequential damages. '
          }
        </Item>

        <Item num="7.4">
          {isTH
            ? 'ผู้ซื้อต้องแจ้งปัญหาที่อยู่ภายใต้การรับประกันเป็นลายลักษณ์อักษรภายในระยะเวลาที่กำหนด หากไม่แจ้งภายใน ระยะเวลาดังกล่าว ให้ถือว่าสิทธิในการรับประกันสิ้นสุดลง'
            : 'The Buyer must report warranty-related issues in writing within the warranty period. Failure to do so shall result in the immediate expiration of warranty rights. '
          }
        </Item>

        <Item num="7.5">
          {isTH
            ? 'การพิจารณาว่าสินค้าอยู่ในเงื่อนไขการรับประกันหรือไม่ ให้เป็นดุลยพินิจของบริษัท'
            : 'The final determination of whether a defect falls within the warranty terms rests solely with the Company. '
          }
        </Item>

        <Item num="7.6">
          {isTH
            ? 'ผู้ซื้อเป็นผู้รับผิดชอบค่าใช้จ่ายในการขนส่งสินค้าเพื่อตรวจสอบหรือซ่อมแซม เว้นแต่บริษัทจะกำหนดเป็นอย่างอื่น'
            : 'The Buyer is responsible for all costs associated with transporting the goods for inspection or repair, unless the Company specifies otherwise.'
          }
        </Item>

        {/* ─── มาตรา 8 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 8 (บริการหลังการขายและบริการเพิ่มเติม))' : 'Article 8 (After-Sales Service and Additional Services)'}
        </Text>

        <Item num="8.1">
          {isTH
            ? 'บริษัทอาจให้บริการหลังการขายแก่ผู้ซื้อ ตามเงื่อนไขและระยะเวลาที่กำหนดไว้ในสัญญานี้ หรือเอกสารแนบท้าย โดยให้ถือว่าการรับประกันสินค้าเป็นคนละส่วนกับบริการหลังการขาย'
            : 'The Company may provide after-sales services to the Buyer subject to the terms, conditions, and timeframes specified in this Agreement or its Annexed Documents. Such services are deemed distinct from the standard product warranty. '
          }
        </Item>

        <Item num="8.2">
          {isTH
            ? 'บริการหลังการขายที่อยู่นอกเหนือจากขอบเขตการรับประกัน เช่น การตรวจเช็ค การบำรุงรักษา การซ่อมแซมเพิ่มเติม หรือการให้คำปรึกษาหน้างาน บริษัทมีสิทธิเรียกเก็บค่าบริการเพิ่มเติมตามอัตราที่กำหนด'
            : 'After-sales services falling outside the scope of the standard warranty such as system health checks, routine maintenance, additional repairs, or on-site technical consultations shall be subject to additional service fees at the Company’s prevailing rates. '
          }
        </Item>
      
        <Item num="8.3">
          {isTH
            ? 'ในกรณีที่ผู้ซื้อประสงค์จะรับบริการดูแลรักษารายปี (Maintenance Service) จะต้องทำข้อตกลงเพิ่มเติมเป็น ลายลักษณ์อักษร และชำระค่าบริการตามแพ็กเกจที่บริษัทกำหนด'
            : 'Should the Buyer require an annual Maintenance Service (MS), a separate written agreement must be executed, and service fees shall be paid according to the selected package. '
          }
        </Item>

        <Item num="8.4">
          {isTH
            ? 'บริษัทขอสงวนสิทธิ์ในการกำหนดขอบเขต ระยะเวลา และเงื่อนไขของบริการหลังการขาย รวมถึงสิทธิในการ เปลี่ยนแปลงอัตราค่าบริการ โดยจะแจ้งให้ผู้ซื้อทราบล่วงหน้าตามสมควร'
            : 'The Company reserves the right to define and modify the scope, duration, and conditions of after-sales services, including the adjustment of service rates, upon providing reasonable prior notice to the Buyer. '
          }
        </Item>
        
        <Item num="8.5">
          {isTH
            ? 'บริษัทมีสิทธิระงับการให้บริการหลังการขาย หากผู้ซื้อค้างชำระค่าบริการ หรือผิดเงื่อนไขตามสัญญา'
            : 'The Company reserves the right to suspend after-sales services if the Buyer has outstanding payments or breaches any terms of this Agreement. '
          }
        </Item>

        <Item num="8.6">
          {isTH
            ? 'บริษัทจะไม่รับผิดชอบต่อความเสียหายใดๆที่เกิดขึ้น ในช่วงที่ผู้ซื้อไม่ได้อยู่ภายใต้สัญญาบริการหรือไม่ได้ต่ออายุ บริการตามที่กำหนด'
            : 'The Company shall not be held liable for any damages occurring during periods when the Buyer is not covered by a valid service agreement or has failed to renew such services.'
          }
        </Item>

        {/* ─── มาตรา 9 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 9 (ข้อกำหนดการใช้งานและข้อห้าม)' : 'Article 9 (Usage Requirements and Prohibitions)'}
        </Text>

        <Item num="9.1">
          {isTH
            ? 'ผู้ซื้อตกลงใช้สินค้าให้เป็นไปตามวัตถุประสงค์ และคำแนะนำของบริษัทอย่างเคร่งครัด และต้องไม่กระทำการใด ๆ ที่อาจก่อให้เกิดความเสียหายต่อสินค้า หรือส่งผลกระทบต่อประสิทธิภาพของสินค้า'
            : '9.1  The Buyer agrees to use the products strictly in accordance with their intended purpose and the Company’s instructions. The Buyer shall refrain from any actions that may cause damage to the product or adversely affect its performance. '
          }
        </Item>

        <Item num="9.2">
          {isTH
            ? 'ผู้ซื้อไม่มีสิทธิจำหน่าย โอน ให้เช่า หรือใช้สินค้าในเชิงพาณิชย์ต่อบุคคลภายนอก เว้นแต่จะได้รับความยินยอม เป็นลายลักษณ์อักษรจากบริษัท'
            : 'The Buyer has no right to sell, transfer, lease, or provide the products for commercial use to third parties without prior written consent from the Company. '
          }
        </Item>
        
        <View wrap={false}>
        <Item num="9.3">
          {isTH
            ? 'ผู้ซื้อไม่มีสิทธิใช้ชื่อทางการค้า เครื่องหมายการค้า โลโก้ หรือสื่อใด ๆ ของบริษัท เพื่อการโฆษณา การส่งเสริมการขาย หรือการแสดงตนต่อบุคคลภายนอก เว้นแต่จะได้รับอนุญาตจากบริษัทเป็นลายลักษณ์อักษร'
            : 'The Buyer is prohibited from using the Company’s trade names, trademarks, logos, or any corporate media for advertising, sales promotion, or public representation without express written authorization. '
          }
        </Item>
        </View>
        <Item num="9.4">
          {isTH
            ? 'ผู้ซื้อจะต้องไม่ให้ข้อมูลอันเป็นเท็จ บิดเบือน หรือเกินจริงเกี่ยวกับสินค้า หรือบริการของบริษัท'
            : 'The Buyer shall not provide false, distorted, or exaggerated information regarding the products or the Company’s services. '
          }
        </Item>

         <Item num="9.5">
          {isTH
            ? 'ผู้ซื้อจะต้องให้ความร่วมมือในการตรวจสอบข้อเท็จจริง ในกรณีที่มีข้อร้องเรียน หรือข้อพิพาทที่เกี่ยวข้องกับการ ใช้งานสินค้า'
            : 'The Buyer agrees to fully cooperate in any fact-finding or investigation processes related to complaints or disputes arising from the use of the product. '
          }
        </Item>

        <Item num="9.6">
          {isTH
            ? 'ในกรณีที่ผู้ซื้อฝ่าฝืนข้อกำหนดตามมาตรานี้ บริษัทมีสิทธิระงับการให้บริการ การรับประกันหรือสิทธิใด ตามสัญญานี้ ได้ทันทีโดยไม่ต้องแจ้งล่วงหน้าและมีสิทธิเรียกค่าเสียหายได้'
            : '9.6  Any violation of this Article entitles the Company to immediately suspend services, warranties, or any rights under this Agreement without prior notice, and the Company reserves the right to claim for resulting damages.'
          }
        </Item>
        
        
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 10 (การเลิกสัญญา)' : 'Article 10 (Termination of Agreement)'}
        </Text>

        <Item num="10.1">
          {isTH
            ? 'ผู้ซื้ออาจบอกเลิกสัญญานี้ได้ โดยต้องแจ้งเป็นลายลักษณ์อักษรล่วงหน้าไม่น้อยกว่า 30 วัน และจะไม่มีสิทธิ เรียกร้องคืนเงินที่ได้ชำระไปแล้วไม่ว่ากรณีใดๆ'
            : 'The Buyer may terminate this Agreement by providing at least 30 days prior written notice. In such event, the Buyer shall not be entitled to a refund of any payments previously made. '
          }
        </Item>

        <Item num="10.2">
          {isTH
            ? 'บริษัทมีสิทธิเลิกสัญญาได้ทันที โดยไม่ต้องแจ้งล่วงหน้าและไม่ต้องรับผิดชอบต่อความเสียหายใดๆหากเกิดกรณี ดังต่อไปนี้:'
            : 'The Company reserves the right to terminate this Agreement immediately and without prior notice, and shall not be liable for any resulting losses, upon the occurrence of any of the following events:'
          }
        </Item>

         <View style={S.subItem}>
  <Item num="•">
    {isTH ? 'ผู้ซื้อผิดนัดชำระเงิน' : 'The Buyer defaults on any payment.'}
  </Item>
  <Item num="•">
    {isTH ? 'ผู้ซื้อฝ่าฝืนข้อกำหนดในสัญญานี้' : 'The Buyer breaches any terms or conditions of this Agreement.'}
  </Item>
  <Item num="•">
    {isTH ? 'ผู้ซื้อใช้สินค้าในทางที่ผิด...' : 'The Buyer uses the product for unauthorized purposes or in an improper manner.'}
  </Item>
  {!isTH ? (
    <View wrap={false}>
      <Item num="•">
        {'The Buyer engages in actions that defame or damage the Company\'s reputation or business interests.'}
      </Item>
      <Item num="•">
        {'The Buyer commits an illegal act or engages in fraudulent conduct.'}
      </Item>
    </View>
  ) : (
    <>
      <Item num="•">
        {'ผู้ซื้อกระทำการที่อาจก่อให้เกิดความเสียหายต่อชื่อเสียง หรือธุรกิจของบริษัท'}
      </Item>
      <Item num="•">
        {'ผู้ซื้อกระทำผิดกฎหมาย หรือมีพฤติกรรมทุจริต'}
      </Item>
    </>
  )}
</View>

          <Item num="10.3">
          {isTH
            ? 'บริษัทมีสิทธิเลิกสัญญานี้ตามดุลยพินิจ โดยแจ้งล่วงหน้าไม่น้อยกว่า 15 วัน'
            : 'The Company may, at its sole discretion, terminate this Agreement by providing at least 15 days prior written notice.'
          }
        </Item>

          <Item num="10.4">
          {isTH
            ? 'ในกรณีที่สัญญาสิ้นสุดลงไม่ว่าด้วยเหตุใด บริษัทมีสิทธิระงับการให้บริการทั้งหมดทันที และผู้ซื้อไม่มีสิทธิเรียกร้อง ค่าเสียหายใด ๆ'
            : 'Upon termination, the Company shall immediately cease all services. The Buyer shall have no right to claim any damages or compensation from the Company. '
          }
        </Item>

        <Item num="10.5">
          {isTH
            ? 'การเลิกสัญญาไม่กระทบต่อสิทธิของบริษัทในการเรียกร้องค่าเสียหาย หรือหนี้ค้างชำระที่เกิดขึ้น ก่อน การเลิกสัญญา'
            : 'Termination shall not affect the Company’s rights to claim for outstanding debts, interest, or damages incurred prior to the termination date.'
          }
        </Item>

          <Item num="10.6">
          {isTH
            ? 'ข้อกำหนดในสัญญาที่โดยสภาพควรยังคงมีผลบังคับใช้ต่อไปภายหลังการเลิกสัญญา ให้ยังคงมีผลบังคับใช้ต่อไป เช่น ข้อจำกัดความรับผิด การรักษาความลับ และการชดใช้ความเสียหาย'
            : 'Provisions intended by their nature to survive termination including but not limited to limitations of liability, confidentiality, and indemnity shall remain in full force and effect.'
          }
        </Item>

        <Item num="10.7">
          {isTH
            ? 'ในกรณีที่บริษัทเลิกสัญญาเนื่องจากการผิดสัญญาของผู้ซื้อ บริษัทมีสิทธิริบเงินที่ได้รับทั้งหมด และเรียก ค่าเสียหาย เพิ่มเติมได้ตามความเสียหายที่เกิดขึ้นจริง'
            : 'If termination arises from the Buyer’s breach, the Company reserves the right to retain all payments received and claim additional damages for actual losses incurred.'
          }
        </Item>

      
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 11 (การชดใช้ความเสียหาย)' : 'Article 11 (Indemnification and Damages)'}
        </Text>

        <Item num="11.1">
          {isTH
            ? 'ผู้ซื้อยินยอมรับผิดชอบ และชดใช้ค่าเสียหายทั้งหมดที่เกิดขึ้นแก่บริษัท อันเนื่องมาจากการกระทำ การละเลย หรือการไม่ปฏิบัติตามสัญญาของผู้ซื้อ รวมถึงการกระทำของพนักงาน ลูกจ้าง ผู้รับจ้างช่วง หรือ บุคคลที่เกี่ยวข้องกับผู้ซื้อ'
            : 'The Buyer agrees to indemnify and hold the Company harmless against all losses and damages arising from the Buyer’s actions, negligence, or breach of contract. This includes the actions of the Buyer’s employees, agents, or subcontractors.'
          }
        </Item>
          <View wrap={false}>
        <Item num="11.2">
          {isTH
            ? 'ในกรณีที่บริษัทถูกเรียกร้องค่าเสียหาย หรือถูกฟ้องร้องจากบุคคลภายนอก อันมีสาเหตุมาจากการ กระทำของผู้ซื้อ ผู้ซื้อยินยอมชดใช้ค่าเสียหายทั้งหมดแทนบริษัท รวมถึงค่าทนายความ ค่าศาล และ ค่าใช้จ่ายอื่น ๆ ที่เกี่ยวข้อง'
            : 'Should the Company face claims or legal actions from third parties due to the Buyer’s conduct, the Buyer shall be responsible for all settlement costs, legal fees, court costs, and related expenses on behalf of the Company.'
          }
        </Item>
        </View>
        <Item num="11.3">
          {isTH
            ? 'บริษัทมีสิทธิเรียกค่าเสียหายจากผู้ซื้อได้ทั้งความเสียหายทางตรง และความเสียหายที่เกิดขึ้นจริง รวมถึงค่าใช้จ่าย ในการดำเนินการติดตามทวงถามหนี้'
            : 'The Company reserves the right to claim both direct and consequential damages from the Buyer, including costs associated with debt collection. '
          }
        </Item>

        <Item num="11.4">
          {isTH
            ? 'บริษัทมีสิทธิหักเงินใด ๆ ที่ต้องชำระให้แก่ผู้ซื้อ หรือเรียกคืนเงินจากผู้ซื้อได้ทันที เพื่อชดเชยความเสียหายที่เกิดขึ้น'
            : 'The Company is authorized to set off any amounts owed to the Buyer or reclaim funds from the Buyer immediately to compensate for any incurred losses.'
          }
        </Item>

        <Item num="11.5">
          {isTH
            ? 'ภาระผูกพันในการชดใช้ความเสียหายตามสัญญานี้ ให้ยังคงมีผลบังคับใช้ต่อไป แม้สัญญาจะสิ้นสุดลงหรือถูก บอกเลิกแล้ว'
            : 'The obligation to indemnify for damages under this Agreement shall remain in full force and effect notwithstanding the expiration or termination of this Agreement.'
          }
        </Item>

        <Item num="11.6">
          {isTH
            ? 'ในกรณีที่ผู้ซื้อผิดสัญญา ผู้ซื้อยินยอมชำระค่าปรับให้แก่บริษัทตามจำนวนที่กำหนด และหากความเสียหาย ที่เกิดขึ้นจริง สูงกว่าค่าปรับดังกล่าว บริษัทมีสิทธิเรียกค่าเสียหายเพิ่มเติมได้'
            : 'In the event of a breach of contract by the Buyer, the Buyer agrees to pay the Company a penalty in the specified amount. Should the actual damages incurred exceed the aforementioned penalty, the Company reserves the right to claim additional damages.'
          }
        </Item>
        
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 12 (ข้อจำกัดความรับผิดชอบของบริษัท)' : 'Article 12 (Limitation of Liability)'}
        </Text>

        <Item num="12.1">
          {isTH
            ? 'ความรับผิดสูงสุดของบริษัทต่อความเสียหายใดๆที่เกิดขึ้นจากสัญญานี้ ไม่ว่าในกรณีใดๆให้จำกัดอยู่ไม่เกิน มูลค่าค่าสินค้าหรือค่าบริการที่ผู้ซื้อได้ชำระให้แก่บริษัทตามสัญญานี้'
            : 'The maximum aggregate liability of the Company for any damages arising out of or in connection with this Agreement, under any circumstances, shall be limited to the total value of the goods and/or services actually paid by the Buyer to the Company under this Agreement.'
          }
        </Item>

        <Item num="12.2">
          {isTH
            ? 'บริษัทจะไม่รับผิดชอบต่อความเสียหายทางอ้อม ความเสียหายพิเศษ ความเสียหายต่อเนื่อง การสูญเสียกำไร การสูญเสียโอกาสทางธุรกิจ การหยุดชะงักทางธุรกิจหรือความเสียหายใดๆ ที่ไม่ใช่ความเสียหายโดยตรงไม่ว่า ในกรณีใดๆ'
            : 'Under no circumstances shall the Company be liable for any indirect, special, consequential, or incidental damages, including but not limited to loss of profits, loss of business opportunities, business interruption, or any other damages that are not direct damages.'
          }
        </Item>
        <Item num="12.3">
          {isTH
            ? 'บริษัทจะไม่รับผิดชอบต่อความเสียหายที่เกิดจาก:'
            : 'The Company shall not be held liable for damages arising from:'
          }
        </Item>

        <View style={S.subItem}>
          <Item num="•">
            {isTH
              ? 'การใช้งานสินค้าไม่ถูกต้อง หรือไม่เป็นไปตามคำแนะนำ'
              : 'Improper use of products or failure to follow instructions'
            }
          </Item>
          <Item num="•">
            {isTH
              ? 'การติดตั้งโดยบุคคลภายนอกที่ไม่ได้รับอนุญาตจากบริษัท'
              : 'Installation by unauthorized third parties'
            }
          </Item>
          <Item num="•">
            {isTH
              ? 'การดัดแปลง แก้ไข หรือซ่อมแซมสินค้าโดยไม่ได้รับอนุญาต'
              : 'Unauthorized modification, alteration, or repair of the products'
            }
          </Item>
          <Item num="•">
            {isTH
              ? 'เหตุสุดวิสัย หรือเหตุที่อยู่นอกเหนือการควบคุมของบริษัท'
              : ' Force Majeure or events beyond the Company’s reasonable control.'
            }
          </Item>
          </View>

        <Item num="12.4">
          {isTH
            ? 'ข้อจำกัดความรับผิดตามมาตรานี้ ให้มีผลบังคับใช้สูงสุดเท่าที่กฎหมายอนุญาต'
            : 'The limitations of liability under this Article shall apply to the maximum extent permitted by applicable law.'
          }
        </Item>
        

        <Item num="12.5">
          {isTH
            ? 'ผู้ซื้อรับทราบและตกลงว่าราคาสินค้าและบริการตามสัญญานี้ได้คำนวณโดยคำนึงถึงข้อจำกัด ความรับผิดตาม ที่กำหนดไว้ในมาตรานี้แล้ว'
            : 'Under no circumstances shall the Company be liable for any indirect, special, consequential, or incidental damages, including but not limited to loss of profits, loss of business opportunities, business interruption, or any other damages that are not direct damages.'
          }
        </Item>

        <Item num="12.6">
          {isTH
            ? 'บริษัทจะไม่ต้องรับผิดชอบต่อความเสียหายใดๆ เว้นแต่ผู้ซื้อจะสามารถพิสูจน์ได้ โดยชัดแจ้งว่าเป็นความ ผิดโดยตรง ของบริษัท'
            : 'The Company shall not be liable for any damages unless the Buyer can clearly prove that such damages were caused by the Company’s direct negligence or fault.'
          }
        </Item>

        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 13 (การคุ้มครองข้อมูลส่วนบุคคล)' : 'Article 13 (Personal Data Protection)'}
        </Text>

        <Item num="13.1">
          {isTH
            ? 'คู่สัญญาตกลงปฏิบัติตามกฎหมายคุ้มครองข้อมูลส่วนบุคคลของประเทศไทย (PDPA) และกฎหมายที่เกี่ยวข้อง อย่างเคร่งครัด'
            : 'Both parties agree to strictly comply with the Personal Data Protection Act (PDPA) of Thailand and all other relevant regulations.'
          }
        </Item>

        <Item num="13.2">
          {isTH
            ? 'ผู้ซื้อยินยอมให้บริษัทเก็บรวบรวม ใช้และเปิดเผยข้อมูลที่เกี่ยวข้องกับผู้ซื้อ เพื่อวัตถุประสงค์ในการ ดำเนินการตามสัญญา การให้บริการ การติดต่อประสานงาน และการพัฒนาสินค้าและบริการของบริษัท'
            : 'The Buyer consents to the Company’s collection, use, and disclosure of the Buyer’s personal data for the purposes of performing obligations under this Agreement, providing services, coordination, and the development of the Company’s products and services.  '
          }
        </Item>
          <View wrap={false}>
        <Item num="13.3">
          {isTH
            ? 'ผู้ซื้อมีหน้าที่ดูแล รักษาและป้องกันข้อมูลส่วนบุคคลที่อยู่ในความครอบครองของตนเองให้เป็นไปตามมาตรฐาน ความปลอดภัยที่เหมาะสม และต้องไม่เปิดเผย ข้อมูลดังกล่าวโดยไม่ได้รับอนุญาต'
            : 'The Buyer is responsible for the oversight, maintenance, and protection of personal data in their possession in accordance with appropriate security standards and must not disclose such data without prior authorization. '
          }
        </Item>
        </View>
        <Item num="13.4">
          {isTH
            ? 'ในกรณีที่เกิดการรั่วไหล สูญหายหรือถูกเข้าถึงโดยไม่ได้รับอนุญาตของข้อมูลส่วนบุคคล อันเกิดจากการกระทำ หรือความบกพร่องของผู้ซื้อ ผู้ซื้อยินยอมรับผิดชอบต่อความเสียหาย ค่าปรับและภาระทางกฎหมาย ทั้งหมดที่เกิดขึ้นแต่เพียงผู้เดียว'
            : 'In the event of a data leak, loss, or unauthorized access to personal data resulting from the Buyer’s actions or negligence, the Buyer agrees to assume sole responsibility for all damages, fines, and legal liabilities arising therefrom.  '
          }
        </Item>

        <Item num="13.5">
          {isTH
            ? 'บริษัทมีสิทธิ์เข้าตรวจสอบ หรือขอข้อมูลเกี่ยวกับมาตรการคุ้มครองข้อมูลของผู้ซื้อได้ตามความเหมาะสม'
            : 'The Company reserves the right to audit or request information regarding the Buyer’s data protection measures as deemed appropriate.'
          }
        </Item>

        <Item num="13.6">
          {isTH
            ? 'ภาระหน้าที่ตามมาตรานี้ ให้ยังคงมีผลบังคับใช้ต่อไปแม้สัญญาจะสิ้นสุดลงหรือถูกบอกเลิกแล้ว'
            : 'The obligations under this Article shall remain in full force and effect notwithstanding the expiration or termination of this Agreement.'
          }
        </Item>

        
          {isTH ? (
  <Text style={S.secTitle}>มาตรา 14 (การระงับข้อพิพาทและกฎหมายที่ใช้บังคับ)</Text>
) : (
  <View wrap={false}>
    <Text style={S.secTitle}>Article 14 (Dispute Resolution and Governing Law)</Text>
    <Item num="14.1">
      {'In the event of any dispute, controversy, or claim arising out of or relating to this Agreement, the Parties agree to first attempt to resolve the matter through good-faith negotiations.'}
    </Item>
  </View>
)}

{isTH && (
  <Item num="14.1">
    {'ในกรณีที่เกิดข้อพิพาท ข้อโต้แย้ง หรือข้อเรียกร้องใด ๆ อันเกี่ยวเนื่องกับสัญญานี้ คู่สัญญาตกลงให้เจรจาไกล่เกลี่ยกันโดยสุจริตเป็นอันดับแรก'}
  </Item>
)}

        <Item num="14.2">
          {isTH
            ? 'หากไม่สามารถตกลงกันได้ภายใน 30 วัน นับแต่วันที่ฝ่ายหนึ่งแจ้งข้อพิพาทเป็นลายลักษณ์อักษรให้ข้อพิพาท ดังกล่าวอยู่ภายใต้เขตอำนาจของศาลที่มีเขตอำนาจเหนือที่ตั้งสำนักงานใหญ่ของบริษัทแต่เพียงแห่งเดียว'
            : 'If an agreement cannot be reached within 30 days from the date one Party notifies the other of the dispute in writing, such dispute shall be subject to the exclusive jurisdiction of the courts where the Company’s headquarters is located  '
          }
        </Item>

        <Item num="14.3">
          {isTH
            ? 'สัญญานี้ให้อยู่ภายใต้บังคับและการตีความตามกฎหมายแห่งราชอาณาจักรไทย'
            : 'This Agreement shall be governed by and construed in accordance with the laws of the Kingdom of Thailand.'
          }
        </Item>

        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 15 (วันมีผลบังคับใช้)' : 'Article 15 (Effectiveness)'}
        </Text>

        <Item num="15.1">
          {isTH
            ? 'สัญญานี้ให้มีผลบังคับใช้ตั้งแต่วันที่คู่สัญญาทั้งสองฝ่ายได้ลงนามในสัญญานี้หรือวันที่บริษัทได้ รับชำระเงินตามเงื่อนไขที่กำหนด (แล้วแต่กรณีใดจะเกิดขึ้นก่อน)'
            : 'This Agreement shall become effective on the date both Parties execute the Agreement or the date the Company receives payment according to the specified terms (whichever occurs first).'
          }
        </Item>

        <Item num="15.2">
          {isTH
            ? 'ภายหลังจากสัญญามีผลบังคับใช้แล้ว คู่สัญญาตกลงผูกพันตามเงื่อนไขทั้งหมดในสัญญานี้ และเอกสาร แนบท้ายทุกฉบับ'
            : 'Upon the Agreement becoming effective, the Parties agree to be bound by all terms and conditions set forth herein and in all attached appendices.'
          }
        </Item>

        <Item num="15.3">
          {isTH
            ? 'ในกรณีที่มีการออกใบเสนอราคา หรือเอกสารเพิ่มเติมก่อนวันลงนามในสัญญานี้ ให้ถือว่าเอกสารดังกล่าว เป็นส่วนหนึ่งของสัญญานี้และมีผลผูกพันคู่สัญญานับแต่วันที่ออกเอกสารนั้น'
            : 'Any quotations or supplementary documents issued prior to the execution of this Agreement shall be considered an integral part of this Agreement and shall be binding on the Parties from the date such documents were issued.'
          }
        </Item>

        <Item num="15.4">
          {isTH
            ? 'ในกรณีที่ผู้ซื้อได้มีการชำระเงิน หรือเริ่มใช้งานสินค้า ให้ถือว่าผู้ซื้อยอมรับเงื่อนไขตามสัญญานี้โดยสมบูรณ์แม้ยัง ไม่ได้ลงนามในสัญญาก็ตาม'
            : 'In the event that the Buyer has made payment or commenced use of the products, it shall be deemed that the Buyer has fully accepted the terms and conditions of this Agreement, even if the Agreement has not been formally signed.'
          }
        </Item>

        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 16 (ข้อกำหนดทั่วไป)' : 'Article 16 (General Provisions)'}
        </Text>

        <Item num="16.1">
          {isTH
            ? 'สัญญานี้ รวมถึงเอกสารแนบท้าย ถือเป็นข้อตกลงทั้งหมดระหว่างคู่สัญญา และให้มีผลแทนที่ข้อตกลง การเจรจา หรือความเข้าใจใด ๆ ที่มีมาก่อนหน้านี้ ไม่ว่าจะเป็นลายลักษณ์อักษรหรือโดยวาจา'
            : 'This Agreement, including its appendices, constitutes the entire agreement between the Parties and supersedes all prior negotiations, agreements, or understandings, whether written or oral.'
          }
        </Item>

        <Item num="16.2">
          {isTH
            ? 'การแก้ไขเปลี่ยนแปลงหรือเพิ่มเติมเงื่อนไขในสัญญานี้ จะต้องทำเป็นลายลักษณ์อักษรและลงนามโดยคู่สัญญา ทั้งสองฝ่ายเท่านั้น'
            : 'Any amendment, modification, or addition to the terms of this Agreement shall be made in writing and must be duly signed by authorized representatives of both Parties. '
          }
        </Item>

        <Item num="16.3">
          {isTH
            ? 'ในกรณีที่ข้อกำหนดใดในสัญญานี้ตกเป็นโมฆะ หรือไม่สามารถบังคับใช้ได้ ให้ถือว่าข้อกำหนดอื่น ยัง คงมีผลบังคับใช้ต่อไป'
            : 'In the event that any provision of this Agreement is held to be invalid, void, or unenforceable, the validity and enforceability of the remaining provisions shall remain in full force and effect.'
          }
        </Item>

        <Item num="16.4">
          {isTH
            ? 'การที่บริษัทไม่ใช้สิทธิใดๆ ตามสัญญานี้ในเวลาใด ไม่ถือเป็นการสละสิทธิ และบริษัทสามารถใช้สิทธินั้นได้ใน ภายหลัง'
            : 'Any failure or delay by the Company in exercising any right or remedy under this Agreement shall not constitute a waiver thereof, and the Company reserves the right to exercise such rights at a later time.'
          }
        </Item>

        <Item num="16.5">
          {isTH
            ? 'เมื่อสัญญาสิ้นสุดลง ผู้ซื้อจะต้องคืนทรัพย์สิน เอกสาร หรือข้อมูลใด ๆ ของบริษัท (ถ้ามี) โดยทันที'
            : 'Upon the termination of this Agreement, the Buyer shall immediately return all property, documents, or data belonging to the Company (if any).'
          }
        </Item>

       {isTH ? (
  <Item num="16.6">
    {'บริษัทมีสิทธิในการตีความข้อกำหนดในสัญญานี้ในกรณีที่มีความไม่ชัดเจน โดยให้เป็นไปตามเจตนารมณ์ของบริษัท ภายใต้กรอบของกฎหมาย'}
  </Item>
) : (
  <View wrap={false}>
    <Item num="16.7">
      {'The Company reserves the right to interpret the terms of this Agreement in cases of ambiguity, provided that such interpretation aligns with the Company intent and is within the framework of the law.'}
    </Item>
  </View>
)}

<View wrap={false}>
        <Text style={S.secTitle}>
          {isTH ? '[สัญญาแนบท้าย: เงื่อนไขการชำระเงินและบริการ]' : '[Appendix: Payment and Service Terms]'}
        </Text>

        <Item num="1">
          {isTH
            ? 'ราคาสินค้าและบริการ'
            : 'Product and Service Pricing'
          }
        </Item>
        <View style={S.subItem}>
          <Item num="1.1">
            {isTH
              ? 'ราคาสินค้าและ/หรือบริการ ให้เป็นไปตามใบเสนอราคาที่บริษัทออกให้'
              : '1.1  Pricing for products and/or services shall be in accordance with the quotation issued by the Company.'
            }
          </Item>
          <Item num="1.2">
            {isTH
              ? 'ราคาดังกล่าวยังไม่รวมภาษีมูลค่าเพิ่ม (VAT) และค่าใช้จ่ายอื่น ๆ (ถ้ามี)'
              : '1.2  All stated prices are exclusive of Value Added Tax (VAT) and other applicable expenses (if any).'
            }
          </Item>
          </View>

        <Item num="2">
          {isTH
            ? 'เงื่อนไขการชำระเงิน'
            : 'Payment Terms'
          }
        </Item>
        <View style={S.subItem}>
          <Item num="2.1">
            {isTH
              ? 'ผู้ซื้อต้องชำระเงินมัดจำจำนวน …….... % ก่อนเริ่มดำเนินการ'
              : 'The Buyer shall pay a deposit of .........% prior to the commencement of operations.'
            }
          </Item>
          <Item num="2.2">
            {isTH
              ? 'ชำระส่วนที่เหลือก่อน/หรือ ณ วันส่งมอบ/ติดตั้ง (ระบุให้ชัด)'
              : 'The remaining balance shall be paid before or on the date of delivery/installation (as explicitly specified).'
            }
          </Item>
          <Item num="2.3">
            {isTH
              ? 'บริษัทจะเริ่มดำเนินงานเมื่อได้รับชำระเงินตามเงื่อนไขแล้วเท่านั้น'
              : 'The Company shall commence work only after receiving payment in accordance with the agreed terms.'
            }
          </Item>
          </View>

        <Item num="3">
          {isTH
            ? 'เงื่อนไขการส่งมอบและติดตั้ง'
            : 'Delivery and Installation Terms '
          }
        </Item>
        <View style={S.subItem}>
          <Item num="3.1">
            {isTH
              ? 'การติดตั้งจะดำเนินการตามวันและเวลาที่ตกลงร่วมกัน'
              : 'Installation shall be carried out at the date and time mutually agreed upon by both Parties.'
            }
          </Item>
          <Item num="3.2">
            {isTH
              ? 'หากผู้ซื้อเลื่อนนัด หรือไม่พร้อม บริษัทมีสิทธิเรียกเก็บค่าใช้จ่ายเพิ่มเติม'
              : 'In the event that the Buyer postpones the appointment or is unprepared for the installation, the Company reserves the right to charge additional expenses'
            }
          </Item>
          </View>

        <Item num="4">
          {isTH
            ? 'ค่าใช้จ่ายเพิ่มเติม'
            : 'Additional Expenses'
          }
        </Item>
        <View style={S.subItem}>
          <Item num="4.1">
            {isTH
              ? 'ค่าเดินทาง ค่าที่พัก หรือค่าใช้จ่ายหน้างาน (ถ้ามี) ให้เป็นความรับผิดชอบของผู้ซื้อ'
              : 'Travel expenses, accommodation, or on-site operational costs (if any) shall be the sole responsibility of the Buyer.'
            }
          </Item>
          <Item num="4.2">
            {isTH
              ? 'งานเพิ่มเติมนอกเหนือจากขอบเขต ให้คิดค่าใช้จ่ายเพิ่มตามจริง'
              : 'Any work performed beyond the initial scope of services shall be subject to additional charges based on actual costs incurred.'
            }
          </Item>
          </View>

        <Item num="5">
          {isTH
            ? 'การยกเลิกหรือเปลี่ยนแปลงงาน'
            : 'Cancellation or Modification of Work.'
          }
        </Item>
        <View style={S.subItem}>
          <Item num="5.1">
            {isTH
              ? 'หากผู้ซื้อยกเลิกงานหลังจากบริษัทเริ่มดำเนินการแล้ว บริษัทมีสิทธิไม่คืนเงิน'
              : 'If the Buyer cancels the work after the Company has commenced operations, the Company reserves the right to withhold any payments made (no refunds).'
            }
          </Item>
          <Item num="5.2">
            {isTH
              ? 'หากมีการเปลี่ยนแปลงรายละเอียดงาน บริษัทมีสิทธิปรับราคาได้'
              : 'In the event of any modification to the project specifications, the Company reserves the right to adjust the pricing accordingly'
            }
          </Item>
          </View>

        {/* ─── ลายเซ็น ─── */}
        <Item> </Item>
        <Item> </Item>
        <View style={S.signatureSection}>
          <View style={S.witnessRow}>
            <View style={S.witnessCol}>
              <Text style={S.txt}>
                {isTH
                  ? 'ลายเซ็น..........................................................บริษัท'
                  : 'Signature..........................................Company'
                }
              </Text>
              <Text style={[S.txt, { marginTop: 8 }]}>
                ( ...................................................... )
              </Text>
            </View>
            <View style={S.witnessCol}>
              <Text style={S.txt}>
                {isTH
                  ? 'ลายเซ็น..........................................................ผู้ซื้อ'
                  : 'Signature..........................................Buyer'
                }
              </Text>
              <Text style={[S.txt, { marginTop: 8 }]}>
                ( ...................................................... )
              </Text>
            </View>
          </View>
          </View>
        </View>

      </Page>
    </Document>
  );
};

// ✅ Export ทั้ง 2 ชื่อ เผื่อเรียกจาก page.tsx ด้วยชื่อใดก็ได้
export { SalesrepresentativePDF as EmploymentAgreementPDF };
export default SalesrepresentativePDF;


