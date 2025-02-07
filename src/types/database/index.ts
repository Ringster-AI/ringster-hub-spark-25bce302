
import { AuthSchema } from './auth';
import { ProfilesSchema } from './profiles';
import { OrganizationsSchema } from './organizations';
import { SubscriptionsSchema } from './subscriptions';
import { TeamsSchema } from './teams';
import { AgentsSchema } from './agents';
import { CallLogsSchema } from './call-logs';
import { UsageSummarySchema } from './usage-summary';
import { CampaignsSchema } from './campaigns';

export interface Database {
  public: ProfilesSchema['Tables'] & 
          OrganizationsSchema['Tables'] & 
          SubscriptionsSchema['Tables'] & 
          TeamsSchema['Tables'] &
          AgentsSchema['Tables'] &
          CallLogsSchema['Tables'] &
          UsageSummarySchema['Tables'] &
          CampaignsSchema['Tables']
  auth: AuthSchema
}

export type { Json } from './auth';
export * from './profiles';
export * from './organizations';
export * from './subscriptions';
export * from './teams';
export * from './agents';
export * from './call-logs';
export * from './usage-summary';
export * from './campaigns';
