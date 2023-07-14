const db = require(__dirname + '/../modules/connectDB.js');

const coachs = [
  {
    nickname: 'Lily',
    img: 'lily.jpg',
    location: 1,
    introduction:
      '嗨，大家好！我是Lily，一位充滿活力和熱情的女性健身教練。我擁有多年的運動經驗和專業培訓，致力於幫助女性實現健康和健美的目標。透過定制的運動計劃和營養指導，我希望每位學員都能發現自己的潛力，並在健身旅程中取得驚人的成就！',
  },
  {
    nickname: 'Sonia',
    img: 'sonia.jpg',
    location: 1,
    introduction:
      '大家好！我是Sonia，一位熱愛挑戰的女性健身教練。我的教學風格融合了瑜珈和高強度訓練，致力於提升學生的力量和耐力。透過靜坐冥想和有氧運動，我鼓勵學生們超越舒適區，發現自己的潛力，並達到身心的完美平衡。',
  },
  {
    nickname: 'Sophia',
    img: 'sophia.jpg',
    location: 2,
    introduction:
      '大家好，我是Sophia，一位專業的女性健身教練。我相信健身不僅僅是改變身體，更是改變生活的過程。我以鼓勵和激勵為基礎，幫助我的學員建立強健的身體和積極的心態。我熱愛挑戰和持續學習，致力於與每位學員攜手並肩，實現他們的健康目標。讓我們一起追求健康的生活方式吧！',
  },
  {
    nickname: 'Jessica',
    img: 'jessica.jpg',
    location: 2,
    introduction:
      '大家好，我是Jessica，一位熱愛挑戰的女性健身教練。我專精於皮拉提斯，以強化核心和改善靈活度為主要目標。我的訓練課程結合了高強度的有氧運動和精確的身體控制動作，帶領學員們達到全面的健康與健身效果。讓我們一起追求健康活力的生活吧！',
  },
  {
    nickname: 'Emily',
    img: 'emily.jpg',
    location: 3,
    introduction:
      '嗨！我是Emily，一位充滿活力的女性健身教練。以瑜珈為基礎，我專注於幫助學生提高靈活性和身心平衡。透過動態流動的動作和深呼吸，我帶領學生們體驗身心的和諧，並在愉快的環境中找到內在的力量和自信。',
  },
  {
    nickname: 'Ella',
    img: 'ella.jpg',
    location: 3,
    introduction:
      '嗨，大家好！我是Ella，一位對皮拉提斯熱愛的女性健身教練。我的訓練風格融合了舞蹈的優雅和力量訓練的效果，致力於幫助每個學員改善體態和核心力量。透過我的指導，您將獲得更強健的身體和平衡的心靈。',
  },
];

(async () => {
  for (let category of coachs) {
    const sql = `INSERT INTO c_l_category(name, description) VALUES ('${category.name}', '${category.description}')`;
    const [rows] = await db.query(sql);
    console.log(rows);
  }
  process.exit();
})();
