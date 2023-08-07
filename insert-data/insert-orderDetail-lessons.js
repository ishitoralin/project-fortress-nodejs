const insertEnrolledLesson = async () => {
  const sql = `INSERT INTO order_detail(order_sid, member_sid, products_type_sid, item_sid, quantity, created_at) VALUES ('?','?','?','?','?', NOW())`;
  const order_sid = () => Math.ceil(Math.random() * 500);
  const member_sid = 5;
  const products_type_sid = 4;
  const item_sid = () => Math.ceil(Math.random() * 296);
  const quantity = () => Math.ceil(Math.random() * 5);
  let i = 0;
  while (i < 300) {
    await db.query(sql, [
      order_sid(),
      member_sid,
      products_type_sid,
      item_sid(),
      quantity(),
    ]);
    i++;
  }
};

// SELECT * FROM `order_detail` WHERE item_sid in (SELECT sid FROM c_l_lessons WHERE capacity = 1);

// SELECT * FROM (SELECT item_sid as lesson_sid, SUM(quantity) as count, c_l_lessons.capacity FROM order_detail JOIN c_l_lessons ON order_detail.item_sid = c_l_lessons.sid WHERE products_type_sid = 4 GROUP BY item_sid) as newtable WHERE capacity <= count;
