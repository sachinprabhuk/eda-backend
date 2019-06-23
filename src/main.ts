import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
}
bootstrap();


///////////////////// upload stuff ///////////////////////////
// import { createConnection } from 'typeorm';
// import { join } from 'path';

// import { Slot } from './entities/Slot.entity';
// import { Faculty } from './entities/Faculty.entity';

// const slot1 = new Slot();
// slot1.date = new Date(2018, 8, 12);
// slot1.total_slots = 50;
// slot1.available_slots = 50;
// slot1.type = 'aft';

// const slot2 = new Slot();
// slot2.date = new Date(2018, 8, 12);
// slot2.total_slots = 10;
// slot2.available_slots = 10;
// slot2.type = 'mor';

// createConnection(
//   {
//     name: "default",
//     type: 'mysql',
//     host: 'localhost',
//     port: 3306,
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     entities: [join(__dirname, 'entities', '*.entity.ts')],
//     synchronize: true,
//   }
// ).then(async connection => {
//   const facRepo = await connection.getRepository(Faculty);
//   const fac2 = await facRepo.findOne({ id: '1111' });
//   const fac1 = await facRepo.findOne({ id: '1234' });

//   fac1.selections = [slot1, slot2];
//   fac2.selections = [slot1];
    
//   await facRepo.save(fac1);
//   await facRepo.save(fac2);

//   console.log("done!");
// })
// .catch(console.log);