const db = require(__dirname + '/../modules/connectDB.js');

const tagsData = [
  'HIIT',
  '有氧',
  '心肺',
  '拳擊',
  '格鬥',
  '瑜珈',
  '壺鈴',
  '健力',
  '健美',
  '健體',
  '核心',
  '體能',
  '體態雕塑',
  '增肌',
  '減脂',
  '皮拉提斯',
  '藥球',
  '肌力',
  '耐力',
  '上肢力量',
  '下肢力量',
  '功能性訓練',
  '全身性訓練',
  '專項訓練',
  '傷害預防',
  '伸展',
  '專業建議',
];

(async () => {
  for (let tag of tagsData) {
    const sql = `INSERT INTO c_l_tag(sid, name, created_at) VALUES (NULL, '${tag}', NULL)`;
    const [rows] = await db.query(sql);
    console.log(rows);
  }
  process.exit();
})();
