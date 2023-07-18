const db = require(__dirname + '/../modules/connectDB.js');

const coachs = [
  
];

(async () => {
  for (let coach of coachs) {
    const sql = `INSERT INTO c_l_coachs(member_sid, nickname, img, location, introduction) VALUES (37, '${coach.nickname}', '${coach.img}', '${coach.location}', '${coach.introduction}')`;
    const [rows] = await db.query(sql);
    console.log(rows);
  }
  process.exit();
})();
