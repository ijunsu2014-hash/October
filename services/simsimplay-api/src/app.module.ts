import { Module } from "@nestjs/common";
import { ServicesModule } from "./services/services.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { OmokModule } from "./omok/omok.module";
import { MatchingModule } from "./matching/matching.module";
import { ProfileModule } from "./profile/profile.module";
import { RealtimeGateway } from "./realtime/realtime.gateway";

@Module({
  imports: [ServicesModule, AuthModule, HealthModule, OmokModule, MatchingModule, ProfileModule],
  providers: [RealtimeGateway],
})
export class AppModule {}
