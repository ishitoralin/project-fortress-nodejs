const check_coach_and_lesson_location =
  'SELECT * FROM `c_l_lessons` JOIN c_l_coachs ON c_l_lessons.coach_sid = c_l_coachs.sid WHERE c_l_lessons.location_sid != c_l_coachs.location_sid';

const join_lesson_and_coach_table = `SELECT l.*, c.nickname FROM c_l_lessons l JOIN c_l_coachs c ON l.coach_sid = c.sid`;
