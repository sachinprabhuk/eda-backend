import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
}
bootstrap();


//////////////////////////////////////////////////////////////
// import { Faculty } from './entities/Faculty.entity';
// const faculty = new Faculty();
// faculty.branch = 'CSE';
// faculty.contact = '1234567890';
// faculty.designation = 5;
// faculty.email = 'someemail@gmail.com';
// faculty.name = 'somename';
// faculty.password = '1234';
// faculty.id = '1234';

// import { createConnection } from 'typeorm';
// import { join } from 'path';
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
//   await connection.getRepository(Faculty).save(faculty);
// })
// .catch(console.log);