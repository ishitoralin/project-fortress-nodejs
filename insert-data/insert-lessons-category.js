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
  {
    name: '皮拉提斯體態塑造',
    description:
      '本課程旨在提升身體的姿態和塑造曲線美。透過一系列的皮拉提斯運動和專注呼吸的指導，培養核心肌群的力量、改善身體的平衡和柔軟度。這個課程強調身體的對稱性和對體態的敏感度，幫助調整姿勢並鍛鍊深層肌肉。',
  },
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
    name: '臥推專項訓練課程',
    description:
      '此系列課程由高專業度的教練帶領，注重臥推技巧的精進和細節的修正。透過個別指導和安全的訓練，你將學習到正確的臥推技巧與發力模式，改善動作流暢度，讓你的臥推能力更上一層樓。',
  },
  {
    name: '肌肥大循環課表訓練課程',
    description:
      '這個課程以增加肌肉量為目標，根據個人的身體能力安排適宜的課程內容與訓練菜單，以求最高效率的增肌成效，讓你能塑造個人理想中完美的身材與體格。',
  },
  {
    name: '長跑有氧耐力專門課程',
    description:
      '這個課程將專注於長距離跑的訓練和策略，以參加競賽為標準的訓練規格。在提高肌耐力和持久力的同時學習有效的跑步節奏控制與補給策略，以提高跑步效率和競賽表現。',
  },
  {
    name: '硬拉專門訓練課程',
    description:
      '此系列課程由高專業度的教練帶領，專注硬拉技巧提升及動作細節調整。透過一對一的個別指導與訓練規劃學習正確的硬拉技巧，增強最大力量輸出，降低受傷機率，讓你從素人脫離，往職業運動員的方向邁進。',
  },
  {
    name: '飛輪心肺有氧耐力課程',
    description:
      '這個課程將模擬各類騎行的環境，你能體驗不同到的地形和阻力。透過調整坡度與阻力設定，學員將學習如何調整速度和強度，以增強心肺功能、腿部力量和肌耐力。',
  },
  {
    name: '靜態拉伸、肌肉放鬆與運動傷害預防課程',
    description:
      '本課程由具有運動傷害預防與物理治療相關背景的教練進行，提供專業的暖身與伸展相關知識，讓你學習如何以正確的方式從事各項活動，能夠熟悉並理解身體狀態，降低受傷風險。',
  },
  {
    name: '瑜珈與身體活動度訓練課程',
    description:
      '本課程旨在增加學員身體的活動度與伸展範圍，專注於提升身體靈活度和促進整體健康。透過與瑜珈結合的訓練，改善身體姿勢和平衡，增加柔軟度和靈活性，讓您在愉悅的氛圍中享受身心平衡和增強體能的好處。',
  },
  {
    name: '壺鈴綜合訓練課程',
    description:
      '這是以壺鈴為主題設計的系列課程，學員將透過各項壺鈴的訓練動作，鍛煉身體不同部位的肌肉力量與整體協調能力。由只有壺鈴能夠提供的特殊訓練方式，給您不一樣的全新體驗。',
  },
  {
    name: '藥球綜合訓練課程',
    description:
      '這是以藥球為主題設計的系列課程，融合了力量、爆發力和核心訓練，透過動態的擲擊、揮舞和抓握動作，促進身體的力量發展和功能性運動能力。',
  },
  {
    name: '女性體態雕塑與健美健體專門訓練',
    description:
      '專為女性量身打造的訓練課程，旨在塑造女性優雅的體態和健美健體的身材，在提升肌肉力量的同時雕塑曲線與體態。針對腹部核心肌群、臀部等部位的專項訓練，讓您增強體力與提升自信，歡迎所有女性學員加入，共同享受鍛煉的樂趣和成就感。',
  },
  {
    name: '個人飲食及訓練專業諮詢規劃',
    description:
      '依照您的目標、需求和限制，設計一個適合您的個人化計劃。從飲食指導到訓練規劃，我們將提供專業建議和支持，無論您是追求減重、增肌還是提升整體健康，本課程將使您能夠實現最佳的飲食和訓練結果。',
  },
  {
    name: 'HIIT高強度間歇性鍛鍊課程',
    description:
      '透過快速的爆發性運動和短暫的休息間歇，學員將挑戰心肺功能極限，提高心肺耐力和快速恢復的能力，燃燒卡路里，並提升耐力和代謝率。',
  },
  {
    name: '划船機專項訓練課程',
    description:
      '這個課程將教授正確的划船機姿勢和技巧，並結合不同的訓練計畫，幫助學員提升心肺耐力、增強肌肉力量和改善身體的整體協調性。透過有氧和耐力訓練的結合，您將體驗到划船機所帶來的全身運動效果和身心挑戰。',
  },
];

(async () => {
  for (let category of categories) {
    const sql = `INSERT INTO c_l_category(name, description) VALUES ('${category.name}', '${category.description}')`;
    const [rows] = await db.query(sql);
    console.log(rows);
  }
  process.exit();
})();
