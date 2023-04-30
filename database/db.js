const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL;

const mongoDBconnect = async (req, res) => {
  await mongoose.connect(
      MONGODB_URL,
      {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      },
      (err, resp) => {
          if(resp){
              console.log('DB Connection Successfull....' + resp);
              
          }else if(err){
              console.log('DB Connection Fail....' + err);
          }
      }
  );
}
mongoDBconnect();
