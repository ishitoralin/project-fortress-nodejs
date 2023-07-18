const db = require(__dirname + '/../modules/connectDB.js');

// const schema = {
//   category_sid: 0,
//   name: '',
//   location_sid: 0,
//   coach_sid: 0,
//   time: 'yyyy/mm/dd hh:mm:ss',
//   period: 'hh:mm:ss',
//   price: 0,
//   capacity: 0,
// };

// search certain time sql syntax: SELECT * FROM `c_l_lessons` WHERE TIME(time) BETWEEN '19:30:00' AND '21:00:00';

// search coachs with no lesson: SELECT * FROM `c_l_coachs` WHERE sid NOT IN(SELECT coach_sid FROM c_l_lessons WHERE 1);

const lessons = [
  {
    category_sid: 18,
    name: '划船機專項訓練課程',
    location_sid: 3,
    coach_sid: 20,
    time: '2023/8/21 19:00:00',
    period: '01:00:00',
    price: 550,
    capacity: 10,
  },
  {
    category_sid: 18,
    name: '划船機專項訓練課程',
    location_sid: 3,
    coach_sid: 20,
    time: '2023/8/23 19:00:00',
    period: '01:00:00',
    price: 550,
    capacity: 10,
  },
  {
    category_sid: 18,
    name: '划船機專項訓練課程',
    location_sid: 3,
    coach_sid: 20,
    time: '2023/8/28 19:00:00',
    period: '01:00:00',
    price: 550,
    capacity: 10,
  },
  {
    category_sid: 18,
    name: '划船機專項訓練課程',
    location_sid: 3,
    coach_sid: 20,
    time: '2023/8/30 19:00:00',
    period: '01:00:00',
    price: 550,
    capacity: 10,
  },
  {
    category_sid: 18,
    name: '划船機專項訓練課程',
    location_sid: 3,
    coach_sid: 20,
    time: '2023/9/4 19:00:00',
    period: '01:00:00',
    price: 550,
    capacity: 10,
  },
  {
    category_sid: 18,
    name: '划船機專項訓練課程',
    location_sid: 3,
    coach_sid: 20,
    time: '2023/9/6 19:00:00',
    period: '01:00:00',
    price: 550,
    capacity: 10,
  },
];

(async () => {
  for (let lesson of lessons) {
    const sql = `INSERT INTO c_l_lessons(category_sid, name, location_sid, coach_sid, time, period, price, capacity) VALUES ('${lesson.category_sid}','${lesson.name}','${lesson.location_sid}','${lesson.coach_sid}','${lesson.time}','${lesson.period}','${lesson.price}','${lesson.capacity}')`;

    const [rows] = await db.query(sql);

    console.log(rows);
  }
  process.exit();
})();
