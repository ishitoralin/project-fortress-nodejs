const db = require(__dirname + '/../modules/connectDB.js');

const categories = [
  {
    name: '瑜珈流動與冥想課程',
    description:
      '這個課程以流動的瑜伽動作和呼吸練習為基礎，融合了力量、靈活性和平衡。透過連貫的動作流，你將提升身體柔軟度、強化肌肉，同時培養身心的平靜和集中力。',
  },
  {
    name: '核心強化與腹肌鍛鍊課程',
    description:
      '這個課程專注於鍛煉和加強核心肌群，包括腹肌、腰部和背部肌肉。透過一系列的練習，你將提升核心穩定性、改善姿勢，同時增強身體的力量和平衡能力。',
  },
  { name: '皮拉提斯體態塑造', description: '' },
  {
    name: '強化肌力與力量提升課程',
    description:
      '這個課程專注於增強全身肌肉力量與最大肌肉力量的提升，尤其幫助對於遇到力量停滯期與PR瓶頸的你提供個人化的課程規劃與課表安排。',
  },
  {
    name: '專業拳擊技巧訓練系列課程',
    description:
      '此系列課程提供全面的拳擊技巧指導，包括拳擊基礎、攻擊和防守、腳步和身體操控，以及戰略和戰術訓練。目標在提高學員的技術、反應速度和身體協調性。',
  },
  {
    name: '握推專項訓練課程',
    description:
      '此系列課程由高專業度的教練帶領，注重握推技巧的精進和細節的修正。透過個別指導和安全的訓練，你將學習到正確的握推技巧與發力模式，改善動作流暢度，讓你的握推能力更上一層樓。',
  },
  {
    name: '肌肥大循環課表訓練課程',
    description:
      '這個課程以肌肉量增加為目標，根據個人的身體能力安排適當的訓練內容，以求最高效率的訓練成效，塑造個人理想中的完美體態與體格。',
  },
  {
    name: '長跑有氧耐力專門課程',
    description:
      '這個課程將專注於長距離跑的訓練和策略。在提高耐力和持久力的同時學習有效的跑步節奏控制與補給策略，以提高跑步效率和競賽表現。',
  },
  {
    name: '硬拉專門訓練課程',
    description:
      '此系列課程由高專業度的教練帶領，專注硬拉技巧提升及動作細節調整。透過一對一的個別指導與訓練規劃，你將學習正確的硬拉技巧，增加力量輸出，降低受傷機率，讓硬舉實力更上層樓。',
  },
  {
    name: '飛輪心肺有氧耐力課程',
    description:
      '這個課程將模擬各類騎行的環境，你能體驗不同到的地形和阻力。透過調整坡度與阻力設定，學員將學習如何調整速度和強度，以增強心肺功能、腿部力量和肌耐力。',
  },
  { name: '靜態拉伸、肌肉放鬆與運動傷害預防課程', description: '' },
  { name: '瑜珈與身體活動度訓練課程', description: '' },
  { name: '壺鈴綜合訓練課程', description: '' },
  { name: '藥球綜合訓練課程', description: '' },
  { name: '女性體態雕塑與健美健體專門訓練', description: '' },
  { name: '個人飲食及訓練專業諮詢規劃', description: '' },
  {
    name: 'HIIT高強度間歇性鍛鍊課程',
    description:
      '透過快速的爆發性運動和短暫的休息間歇，學員將挑戰心肺功能極限，提高心肺耐力和快速恢復的能力，燃燒卡路里，並提升耐力和代謝率。',
  },
  { name: '划船機專項訓練課程', description: '' },
];

(async () => {
  for (let category of categories) {
    const sql = `INSERT INTO c_l_tag(sid, name, created_at) VALUES (NULL, '${category}', NULL)`;
    const [rows] = await db.query(sql);
    console.log(rows);
  }
  process.exit();
})();
