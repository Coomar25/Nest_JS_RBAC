import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { configCredentials } from 'src/config/config';
import { JwtSocketStrategy } from './strategy/socket.strategy';
import { GoogleStrategy } from './strategy/goole.strategy';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: configCredentials.JWTSECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    JwtSocketStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
