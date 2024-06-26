import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { configCredentials } from 'src/config/config';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    JwtModule.register({
      secret: configCredentials.JWTSECRET,
      signOptions: { expiresIn: '1h' },
    }),
    EmailModule,
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
