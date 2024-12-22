import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokensService } from './tokens.service';
import { TokenSchema } from './schemas/token.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({}), MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }])],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
