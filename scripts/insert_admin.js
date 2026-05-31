const studentModel = require('../database/models/student');
const bcryptjs = require('bcryptjs');

(async () => {
  try {
    const phone = '9425123452';
    const existing = await studentModel.getStudentByPhone(phone);
    if (existing) {
      console.log('Record already exists for phone:', phone);
      console.log(existing);
      process.exit(0);
    }

    const hash = bcryptjs.hashSync('33501', 10);
    const data = {
      name: 'Suraj pal',
      phone: phone,
      password: hash,
      class: 'Class 10th',
      usertype: 'admin'
    };

    const res = await studentModel.createStudent(data);
    console.log('Inserted record:');
    console.log(res);
  } catch (err) {
    console.error('Error inserting admin:', err);
  } finally {
    process.exit(0);
  }
})();
