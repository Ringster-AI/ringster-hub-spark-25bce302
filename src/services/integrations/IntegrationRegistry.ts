
import { IntegrationType, IntegrationProvider } from "@/types/integrations";
import { GoogleCalendarProvider } from "./providers/GoogleCalendarProvider";
import { Calendar, Mail, Phone, Users, FileText, BarChart } from "lucide-react";

export class IntegrationRegistry {
  private static providers: Map<string, IntegrationProvider> = new Map();
  private static types: IntegrationType[] = [
    {
      type: 'google_calendar',
      provider: 'google',
      name: 'Google Calendar',
      description: 'Schedule appointments and manage availability through Google Calendar',
      icon: Calendar,
      capabilities: ['calendar', 'scheduling', 'events'],
      configurationSchema: {},
      isAvailable: true
    },
    {
      type: 'google_contacts',
      provider: 'google',
      name: 'Google Contacts',
      description: 'Sync and manage contacts from Google Contacts',
      icon: Users,
      capabilities: ['contacts', 'crm'],
      configurationSchema: {},
      isAvailable: false
    },
    {
      type: 'google_drive',
      provider: 'google',
      name: 'Google Drive',
      description: 'Store and share files through Google Drive',
      icon: FileText,
      capabilities: ['storage', 'files'],
      configurationSchema: {},
      isAvailable: false
    },
    {
      type: 'hubspot_crm',
      provider: 'hubspot',
      name: 'HubSpot CRM',
      description: 'Sync contacts and deals with HubSpot CRM',
      icon: BarChart,
      capabilities: ['crm', 'contacts', 'deals'],
      configurationSchema: {},
      isAvailable: false
    },
    {
      type: 'salesforce_crm',
      provider: 'salesforce',
      name: 'Salesforce CRM',
      description: 'Integrate with Salesforce for contact and opportunity management',
      icon: BarChart,
      capabilities: ['crm', 'contacts', 'opportunities'],
      configurationSchema: {},
      isAvailable: false
    },
    {
      type: 'twilio_sms',
      provider: 'twilio',
      name: 'Twilio SMS',
      description: 'Send SMS messages and notifications via Twilio',
      icon: Phone,
      capabilities: ['sms', 'notifications'],
      configurationSchema: {},
      isAvailable: false
    },
    {
      type: 'sendgrid_email',
      provider: 'sendgrid',
      name: 'SendGrid Email',
      description: 'Send emails and manage email campaigns via SendGrid',
      icon: Mail,
      capabilities: ['email', 'campaigns'],
      configurationSchema: {},
      isAvailable: false
    }
  ];

  static {
    // Register providers
    this.providers.set('google_calendar', new GoogleCalendarProvider());
  }

  static getAvailableTypes(): IntegrationType[] {
    return this.types.filter(type => type.isAvailable);
  }

  static getAllTypes(): IntegrationType[] {
    return this.types;
  }

  static getTypeByKey(type: string): IntegrationType | undefined {
    return this.types.find(t => t.type === type);
  }

  static getProvider(type: string): IntegrationProvider | undefined {
    return this.providers.get(type);
  }

  static registerProvider(type: string, provider: IntegrationProvider): void {
    this.providers.set(type, provider);
    
    // Update the type to be available
    const typeIndex = this.types.findIndex(t => t.type === type);
    if (typeIndex !== -1) {
      this.types[typeIndex].isAvailable = true;
      this.types[typeIndex].configurationSchema = provider.getConfigurationSchema();
    }
  }

  static getProvidersByCapability(capability: string): IntegrationType[] {
    return this.types.filter(type => 
      type.isAvailable && type.capabilities.includes(capability)
    );
  }
}
