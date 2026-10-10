import { Module } from "@nestjs/common";
import { MatchingService } from "./matching.service";
import { MatchingController } from "./matching.controller";
import { GamesController } from "./games.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [MatchingController, GamesController],
  providers: [MatchingService],
})
export class MatchingModule {}
