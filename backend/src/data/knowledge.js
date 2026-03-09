/**
 * ═══════════════════════════════════════════════════════════════
 * ALIGN — RAG Knowledge Base
 * ไฟล์นี้คือ "สมอง" ของ chatbot
 * แก้ไข / เพิ่มเติมความรู้ได้ที่นี่เลย ไม่ต้องแตะโค้ดอื่น
 *
 * โครงสร้างแต่ละ entry:
 * {
 *   id: string           — unique ID (ห้ามซ้ำ)
 *   category: string     — หมวดหมู่
 *   tags: string[]       — keywords สำหรับ search
 *   title: string        — ชื่อหัวข้อ
 *   content: string      — เนื้อหา
 *   source: string       — ชื่อแหล่งที่มา (แสดงต่อผู้ใช้)
 *   reference: string    — URL หรือ citation เต็ม
 * }
 * ═══════════════════════════════════════════════════════════════
 */

export const knowledgeBase = [

  {
    id: 'os_001',
    category: 'office_syndrome',
    tags: ['office syndrome', 'ออฟฟิศซินโดรม', 'อาการ', 'สาเหตุ', 'นั่งนาน'],
    title: 'Office Syndrome คืออะไร',
    source: 'Mayo Clinic & กรมการแพทย์ กระทรวงสาธารณสุข',
    reference: 'https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/office-ergonomics/art-20046169',
    content: `Office Syndrome คือกลุ่มอาการที่เกิดจากการทำงานในท่าเดิมซ้ำๆ เป็นเวลานาน

สาเหตุหลัก:
- นั่งในท่าเดิมนานเกิน 2 ชั่วโมงโดยไม่ลุกเดิน
- จอคอมพิวเตอร์อยู่สูงหรือต่ำเกินไป
- เก้าอี้ไม่รองรับหลังส่วนล่าง (lumbar support)
- ก้มดูโทรศัพท์บ่อยๆ (Text Neck)

อาการที่พบบ่อย:
- ปวดคอ บ่า ไหล่
- ปวดหลังส่วนล่าง (Lower Back Pain)
- ปวดศีรษะจากกล้ามเนื้อคอตึง
- มือชา นิ้วชา (Carpal Tunnel)
- ตาล้า ตาแห้ง (Computer Vision Syndrome)`,
  },

  {
    id: 'os_002',
    category: 'office_syndrome',
    tags: ['ป้องกัน', 'prevention', 'วิธีป้องกัน', 'office syndrome'],
    title: 'วิธีป้องกัน Office Syndrome',
    source: 'Occupational Safety and Health Administration (OSHA)',
    reference: 'https://www.osha.gov/ergonomics',
    content: `การป้องกัน Office Syndrome ทำได้โดย:

1. หลัก 20-20-20: ทุก 20 นาที ให้มองจุดห่าง 20 ฟุต นาน 20 วินาที
2. ลุกขึ้นยืนหรือเดินทุก 30-60 นาที แม้แค่ 2-5 นาที
3. ตั้งจอคอมพิวเตอร์ให้ระดับสายตาหรือต่ำกว่าเล็กน้อย
4. ปรับเก้าอี้ให้เท้าแตะพื้น หัวเข่างอ 90 องศา
5. ออกกำลังกาย stretch กล้ามเนื้อคอ บ่า หลัง ทุกวัน`,
  },

  {
    id: 'pc_001',
    category: 'posture_correction',
    tags: ['ท่านั่ง', 'การนั่ง', 'posture', 'ท่าทาง', 'ergonomics'],
    title: 'ท่านั่งที่ถูกต้องสำหรับการทำงาน',
    source: 'Cleveland Clinic — Ergonomics Guidelines',
    reference: 'https://my.clevelandclinic.org/health/articles/4485-back-health-and-posture',
    content: `ท่านั่งที่ดีประกอบด้วย:

หัวและคอ:
- หูอยู่ตรงกับไหล่ ไม่ยื่นไปข้างหน้า
- สายตามองตรง ไม่ก้มหรือแหงนหัว

ไหล่และแขน:
- ไหล่ผ่อนคลาย ไม่ยกขึ้น ไม่ห่อเข้า
- ข้อศอกงอ 90 องศา

ลำตัวและหลัง:
- หลังตรง มีความโค้งตามธรรมชาติที่ช่วง lumbar
- สะโพกชิดพนักเก้าอี้ ไม่นั่งขอบ

ขาและเท้า:
- หัวเข่างอ 90 องศา
- เท้าวางบนพื้นราบ
- ไม่ไขว่ห้างนานๆ`,
  },

  {
    id: 'pc_002',
    category: 'posture_correction',
    tags: ['หลังค่อม', 'kyphosis', 'หลังโก่ง', 'หลัง', 'แก้', 'ปรับ'],
    title: 'วิธีแก้หลังค่อม (Kyphosis)',
    source: 'American Physical Therapy Association (APTA)',
    reference: 'https://www.choosept.com/symptomsconditionsdetail/physical-therapy-guide-to-kyphosis',
    content: `หลังค่อม (Kyphosis) คือการโค้งของกระดูกสันหลังส่วนบนมากผิดปกติ

วิธีแก้ไข:
1. Shoulder Blade Squeeze: บีบสะบักเข้าหากัน ค้าง 5 วินาที 15 ครั้ง
2. Chest Stretch: ยืนในกรอบประตู ยืดหน้าอก ค้าง 30 วินาที
3. Thoracic Extension: นั่งพิงเก้าอี้ เอนหลังโค้งไปด้านหลังเล็กน้อย
4. Wall Angel: แนบหลังกับผนัง ขยับแขนขึ้นลงแบบทูตสวรรค์
5. Face Pull ด้วย resistance band

ระยะเวลา: ทำสม่ำเสมอทุกวัน 3-6 เดือน จึงจะเห็นผลชัดเจน`,
  },

  {
    id: 'pc_003',
    category: 'posture_correction',
    tags: ['คอยื่น', 'text neck', 'forward head', 'คอ', 'ปวดคอ', 'หัวยื่น'],
    title: 'แก้คอยื่น / Forward Head Posture',
    source: 'Spine-health.com & Hansraj KK (2014) — Surgical Technology International',
    reference: 'https://pubmed.ncbi.nlm.nih.gov/25393825/',
    content: `Forward Head Posture คือศีรษะยื่นไปข้างหน้ากว่าแนวไหล่

ผลกระทบ: ทุกๆ 2.5 ซม. ที่ยื่นออก จะเพิ่มน้ำหนักให้คอรับถึง 4.5 กก. (Hansraj, 2014)

วิธีแก้:
1. Chin Tuck: ดึงคางตรงกลับ ค้าง 5 วินาที ทำ 10 ครั้ง ทุก 1 ชั่วโมง
2. Cervical Retraction: ดึงหัวกลับตรงๆ เหมือนทำ double chin
3. Suboccipital stretch: ก้มคางลงเล็กน้อย มือกดท้ายทอยเบาๆ ยืด 30 วินาที
4. Levator Scapulae stretch: เอียงหัวให้หูแตะไหล่ มือกดศีรษะเบาๆ`,
  },

  {
    id: 'ex_001',
    category: 'exercises',
    tags: ['ออกกำลังกาย', 'ยืดกล้ามเนื้อ', 'stretch', 'exercise', 'ท่าบริหาร', 'คอ', 'บ่า'],
    title: 'ท่าบริหารคอและบ่า (Office Stretch)',
    source: 'Mayo Clinic — Neck Exercises',
    reference: 'https://www.mayoclinic.org/diseases-conditions/neck-pain/in-depth/neck-pain/art-20048279',
    content: `ท่าบริหารที่ทำได้ที่โต๊ะทำงาน ใช้เวลา 5-10 นาที:

1. Neck Rotation: หมุนหัวซ้าย-ขวา ค้างละ 10 วินาที 3 รอบ
2. Lateral Neck Flexion: เอียงหูแตะไหล่ ค้างละ 15 วินาที 3 รอบ
3. Shoulder Rolls: หมุนไหล่ไปข้างหน้า-หลัง 10 ครั้ง
4. Upper Trapezius Stretch: มือจับขอบเก้าอี้ อีกมือกดศีรษะเบาๆ ค้าง 20 วินาที
5. Doorway Chest Stretch: ยืนในกรอบประตู ยืดหน้าอก 30 วินาที
6. Thoracic Rotation: บิดลำตัวซ้าย-ขวา 10 ครั้ง

ทำทุก 1-2 ชั่วโมง`,
  },

  {
    id: 'ex_002',
    category: 'exercises',
    tags: ['core', 'กล้ามเนื้อแกนกลาง', 'หลัง', 'เสริมความแข็งแรง', 'strengthen', 'plank'],
    title: 'เสริมความแข็งแรง Core เพื่อรองรับกระดูกสันหลัง',
    source: 'Harvard Health Publishing',
    reference: 'https://www.health.harvard.edu/staying-healthy/the-real-world-benefits-of-strengthening-your-core',
    content: `Core คือกล้ามเนื้อแกนกลางลำตัว ได้แก่ หน้าท้อง หลัง สะโพก

ท่าพื้นฐาน:
1. Dead Bug: นอนหงาย แขน-ขายกขึ้น ค่อยๆ ลดแขนซ้าย-ขาขวาลง 3x10
2. Bird Dog: คุกเข่า ยกแขนซ้าย-ขาขวาพร้อมกัน ค้าง 3 วินาที 3x10
3. Plank: ค้าง 20-60 วินาที 3 เซ็ต
4. Glute Bridge: นอนหงาย ยกสะโพก ค้าง 2 วินาที 3x15

ทำ 3-4 ครั้ง/สัปดาห์ เห็นผลใน 4-6 สัปดาห์`,
  },

  {
    id: 'ex_003',
    category: 'exercises',
    tags: ['breathing', 'หายใจ', 'diaphragm', 'ผ่อนคลาย', 'stress', 'box breathing'],
    title: 'เทคนิคการหายใจเพื่อลดความตึงเครียดกล้ามเนื้อ',
    source: 'Cleveland Clinic — Diaphragmatic Breathing',
    reference: 'https://my.clevelandclinic.org/health/articles/9445-diaphragmatic-breathing',
    content: `การหายใจลึกด้วย Diaphragm ช่วยลดความตึงเครียดของกล้ามเนื้อคอและบ่า

Diaphragmatic Breathing:
- หายใจเข้าลึกๆ ให้ท้องพองขึ้น (ไม่ใช่อก) ทำ 5-10 ครั้ง

Box Breathing (4-4-4-4):
- หายใจเข้า 4 วินาที → กลั้น 4 → ออก 4 → กลั้น 4
- ใช้โดย US Navy SEALs ในการลดความเครียดเฉียบพลัน

4-7-8 Breathing (ก่อนนอน):
- หายใจเข้า 4 วินาที → กลั้น 7 → ออก 8 ทำ 4 รอบ`,
  },

  {
    id: 'erg_001',
    category: 'ergonomics',
    tags: ['ergonomics', 'จอคอม', 'โต๊ะ', 'เก้าอี้', 'จัดโต๊ะ', 'workspace'],
    title: 'การจัดโต๊ะทำงาน Ergonomics ที่ถูกต้อง',
    source: 'OSHA — Computer Workstations eTool',
    reference: 'https://www.osha.gov/etools/computer-workstations',
    content: `การจัดโต๊ะที่ดีลด Office Syndrome ได้ถึง 60%

จอคอมพิวเตอร์:
- ระยะห่าง: 50-70 ซม. (ประมาณหนึ่งช่วงแขน)
- ความสูง: ขอบบนอยู่ระดับสายตา
- มุม: เอียงจอออก 10-20 องศา

เก้าอี้:
- ความสูง: เท้าแตะพื้น หัวเข่างอ 90 องศา
- Lumbar Support: รองรับหลัง L3-L5
- Armrest: ข้อศอกงอ 90 องศา ไหล่ไม่ยก

Standing Desk: สลับนั่ง-ยืนทุก 30-60 นาที`,
  },

  {
    id: 'erg_002',
    category: 'ergonomics',
    tags: ['laptop', 'แล็ปท็อป', 'notebook', 'การใช้แล็ปท็อป'],
    title: 'วิธีใช้ Laptop อย่างถูกต้อง',
    source: 'Cornell University Ergonomics Web (CUErgo)',
    reference: 'http://ergo.human.cornell.edu/culaptoptips.html',
    content: `Laptop ออกแบบมาเพื่อความพกพา ไม่ใช่ ergonomics — จอต่ำเกินไปทำให้ก้มคอ

วิธีแก้:
1. ใช้ Laptop Stand ยกจอให้ระดับสายตา (200-500 บาท)
2. ใช้ External Keyboard + Mouse (300-1,300 บาท)
3. ถ้าไม่มีอุปกรณ์: ใช้กล่องหนังสือรองแทนได้

อุปกรณ์เสริมที่แนะนำ: Laptop Stand, External Keyboard, Wireless Mouse, Monitor Arm`,
  },

  {
    id: 'pr_001',
    category: 'pain_relief',
    tags: ['ปวดหลัง', 'lower back pain', 'หลังส่วนล่าง', 'ปวด', 'แก้ปวด'],
    title: 'รับมือกับปวดหลังส่วนล่าง (Lower Back Pain)',
    source: 'National Institute of Neurological Disorders and Stroke (NINDS)',
    reference: 'https://www.ninds.nih.gov/health-information/patient-caregiver-education/fact-sheets/low-back-pain-fact-sheet',
    content: `ปวดหลังส่วนล่างเป็นอาการที่พบมากที่สุดใน Office Syndrome

บรรเทาทันที:
1. ลุกขึ้นยืน เดิน 5 นาที
2. Cat-Cow Stretch: คุกเข่า โค้งหลังขึ้น-ลง 10 ครั้ง
3. Child's Pose: คุกเข่า ก้มลงเหยียดแขนไปข้างหน้า ค้าง 30 วินาที
4. Knee to Chest: นอนหงาย ดึงเข่าเข้าหาอก ค้าง 20 วินาที
5. ประคบร้อน 15-20 นาที

⚠️ ควรพบแพทย์เมื่อ: ปวดรุนแรง ปวดร้าวลงขา มีอาการชา`,
  },

  {
    id: 'pr_002',
    category: 'pain_relief',
    tags: ['ปวดคอ', 'neck pain', 'ปวดบ่า', 'ไหล่', 'muscle tension'],
    title: 'บรรเทาปวดคอและบ่า',
    source: 'Mayo Clinic — Neck Pain',
    reference: 'https://www.mayoclinic.org/diseases-conditions/neck-pain/diagnosis-treatment/drc-20375587',
    content: `อาการปวดคอ-บ่า มักมาจาก Upper Trapezius และ Levator Scapulae ทำงานหนักเกินไป

บรรเทาเร่งด่วน:
1. กดจุด trigger point บนบ่า ค้าง 10-15 วินาที
2. ประคบร้อน 15-20 นาที
3. Neck Rotation ช้าๆ 5 รอบ

ยืดคลาย:
1. Upper Trapezius Stretch: เอียงหัวให้หูแตะไหล่ ค้าง 20 วินาที
2. Levator Scapulae: หันหัว 45 องศา ก้มคาง ค้าง 20 วินาที

Self-massage: ลูกเทนนิสกลิ้งบ่า / foam roller คลึงหลังบน`,
  },

  {
    id: 'ls_001',
    category: 'lifestyle',
    tags: ['นอนหลับ', 'sleep', 'ท่านอน', 'หมอน', 'ที่นอน'],
    title: 'ท่านอนที่ดีต่อกระดูกสันหลัง',
    source: 'Sleep Foundation & Mayo Clinic',
    reference: 'https://www.sleepfoundation.org/sleeping-positions',
    content: `ท่านอนส่งผลต่อสุขภาพกระดูกสันหลัง — ควรนอน 7-9 ชั่วโมง/คืน

1. นอนตะแคง (ดีที่สุด): หนุนหมอนระหว่างหัวเข่า
2. นอนหงาย: หนุนหมอนใต้เข่าลดแรงกดหลัง
3. นอนคว่ำ (ไม่แนะนำ): บิดคอทั้งคืน ทำลายกระดูกต้นคอ

หมอน: เลือกที่รองรับช่องว่างระหว่างคอกับที่นอน เปลี่ยนทุก 1-2 ปี`,
  },

  {
    id: 'ls_002',
    category: 'lifestyle',
    tags: ['สมาร์ทโฟน', 'โทรศัพท์', 'text neck', 'phone', 'ก้มหน้าจอ'],
    title: 'ลด Text Neck จากการใช้สมาร์ทโฟน',
    source: 'Hansraj KK (2014) — Surgical Technology International',
    reference: 'https://pubmed.ncbi.nlm.nih.gov/25393825/',
    content: `Text Neck คืออาการปวดคอจากการก้มดูโทรศัพท์

ผลกระทบตามงานวิจัย Hansraj (2014):
- ก้ม 15° = รับน้ำหนัก 12 กก. บนคอ
- ก้ม 45° = รับน้ำหนัก 22 กก. บนคอ
- ก้ม 60° = รับน้ำหนัก 27 กก. บนคอ

วิธีลด:
1. ยกโทรศัพท์ให้ระดับสายตา
2. ตั้งเวลาเตือนทุก 20-30 นาที ให้ยืดคอ
3. ปิดแจ้งเตือนที่ไม่จำเป็น`,
  },

  {
    id: 'dr_001',
    category: 'when_to_see_doctor',
    tags: ['พบแพทย์', 'หมอ', 'อันตราย', 'red flag', 'นักกายภาพ'],
    title: 'เมื่อไหร่ควรพบแพทย์หรือนักกายภาพบำบัด',
    source: 'American Physical Therapy Association (APTA)',
    reference: 'https://www.choosept.com/guide/physical-therapy-guide-neck-pain',
    content: `Red Flags — ต้องพบแพทย์ทันที:
- ปวดรุนแรงมาก รบกวนการนอนหลับ
- ปวดร้าวลงขา/แขน มีอาการชาหรืออ่อนแรง
- ปัสสาวะ/อุจจาระผิดปกติ (ฉุกเฉินมาก)
- ปวดไม่ดีขึ้นหลังพัก หรือแย่ลงทุกวัน

ควรพบนักกายภาพบำบัด:
- ปวดนาน 2-3 สัปดาห์ขึ้นไป ไม่ดีขึ้น
- Posture score ต่ำต่อเนื่อง ต้องการ professional guidance

ผู้เชี่ยวชาญ: นักกายภาพบำบัด, แพทย์ออร์โธปิดิกส์, แพทย์เวชศาสตร์ฟื้นฟู`,
  },

];

/**
 * Keyword-based retrieval — returns top N relevant entries
 */
export function retrieveContext(query, topN = 3) {
  const q = query.toLowerCase();

  const scored = knowledgeBase.map(entry => {
    let score = 0;

    entry.tags.forEach(tag => {
      if (q.includes(tag.toLowerCase())) score += 3;
    });

    if (entry.title.toLowerCase().split(' ').some(w => q.includes(w) && w.length > 2)) score += 2;

    if (q.includes(entry.category.toLowerCase())) score += 1;

    const contentWords = entry.content.toLowerCase().split(/\s+/);
    const queryWords = q.split(/\s+/).filter(w => w.length > 2);
    queryWords.forEach(qw => {
      if (contentWords.some(cw => cw.includes(qw))) score += 0.5;
    });

    return { ...entry, score };
  });

  return scored
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

export const CATEGORIES = [...new Set(knowledgeBase.map(e => e.category))];
