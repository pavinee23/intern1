import React from 'react';
import { employmentContractData } from './data'; // ตรวจสอบว่าใน data.ts ใช้ชื่อ export นี้
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
          {isTH ? 'สัญญาจ้างงาน' : 'EMPLOYMENT AGREEMENT'}
        </Text>

        {/* ─── บทนำ ─── */}
        <Text style={S.para}>
          {isTH
            ? `สัญญาจ้างงานฉบับนี้มีผลบังคับใช้ตั้งแต่วันที่ ${data.date} ภายใต้ข้อกำหนดและเงื่อนไขที่ระบุไว้ดังต่อไปนี้ ระหว่าง บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด (ซึ่งต่อไปนี้จะเรียกว่า "บริษัท") ทะเบียนเลขที่ 010556809728 ตั้งอยู่ เลขที่12/48 เฉลิมพระเกียรติ ร.9 ซอย 67 แขวงประเวศ เขตประเวศ กรุงเทพมหานคร ประเทศไทย โดยมี ......................................................., กรรมการผู้มีอำนาจ (ซึ่งต่อไปนี้จะเรียกว่า "นายจ้าง") และ ${data.name} (ซึ่งต่อไปนี้จะเรียกว่า "ลูกจ้าง") ทั้งสองฝ่ายตกลงยอมรับเงื่อนไขและข้อกำหนดดังนี้`
            : `This Employment Agreement is effective on ${data.date} and is subject to the terms and conditions stated below by and between K-Energy Save Co.,Ltd. (the "Company") having registration number 010556809728 located at 12/48 Chaloem Phakiat Rama 9 Soi 67, Prawet Sub-district, Prawet District Bangkok, Thailand and represented by ${name}, authorized Director (the "Employer") and ${data.name} (the "Employee"), collectively referred to as the "Parties".`
          }
        </Text>

        {/* ─── มาตรา 1 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 1 (ตำแหน่งและขอบเขตงาน)' : 'Article 1 (POSITION AND SCOPE OF WORK)'}
        </Text>

        <Item num="1.1">
          {isTH
            ? `นายจ้างตกลงจ้างลูกจ้างเพื่อเข้าทำงานในตำแหน่ง ${data.position} แบบเต็มเวลา โดยตำแหน่งงานนี้ประจำ อยู่ในประเทศไทย ลูกจ้างจะต้องปฏิบัติงานตามที่ได้รับมอบหมายในตำแหน่งนี้ และรายงานตรงต่อ ผู้บังคับบัญชาที่ได้รับแต่งตั้ง ทั้งนี้ ลูกจ้างขอรับรองว่ามีความรู้ความสามารถอย่างเต็มที่ ในการปฏิบัติ หน้าที่ตามความรับผิดชอบทั้งหมด และยืนยันว่าไม่มีประวัติอาชญากรรมในประเทศไทย`
            : `The Employer hereby hires the Employee for a full-time position as ${data.position}. This position is based in Thailand. The Employee must perform any work required for this position and report to the assigned superior. The Employee guarantees the full capacity to complete all the duties and assures no criminal record in Thailand.`
          }
        </Item>

        <Item num="1.2">
          {isTH
            ? `ขอบเขตของงาน: ${data.responsibilityDetail}`
            : `Scope of Work: ${data.responsibilityDetail}`
          }
        </Item>

        <Item num="1.3">
          {isTH
            ? `วันที่มีผลบังคับใช้: สัญญาฉบับนี้เริ่มต้นตั้งแต่วันที่ ${data.hiringDate} และให้มีผลต่อเนื่องไปโดยไม่มีกำหนดระยะเวลา (เรียกว่า "ระยะเวลาการจ้างงาน") จนกว่าจะมีการเลิกสัญญาโดยฝ่ายใดฝ่ายหนึ่ง`
            : `Effective Date: This agreement started on ${data.hiringDate} and shall continue for an undefined term (the "Employment Term") until terminated by either party.`
          }
        </Item>

        <Item num="1.4">
          {isTH
            ? `ระยะเวลาทดลองงาน: เว้นแต่จะมีการระบุไว้เป็นพิเศษ ระยะเวลาทดลองงานจะเป็นเวลา 119 วัน นับตั้งแต่วันที่ ${data.hiringDate} ลูกจ้างจะถูกยืนยันให้เป็นพนักงานประจำของบริษัทหลังจากได้รับการประเมินในเชิงบวก`
            : `Probation Period: Unless otherwise specified, the probationary period is 119 days commencing from ${data.hiringDate}. The Employee will be confirmed as a permanent employee of the Company after a favorable evaluation.`
          }
        </Item>

        <Item num="1.5">
          {isTH
            ? `สถานที่ทำงาน: หมายเลข 84 ซอยเฉลิมพระเกียรติ รัชดาภิเษก ซอย 34 ตำบลหนองบอน อำเภอปทุมวัน กรุงเทพฯ 10250 ประเทศไทย\nหมายเหตุ: บริษัทอาจขอให้ลูกจ้างทำงานในสถานที่อื่นในประเทศไทยและประเทศอื่นๆ ตามความจำเป็น`
            : `Workplace: Number 84, Chaloem Phrakiat Rama 9 Alley Soi 34, Nong Bon Sub-district, Prawet District, Bangkok 10250, THAILAND.\nNote: From time to time, the Company may request the Employee to work in other locations in Thailand and other countries as needed.`
          }
        </Item>

        <Item num="1.6">
          {isTH
            ? `ชั่วโมงทำงาน: สัปดาห์การทำงานมาตรฐานของลูกจ้างจะเป็นวันจันทร์ถึงวันศุกร์ ตั้งแต่เวลา 9:00 น. ถึง 18:00 น. ลูกจ้างโดยทั่วไปทำงานเฉลี่ย 40 ชั่วโมงต่อสัปดาห์`
            : `Working Hours: The Employee's standard workweek shall be Monday to Friday from 9:00 – 18:00 hrs. The Employee typically works an average of 40 hours per week.`
          }
        </Item>

        {/* ─── มาตรา 2 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 2 (ค่าตอบแทนและสวัสดิการ)' : 'Article 2 (REMUNERATION AND BENEFITS)'}
        </Text>

        <Text style={S.para}>
          {isTH
            ? `ในระหว่างระยะเวลาการจ้างงาน ลูกจ้างจะมีสิทธิ์เข้าร่วมในแผนค่าตอบแทนและสวัสดิการของพนักงานทั้งหมด ตามตำแหน่งที่ได้รับมอบหมาย สวัสดิการเหล่านี้อาจมีการเปลี่ยนแปลงเป็นระยะๆ และการเปลี่ยนแปลงดังกล่าว จะประกาศล่วงหน้าตามความเหมาะสม`
            : `During the term of employment, the Employee shall be entitled to participate in all Employee remuneration and benefit plans based on the assigned position. These benefits may change on a timely basis and such changes will be announced prior as appropriate.`
          }
        </Text>

        <Item num="2.1">
          {isTH
            ? `ค่าตอบแทนพื้นฐาน: THB ${data.salary} ต่อเดือน (ก่อนหักภาษี) ค่าตอบแทนนี้ถือเป็นข้อมูลความลับและ จะถูกจ่ายอย่างน้อยหนึ่งครั้งต่อเดือนตลอดระยะเวลาของสัญญา`
            : `Base Salary: THB ${data.salary} gross per month. The salary is considered as confidential information and will be payable at least once a month for the duration of the Agreement.`
          }
        </Item>

        <View wrap={false}>
          <Item num="2.2">
            {isTH ? 'สวัสดิการ:' : 'Benefits:'}
          </Item>

        <View style={S.subItem}>
          <Item num="2.2.1">
            {isTH
              ? `โบนัส: ลูกจ้างมีสิทธิ์ได้รับโบนัสหรือค่าตอบแทนจูงใจอื่นๆ ที่จะเป็นไปตามดุลยพินิจของนายจ้าง แต่เพียงผู้เดียวและไม่รวมถึงภาระผูกพันทางกฎหมายใดๆ ขึ้นอยู่กับผลการปฏิบัติงานและเป็นไป ตามนโยบายของบริษัท`
              : `Bonus: The Employee is eligible for bonus or other similar incentive compensation at the sole discretion of the Employer. It depends on performance achievements and in accordance with Company policy.`
            }
          </Item>

          <Item num="2.2.2">
            {isTH
              ? `ค่าคอมมิชชัน: ลูกจ้างมีสิทธิ์ได้รับค่าคอมมิชชันเท่ากับ ............... ของกำไรขั้นต้นจากผลิตภัณฑ์ บริการที่ขายให้กับลูกค้ารายใหม่และสร้างขึ้นโดยตรงจากลูกจ้าง`
              : `Commission: The Employee is eligible to receive a commission equal to XXXX of gross profits from products/services sold to new customers and generated directly by the Employee.`
            }
          </Item>

          <Item num="2.2.3">
            {isTH
              ? `เบี้ยเลี้ยง: นายจ้างจะชดเชยค่าใช้จ่ายโทรศัพท์มือถือและค่าเดินทางที่เกี่ยวข้องกับการดำเนินงาน ของนายจ้างให้กับลูกจ้างทุกเดือน`
              : `Allowance: The Employer will reimburse the Employee every month for cell phone and transportation expenses related to the Employer's operations.`
            }
          </Item>

          <Item num="2.2.4">
            {isTH
              ? `วันลาพักร้อน หลังจากผ่านช่วงทดลองงานลูกจ้างจะมีสิทธิ์ได้รับวันลาพักร้อน โดยยังคงได้รับเงินเดือน ภายในหนึ่งปีปฏิทิน (ตั้งแต่วันที่ 1 มกราคม ถึง 31 ธันวาคม) เริ่มต้นที่ 6 วัน สูงสุดไม่เกิน 15 วัน`
              : `Annual Leaves\nAfter probation, the Employee will be eligible for annual leave, while still receiving salary, within one calendar year (1 January to 31 December), starting at 6 days, maximum at 15 days.`
            }
          </Item>

          <Item num="2.2.5">
            {isTH
              ? `วันหยุดประจำปี: นายจ้างจะแจ้งให้ลูกจ้างทราบเกี่ยวกับวันหยุดประจำปีของบริษัท ตามกฎหมาย แรงงานไทย ซึ่งจะต้องไม่น้อยกว่า 13 วัน`
              : `Annual Holidays: The Employer provides Company's annual holidays in accordance with Thai labor law, which shall not be less than 13 days.`
            }
          </Item>

          <Item num="2.2.6">
            {isTH
              ? `ประกันสุขภาพและชีวิต: นายจ้างให้สวัสดิการด้านสุขภาพและประกันภัยแก่ลูกจ้าง ตามที่ระบุ ไว้ในนโยบายของบริษัท แผนสุขภาพไม่ครอบคลุมเงื่อนไขที่มีอยู่ก่อนแล้ว ซึ่งไม่ได้ประกาศและ ไม่ได้รับการยอมรับโดยบริษัทประกันภัย`
              : `Healthcare & Life Insurance: The Employer provides healthcare and insurance benefits as specified by Company policy. The healthcare plan does not cover pre-existing conditions not declared and accepted by the Insurance Company.`
            }
          </Item>

          <Item num="2.2.7">
            {isTH ? 'กองทุนสำรองเลี้ยงชีพ' : 'Provident Fund'}
          </Item>
        </View>
      </View>

        {/* ─── มาตรา 3 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 3 (ภาษีเงินได้และเงินสมทบประกันสังคม)' : 'Article 3 (INCOME TAXES AND SOCIAL SECURITY CONTRIBUTION)'}
        </Text>

        <Item num="3.1">
          {isTH
            ? `ภาษีเงินได้บุคคลธรรมดาและเงินสมทบประกันสังคมเป็นข้อบังคับของรัฐบาลไทย และจะถูกหักออกจาก เงินเดือน เบี้ยเลี้ยง โบนัส และค่าตอบแทนจูงใจอื่นๆของลูกจ้าง ตามระเบียบ ข้อบังคับของรัฐบาล`
            : `Individual Income Tax and Social Security Contribution is mandated by the Government of Thailand, and will be deducted from the Employee's salary, allowances, bonus, and any other incentive compensation in accordance with government regulations.`
          }
        </Item>

        <Item num="3.2">
          {isTH
            ? `ลูกจ้างมีหน้าที่รับผิดชอบในการแสดงรายได้ของลูกจ้างต่อกรมสรรพากรแห่งประเทศไทยในระหว่างปีภาษี`
            : `The Employee is responsible for justification to the Revenue Department of Thailand for the Employee's income and duration of presence in Thailand during the civil year.`
          }
        </Item>

        {/* ─── มาตรา 4 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 4 (การยุติสัญญาจ้าง)' : 'Article 4 (TERMINATION OF EMPLOYMENT AGREEMENT)'}
        </Text>

        <Item num="4.1">
          {isTH
            ? `การแจ้งยุติสัญญา: หากลูกจ้างประสงค์จะลาออกโดยสมัครใจ ต้องแจ้งเป็นลายลักษณ์อักษรล่วงหน้าอย่างน้อย 30 วัน ลูกจ้างจะต้องคืนเงินใดๆ ที่บริษัทจ่ายล่วงหน้าและหนี้ค้างชำระในวันสุดท้ายของการจ้างงาน`
            : `Notice of Termination: If the Employee wishes to resign voluntarily, the Employee must provide the Employer with at least 30 days' written advance notice. The Employee must return any funds paid in advance and outstanding debts on the final day of employment.`
          }
        </Item>

        <Item num="4.2">
          {isTH
            ? `การเลิกจ้างโดยไม่จ่ายค่าชดเชย:นายจ้างมีสิทธิบอกเลิกสัญญาจ้าง โดยไม่ต้องจ่ายค่าชดเชยให้แก่ลูกจ้างที่ ถูกเลิกจ้างในกรณีใดกรณีหนึ่งดังต่อไปนี้:`
            : `Termination without Severance Pay: The Employer is entitled to terminate an employment agreement without paying severance pay in any of the following cases:`
          }
        </Item>

        <View style={S.subItem}>
          <Item num="(1)">
            {isTH
              ? 'ทุจริตต่อหน้าที่หรือกระทำความผิดอาญาโดยเจตนาแก่นายจ้าง'
              : 'Fraudulent performance of duties or intentional criminal offense against the Employer.'
            }
          </Item>
          <Item num="(2)">
            {isTH
              ? 'จงใจทำให้นายจ้างได้รับความเสียหาย'
              : 'Intentionally causing damage to the Employer.'
            }
          </Item>
          <Item num="(3)">
            {isTH
              ? 'ความประมาทเลินเล่อที่ทำให้นายจ้างได้รับความเสียหายอย่างร้ายแรง'
              : 'Negligence causing serious damage to the Employer.'
            }
          </Item>
          <Item num="(4)">
            {isTH
              ? 'ฝ่าฝืนข้อบังคับเกี่ยวกับการทำงาน ระเบียบ หรือคำสั่งของนายจ้างอันชอบด้วยกฎหมายและเป็นธรรม และนายจ้างได้ตักเตือนเป็นหนังสือแล้ว เว้นแต่กรณีที่ร้ายแรง'
              : 'Violating work regulations, rules, or orders of the Employer that are lawful and fair, and the Employer has already issued a written warning, except in serious cases.'
            }
          </Item>
          <Item num="(5)">
            {isTH
              ? 'ละทิ้งหน้าที่เป็นเวลาสามวันทำงานติดต่อกันไม่ว่าจะมีวันหยุดคั่นหรือไม่ก็ตาม โดยไม่มีเหตุอันสมควร'
              : 'Abandoning duties for three consecutive working days, regardless of holidays in between, without reasonable cause.'
            }
          </Item>
          <Item num="(6)">
            {isTH
              ? 'ได้รับโทษจำคุกตามคำพิพากษาถึงที่สุดให้จำคุก'
              : 'Being sentenced to imprisonment by a final court judgment.'
            }
          </Item>
        </View>

        {/* ─── มาตรา 5 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 5 (กฎระเบียบและข้อบังคับ)' : 'Article 5 (RULES AND REGULATIONS)'}
        </Text>
        <Text style={S.para}>
          {isTH
            ? `ลูกจ้างจะต้องปฏิบัติตามกฎระเบียบ ข้อบังคับการทำงาน และคำสั่งเป็นลายลักษณ์อักษรที่ชอบด้วยกฎหมาย ของบริษัทอย่างเคร่งครัด ซึ่งเกี่ยวข้องกับหน้าที่การงานของลูกจ้าง ตามที่ได้กำหนดไว้ในวันที่ทำสัญญานี้ และตาม ที่อาจมีการแก้ไขเป็นครั้งคราว`
            : `The Employee shall strictly comply with the Company's rules, work regulations, and lawful written directives related to the Employee's job duties, as established at the date of this Agreement and as may be amended from time to time.`
          }
        </Text>

        {/* ─── มาตรา 6 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 6 (ข้อตกลงการไม่ทำธุรกิจแข่งขันกับนายจ้าง)' : 'Article 6 (THE NON-COMPETITION AGREEMENT)'}
        </Text>

        <Item num="6.1">
          {isTH
            ? `ลูกจ้างต้องไม่ทำงาน ปรึกษาหารือ หรือมีผลประโยชน์ทางการเงินใดๆ ไม่ว่าทางตรงหรือทางอ้อมในบริษัท ธุรกิจ หรือบุคคลใดๆที่เสนอผลิตภัณฑ์หรือบริการที่มีความคล้ายคลึงกันอย่างมาก กับผลิตภัณฑ์หรือบริการ ที่นายจ้างดำเนินธุรกิจในประเทศไทย เป็นระยะเวลาสูงสุด 12 เดือนหลังจากลาออก`
            : `The Employee shall not directly or indirectly work for, consult with, or have any financial interest in any company or individual that offers products or services substantially similar to those provided by the Employer within Thailand for a period of up to 12 months after resignation.`
          }
        </Item>

        <Item num="6.2">
          {isTH
            ? 'ข้อตกลงนี้มีผลบังคับใช้ในประเทศไทย ซึ่งเป็นสถานที่ที่นายจ้างดำเนินธุรกิจอยู่'
            : 'This agreement applies within Thailand, where the Employer conducts business.'
          }
        </Item>

        <Item num="6.3">
          {isTH
            ? 'หากลูกจ้างฝ่าฝืนข้อตกลงนี้ นายจ้างอาจลงโทษโดยการปรับเป็นเงินสามเท่าของเงินเดือนของลูกจ้าง ในขณะ ที่ได้ฝ่าฝืนข้อตกลงนี้'
            : 'If the Employee breaches this agreement, the Employer may impose a penalty equal to three times the Employee\'s salary at the time of breach.'
          }
        </Item>

        {/* ─── มาตรา 7 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 7 (ข้อตกลงการรักษาความลับ)' : 'Article 7 (CONFIDENTIALITY AGREEMENT)'}
        </Text>

        <Item num="7.1">
          {isTH
            ? `ข้อมูลลับรวมถึงแต่ไม่จำกัดเพียงเท่านี้ได้แก่ ความลับทางการค้า บันทึกทางการเงิน แผนธุรกิจ รายชื่อ ลูกค้าและผู้จัดหา กลยุทธ์การกำหนดราคา ข้อมูลทางเทคนิค ทักษะความรู้ งานวิจัยที่ไม่ได้เผยแพร่สู่ สาธารณะ การสื่อสารภายในหรือข้อมูลการพัฒนาผลิตภัณฑ์`
            : `Confidential information includes, but is not limited to, trade secrets, financial records, business plans, customer and supplier lists, pricing strategies, technical data, know-how, unpublished research, internal communications, or product development information.`
          }
        </Item>

        <Item num="7.2">
          {isTH
            ? 'การละเมิดข้อตกลงการรักษาความลับใดๆ นี้อาจส่งผลให้เกิดการดำเนินการทางวินัย การเลิกจ้างหรือ ดำเนินคดีทางกฎหมาย'
            : 'Any breach of this confidentiality agreement may result in disciplinary action, termination of employment, and/or legal proceedings for damages or injunctive relief.'
          }
        </Item>

        <View style={S.subItem}>
          <Item num="(1)">
            {isTH
              ? 'ลูกจ้างจะไม่เปิดเผยข้อมูลที่เป็นความลับให้แก่บุคคลที่สามโดยไม่ได้รับความยินยอมเป็นลายลักษณ์อักษร ล่วงหน้าจากนายจ้าง'
              : 'The Employee shall not disclose any confidential information to any third party without the prior express written consent of the Employer.'
            }
          </Item>
          <Item num="(2)">
            {isTH
              ? 'ให้รักษาข้อมูลเป็นความลับอย่างเคร่งครัดและปกป้องข้อมูลดังกล่าวโดยใช้ความระมัดระวังอย่างน้อย ในระดับเดียวกับการปกป้องข้อมูลที่เป็นความลับของตัวเอง'
              : 'Keep the information strictly confidential and protect it using at least the same degree of care as used to protect your own confidential information.'
            }
          </Item>
          <Item num="(3)">
            {isTH
              ? 'ห้ามใช้ข้อมูลที่เป็นความลับเพื่อวัตถุประสงค์อื่นใดนอกเหนือจากหน้าที่และความรับผิดชอบที่นายจ้าง มอบหมาย'
              : 'Not to use confidential information for any purpose other than those duties and responsibilities expressly assigned to the Employee by the Employer.'
            }
          </Item>
          <Item num="(4)">
            {isTH
              ? 'ห้ามคัดลอก หรือทำซ้ำข้อมูลลับที่เปิดเผยโดยนายจ้าง ยกเว้นตามที่กฎหมายกำหนดหรือเพื่อ วัตถุประสงค์ทางธุรกิจที่ถูกต้องตามกฎหมาย'
              : 'Not copy or reproduce, in whole or in part, any confidential information disclosed by the Employer except as required by law or for legitimate business purposes.'
            }
          </Item>
          {isTH ? (
  <Item num="(5)">
    ไม่ยื่นคำขอจดทะเบียนสิทธิบัตรใดๆ ที่เกี่ยวข้องกับข้อมูลที่เป็นความลับ ในระหว่างระยะเวลา การจ้างงานและอีก 2 ปีหลังจากนั้น
  </Item>
) : (
  <View wrap={false}>
    <Item num="(5)">
      Not filing any application for registration of any patent related to confidential information, during the term of employment and for two years thereafter.
    </Item>
  </View>
)}

        </View>

        <Item num="7.6">
          {isTH
            ? 'ข้อตกลงนี้จะมีผลบังคับใช้จนกว่าข้อมูลจะไม่ถูกจัดประเภทเป็นความลับอีกต่อไป'
            : 'This Agreement shall remain in effect until the information ceases to be classified as confidential.'
          }
        </Item>

        {/* ─── มาตรา 8 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 8 (นโยบายการปฏิบัติตามกฎระเบียบของบริษัท)' : 'Article 8 (COMPANY COMPLIANCE POLICIES)'}
        </Text>

        <Item num="8.1">
          {isTH
            ? 'สามารถดูนโยบายการปฏิบัติตามข้อกำหนดฉบับเต็มได้ทางอินทราเน็ตของบริษัท แต่ละนโยบายจะสรุปไว้ใน คู่มือพนักงาน\n'
            : 'The full text of each Compliance Policy is available on the Company intranet or upon request from Human Resources. Summaries are provided in the Employee Handbook.\n'
          }
        </Item>

        <View wrap={false}>
        <Item num="8.2">
          {isTH
            ? 'การละเมิดอาจรวมถึงแต่ไม่จำกัดเพียงเท่านี้ การเปิดเผยข้อมูลลับโดยไม่ได้รับอนุญาต การมีส่วนร่วมใน กิจกรรมต่อต้านการแข่งขัน หรือการเสนอหรือรับสินบน'
            : 'Violations may include unauthorized disclosure of confidential information, participation in anti-competitive practices, or offering or accepting bribes. Disciplinary actions may range from a written warning to immediate termination.'
          }
        </Item>
      </View>

        {/* ─── มาตรา 9 ─── */}
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 9 (การมอบหมายสิทธิ์ในทรัพย์สินทางปัญญา)' : 'Article 9 (ASSIGNMENT OF INTELLECTUAL PROPERTY RIGHTS)'}
        </Text>

        <Item num="9.1">
          {isTH
            ? 'ลูกจ้างจะเปิดเผยเป็นลายลักษณ์อักษรต่อนายจ้างเกี่ยวกับการค้นพบ การประดิษฐ์ กระบวนการหรือ การปรับปรุงใดๆ ที่ลูกจ้างได้ทำหรือค้นพบในระหว่างการจ้างงานหรือที่เกี่ยวข้องโดยตรงกับธุรกิจของบริษัท'
            : 'The Employee will disclose in writing to the Employer any discovery, invention, process or improvement made or discovered by the Employee in the term of employment or that directly relates to the Company\'s business or results from the use of the Company\'s resources.'
          }
        </Item>

        <Item num="9.2">
          {isTH
            ? 'ข้อตกลงนี้จะไม่ใช้กับสิ่งประดิษฐ์ที่ได้รับการพัฒนาในเวลาส่วนตัวของลูกจ้างโดยไม่ได้ใช้ทรัพยากรของบริษัท และไม่เกี่ยวข้องกับธุรกิจของบริษัท'
            : 'This agreement does not apply to inventions developed entirely in the Employee\'s own time without using the Company\'s resources and that do not relate to the Company\'s business.'
          }
        </Item>
        
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 10 (ความขัดแย้งทางผลประโยชน์)' : 'Article 10 (CONFLICT OF INTEREST)'}
        </Text>

        <Item num="10.1">
          {isTH
            ? 'ความขัดแย้งทางผลประโยชน์ อาจรวมถึงแต่ไม่จำกัดเพียงเท่านี้ เช่น การรับของขวัญจากผู้ขาย การถือครอง เงินลงทุนในบริษัทคู่แข่ง หรือการมีส่วนร่วมในธุรกิจครอบครัวที่อาจแข่งขันกับบริษัท ผลประโยชน์ ทางการเงินอื่นๆ ความสัมพันธ์ส่วนตัว หรือการจ้างงานภายนอกที่อาจกระทบต่อความ เป็นกลางหรือความภักดีต่อนายจ้างหรือบริษัท'
            : 'A conflict of interest may include, but is not limited to, accepting gifts from vendors, holding investments in competitor companies, or participating in family businesses that may compete with the Company, other financial interests, personal relationships, or outside employment that could compromise your objectivity or loyalty to the Employer or the Company.'
          }
        </Item>

        <Item num="10.2">
          {isTH
            ? 'ลูกจ้างต้องยื่นเอกสารการเปิดเผยข้อมูลเป็นลายลักษณ์อักษร โดยกรอกแบบฟอร์มการเปิดเผยข้อมูล ความขัดแย้งทางผลประโยชน์อย่างเป็นทางการหรือส่งอีเมล ถึงผู้บังคับบัญชาโดยตรงหรือ ฝ่ายทรัพยากร บุคคล โดยระบุรายละเอียดของความขัดแย้งทางผลประโยชน์ที่อาจเกิดขึ้น และสถานการณ์ที่ เกี่ยวข้อง การไม่เปิดเผยข้อมูลความขัดแย้งทางผลประโยชน์ อาจนำไปสู่การลงโทษทางวินัย ซึ่งอาจรวม ถึงการตักเตือนด้วยวาจา การตักเตือนเป็นลายลักษณ์อักษร การพักงาน หรือการเลิกจ้าง ทั้งนี้ ขึ้นอยู่กับความร้ายแรงของการละเมิดนั้น'
            : 'The Employee is required to submit a written disclosure, either by completing the official Conflict of Interest Disclosure Form or by sending an email to the immediate superior or the HR Department, detailing the nature of the potential conflicts of interest and any relevant circumstances.  Failure to disclose a conflict of interest may result in disciplinary action, which may include a verbal warning, written reprimand, suspension, or termination of employment, depending on the severity of the violation.'
          }
        </Item>

          <Item num="10.3">
          {isTH
            ? 'เมื่อมีการเปิดเผย นายจ้างจะตรวจสอบสถานการณ์และกำหนดการดำเนินการที่เหมาะสม เช่น การมอบหมาย หน้าที่ใหม่ การฝึกอบรมเพิ่มเติม หรือมาตรการอื่นๆ ตามนโยบายของบริษัท'
            : 'Upon disclosure, the Employer will review the situation and determine appropriate actions, such as reassignment of duties, additional training, or other measures in accordance with the Company policy.'
          }
        </Item>

        {isTH ? (
  <>
    <Text style={S.secTitle}>มาตรา 11 (การรับของขวัญ)</Text>
    <Item num="11.1">
      ของขวัญ หมายถึงสิ่งของใดๆที่มีมูลค่า โดยไม่รวมถึงสิ่งของที่ให้กันตามธรรมเนียมปฏิบัติ เช่น การ์ดวันหยุด และของที่ระลึก ที่มักมอบให้กันในการติดต่อธุรกิจ รวมถึงสิ่งของมูลค่าเล็กน้อย เช่น เอกสารส่งเสริมการขาย หรือของว่างและเครื่องดื่มที่จัดให้ระหว่างการประชุมธุรกิจ
    </Item>
    <Item num="11.2">
      เมื่อปฏิบัติหน้าที่ในฐานะลูกจ้างของนายจ้าง ลูกจ้างต้องไม่รับของขวัญ ค่าตอบแทน เงินรางวัล หรือ สิ่งตอบแทนใดๆ ไม่ว่าทางตรงหรือทางอ้อม จากบุคคลใดก็ตามที่มีความสัมพันธ์ ทางธุรกิจกับนายจ้างหรือบริษัท ลูกจ้างต้องรายงานข้อเสนอหรือของขวัญดังกล่าว ต่อนายจ้างโดยตรง หรือฝ่ายทรัพยากรบุคคลภายใน 24 ชั่วโมง
    </Item>
  </>
) : (
  <View wrap={false}>
    <Text style={S.secTitle}>Article 11 (GIFTS)</Text>
    <Item num="11.1">
      A gift refers to any item of value. This does not include customary items, such as holiday cards and small tokens commonly provided in business settings, as well as items of nominal value, like promotional materials or refreshments provided during business meetings.
    </Item>
    <Item num="11.2">
      When acting as the Employee of the Employer, the Employee must not accept any gift, gratuity, payment, benefit or any form of compensation--either directly or indirectly--from anyone with a business relationship with the Employer or the Company. Employees must report such offer or gift to the immediate superior or the HR Department within 24 hours, including details of the nature of the offer or gift, the giver's identity, and the circumstances under which it was offered.
    </Item>
  </View>
)}

        <View wrap={false}>
        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 12 (นโยบายข้อมูลส่วนบุคคล)' : 'Article 12 (PERSONAL DATA POLICY)'}
        </Text>

        <Item num="12.1">
          {isTH
            ? 'ลูกจ้างยินยอมให้นายจ้างเปิดเผยข้อมูลส่วนบุคคลที่รวบรวมไว้ เช่น ข้อมูลการติดต่อและบันทึกการจ้างงาน เป็นต้น ภายใต้ข้อตกลงนี้ให้แก่บริษัทในเครือหรือบุคคลที่สาม ที่ได้รับการว่าจ้างเพื่อวัตถุประสงค์ทางธุรกิจ ที่ถูกต้องตามกฎหมาย เช่น การประมวลผลเงินเดือน การบริหารสวัสดิการ หรือการสนับสนุนด้านไอที โดยให้ การเปิดเผยดังกล่าวเป็นไปตามกฎหมายความเป็นส่วนตัวของข้อมูลที่มีผลบังคับใช้'
            : 'The Employee also grants consent to the Employer to disclose collected personal data, such as contact information and employment records, under this Agreement to its affiliate companies or third parties engaged for legitimate business purposes, such as payroll processing, benefits administration, or IT support, provided such disclosure complies with applicable data privacy laws.'
          }
        </Item>

        <Item num="12.2">
          {isTH
            ? 'ลูกจ้างสามารถขอเข้าถึงหรือแก้ไขข้อมูลส่วนบุคคลของลูกจ้างได้โดยยื่นคำขอเป็นลายลักษณ์อักษร (ทางอีเมลหรือจดหมาย) ไปยังฝ่ายทรัพยากรบุคคล นายจ้างอาจขอหลักฐานยืนยันตัวตนหรือเอกสารเพิ่มเติม ก่อนดำเนินการตามคำขอบางรายการ และอาจปฏิเสธคำขอดังกล่าว ได้ตามกฎหมายคุ้มครองข้อมูล ส่วนบุคคลที่เกี่ยวข้อง'
            : 'The Employee may request access to or correction of the Employee’s personal data by submitting a written request (via email or physical letter) to the HR department.  The Employer may require proof of identity or additional documentation before processing certain requests, and may deny requests in accordance with applicable data privacy laws.'
          }
        </Item>
        </View>

        <Text style={S.secTitle}>
          {isTH ? 'มาตรา 13 (เครือข่ายสังคมออนไลน์)' : 'Article 13 (SOCIAL NETWORKS)'}
        </Text>

        <Item num="13.1">
          {isTH
            ? '“เครือข่ายสังคมออนไลน์” หมายถึงแพลตฟอร์มออนไลน์ที่ออกแบบมา โดยเฉพาะเพื่อให้ผู้ใช้สร้างโปรไฟล์ และโต้ตอบทางสังคม ซึ่งรวมถึงแต่ไม่จำกัดเพียงเท่านี้ ได้แก่ TikTok, LinkedIn, Facebook, X, Instagram, WeChat, LINE และ Weibo เป็นต้น'
            : '“Social Networks” refers to any online platform primarily designed for users to create profiles and interact socially, including but not limited to TikTok, LinkedIn, Facebook, X, Instagram, WeChat, LINE, and Weibo, among others.'
          }
        </Item>

        <Item num="13.2">
          {isTH
            ? 'ลูกจ้างตกลงที่จะปรับปรุงข้อมูลประวัติการจ้างงาน ซึ่งรวมถึงตำแหน่งงาน ตำแหน่งงานปัจจุบัน และวันที่เริ่มงาน ในระบบทรัพยากรบุคคลของบริษัทให้ถูกต้องโดยเร็ว'
            : 'The Employee agrees to promptly update the employment records, including job title, current assignments, and start date, in the Company’s HR system to ensure accuracy.  '
          }
        </Item>

        <Item num="13.3">
          {isTH
            ? 'ลูกจ้างตกลงที่จะไม่วิพากษ์วิจารณ์ต่อสาธารณะหรือเผยแพร่ข้อความอันเป็นเท็จหรือทำให้เข้าใจผิดใดๆ ที่อาจก่อให้เกิดความเสียหายต่อชื่อเสียง จรรยาบรรณทางการเงิน หรือการรับรู้ของสาธารณชนต่อนายจ้าง บริษัท กรรมการ พนักงานคนอื่น หรือบริษัทอื่นภายในกลุ่มบริษัทบนแพลตฟอร์มสาธารณะหรือส่วนตัวใดๆ ข้อตกลงนี้ไม่ได้ห้ามพนักงานเปิดเผยข้อมูลที่กฎหมายกำหนด หรือรายงานปัญหาต่อหน่วยงานกำกับดูแล โดยชอบด้วยกฎหมาย'
            : 'The Employee undertakes not to publicly criticize or publish any false or misleading statement that could harm the reputation, financial integrity, or public perception of the Employer, the Company, its directors, employees, or any company within the Group on any public or private platform.  This agreement does not prohibit the Employee from making disclosures that are required by law or reporting concerns to regulatory authorities.  '
          }
        </Item>
        {isTH ? (
          <>
            <Text style={S.para}>
              ลูกจ้างยืนยันว่า รายละเอียดทั้งหมดในสัญญาการจ้างงานนี้ถูกต้องและเป็นความลับ สัญญานี้ไม่มีผลบังคับใช้ กับข้อมูลที่เปิดเผยต่อสาธารณะโดยไม่ใช่ความผิดของลูกจ้าง หรือข้อมูลที่กฎหมายหรือคำสั่งศาลกำหนดให้ ต้องเปิดเผย การละเมิดข้อตกลงการรักษาความลับนี้ อาจส่งผลให้ได้รับโทษทางวินัย ซึ่งอาจ รวมถึงการเลิกจ้าง
            </Text>
            <Text style={S.para}>
              สัญญาฉบับนี้ทำขึ้นเป็นสองฉบับและแทนที่สัญญาที่เป็นลายลักษณ์อักษรหรือด้วยวาจาฉบับก่อนหน้าทั้งหมด และถือเป็นข้อตกลงฉบับสมบูรณ์ระหว่างคู่สัญญาทั้งสองฝ่าย ทั้งสองฝ่ายได้อ่านและเข้าใจข้อกำหนดและเงื่อนไขทั้งหมดของ สัญญาจ้างงานฉบับนี้อย่างถ่องแท้แล้วและยินดีที่จะปฏิบัติตาม ดังนั้น ทั้งสองฝ่ายจึงลงนามในสัญญาฉบับนี้เป็นการ ยอมรับและเป็นหลักฐาน
            </Text>
          </>
        ) : (
          <View wrap={false}>
            <Text style={S.para}>
              The Employee confirms that all details in this Employment Agreement are accurate and confidential. This agreement does not apply to information that is publicly available through no fault of the Employee or is required to be disclosed by law or court order. Any breach of this confidentiality agreement may result in disciplinary action, up to and including termination of employment.
            </Text>
            <Text style={S.para}>
              THIS AGREEMENT is made in duplicate and supersedes all previous written and/or oral agreements and represents the entire agreement between the parties. Both parties have read and understood thoroughly all terms and conditions of this employment agreement stated herein and are willing to comply therewith. Therefore, both parties sign hereunder as evidence and acceptance.
            </Text>
          </View>
        )}

        {/* ─── ลายเซ็น ─── */}
        <Item> </Item>
        <Item> </Item>
        <View style={S.signatureSection}>
          <View style={S.witnessRow}>
            <View style={S.witnessCol}>
              <Text style={S.txt}>
                {isTH
                  ? 'ลายเซ็น..........................................................นายจ้าง'
                  : 'Signature..........................................Employer'
                }
              </Text>
              <Text style={[S.txt, { marginTop: 8 }]}>
                ( ...................................................... )
              </Text>
            </View>
            <View style={S.witnessCol}>
              <Text style={S.txt}>
                {isTH
                  ? 'ลายเซ็น..........................................................ลูกจ้าง'
                  : 'Signature..........................................Employee'
                }
              </Text>
              <Text style={[S.txt, { marginTop: 8 }]}>
                ( ...................................................... )
              </Text>
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

