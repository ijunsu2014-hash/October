import { Module } from "@nestjs/common";
import { OmokService } from "./omok.service";
import { OmokController } from "./omok.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [OmokController],
  providers: [OmokService],
  exports: [OmokService],
})
export class OmokModule {}
