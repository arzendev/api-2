import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { RateLimiterInterceptor, RateLimiterModule } from 'nestjs-rate-limiter';
import configuration from './config/configuration';
import { AuditLogger } from './interceptors/audit-log.interceptor';
import { ApiLoggerMiddleware } from './middleware/api-logger.middleware';
import { JsonBodyMiddleware } from './middleware/json-body.middleware';
import { RawBodyMiddleware } from './middleware/raw-body.middleware';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { ApprovedSubnetsModule } from './modules/approved-subnets/approved-subnets.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { AuthModule } from './modules/auth/auth.module';
import { ScopesGuard } from './modules/auth/scope.guard';
import { StaartAuthGuard } from './modules/auth/staart-auth.guard';
import { DomainsModule } from './modules/domains/domains.module';
import { EmailsModule } from './modules/emails/emails.module';
import { GroupsModule } from './modules/groups/groups.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { MultiFactorAuthenticationModule } from './modules/multi-factor-authentication/multi-factor-authentication.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { UsersModule } from './modules/users/users.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AirtableModule } from './providers/airtable/airtable.module';
import { DnsModule } from './providers/dns/dns.module';
import { ElasticSearchModule } from './providers/elasticsearch/elasticsearch.module';
import { GeolocationModule } from './providers/geolocation/geolocation.module';
import { MailModule } from './providers/mail/mail.module';
import { PrismaModule } from './providers/prisma/prisma.module';
import { SlackModule } from './providers/slack/slack.module';
import { TasksModule } from './providers/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    TasksModule,
    UsersModule,
    AuthModule,
    RateLimiterModule.register({
      points: 100,
      duration: 60,
    }),
    MailModule,
    SessionsModule,
    EmailsModule,
    GroupsModule,
    MultiFactorAuthenticationModule,
    ApiKeysModule,
    ApprovedSubnetsModule,
    DomainsModule,
    DnsModule,
    GeolocationModule,
    MembershipsModule,
    StripeModule,
    AuditLogsModule,
    WebhooksModule,
    ElasticSearchModule,
    SlackModule,
    AirtableModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimiterInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: StaartAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ScopesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogger,
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({
        path: '/webhooks/stripe',
        method: RequestMethod.POST,
      })
      .apply(JsonBodyMiddleware)
      .forRoutes('*')
      .apply(ApiLoggerMiddleware)
      .forRoutes('*');
  }
}
