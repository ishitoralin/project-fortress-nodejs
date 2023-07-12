const db = require(__dirname + '/../modules/connectDB.js');

const tagsData = [
  '1HIIT',
  '2有氧',
  '3心肺',
  '4拳擊',
  '5格鬥',
  '6瑜珈',
  '7壺鈴',
  '8健力',
  '9健美',
  '10健體',
  '11核心',
  '12體能',
  '13體態雕塑',
  '14增肌',
  '15減脂',
  '16皮拉提斯',
  '17藥球',
  '18肌力',
  '19耐力',
  '20上肢力量',
  '21下肢力量',
  '22功能性訓練',
  '23全身性訓練',
  '24專項訓練',
  '25傷害預防',
  '26伸展',
  '27專業建議',
];

(async () => {
  for (let tag of tagsData) {
    const sql = `INSERT INTO c_l_tag(sid, name, created_at) VALUES (NULL, '${tag}', NULL)`;
    const [rows] = await db.query(sql);
    console.log(rows);
  }
  process.exit();
})();
