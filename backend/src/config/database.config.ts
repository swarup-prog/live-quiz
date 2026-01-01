import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => ({
  uri: configService.get<string>('MONGODB_URI'),

  maxPoolSize: 10,
  minPoolSize: 5,

  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,

  retryWrites: true,
  retryReads: true,

  // Authentication
  // authSource: 'admin',
  // auth: {
  //   username: configService.get<string>('MONGODB_USERNAME'),
  //   password: configService.get<string>('MONGODB_PASSWORD'),
  // }
});
