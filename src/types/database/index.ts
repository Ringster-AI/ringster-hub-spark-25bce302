import { AuthSchema } from './auth';
import { ProfilesSchema } from './profiles';
import { OrganizationsSchema } from './organizations';
import { SubscriptionsSchema } from './subscriptions';
import { TeamsSchema } from './teams';

export interface Database {
  public: ProfilesSchema['Tables'] & 
          OrganizationsSchema['Tables'] & 
          SubscriptionsSchema['Tables'] & 
          TeamsSchema['Tables']
  auth: AuthSchema
}

export type { Json } from './auth';
export * from './profiles';
export * from './organizations';
export * from './subscriptions';
export * from './teams';