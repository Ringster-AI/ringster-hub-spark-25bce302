
import { Twilio } from 'twilio';

export class TwilioService {
  private client: Twilio;

  constructor(accountSid: string, authToken: string) {
    this.client = new Twilio(accountSid, authToken);
  }

  async findAvailableNumber() {
    console.log('Searching for available Twilio numbers');
    const numbers = await this.client.availablePhoneNumbers('US')
      .local.list({ limit: 1 });

    if (!numbers[0]) {
      throw new Error('No phone numbers available');
    }

    console.log(`Found available number: ${numbers[0].phoneNumber}`);
    return numbers[0].phoneNumber;
  }

  async purchaseNumber(phoneNumber: string, webhookUrl: string, smsWebhookUrl: string) {
    console.log(`Attempting to purchase number: ${phoneNumber}`);
    const purchasedNumber = await this.client.incomingPhoneNumbers
      .create({
        phoneNumber,
        voiceUrl: webhookUrl,
        voiceMethod: 'POST',
        smsUrl: smsWebhookUrl,
        smsMethod: 'POST'
      });

    console.log(`Successfully purchased number: ${purchasedNumber.phoneNumber}`);
    return purchasedNumber;
  }

  async releaseNumber(sid: string) {
    console.log(`Attempting to release number with SID: ${sid}`);
    await this.client.incomingPhoneNumbers(sid).remove();
    console.log('Successfully released Twilio number');
  }

  async makeOutboundCall(fromNumber: string, toNumber: string, webhookUrl: string) {
    console.log(`Initiating outbound call from ${fromNumber} to ${toNumber}`);
    console.log(`Using webhook URL: ${webhookUrl}`);

    const call = await this.client.calls.create({
      to: toNumber,
      from: fromNumber,
      url: webhookUrl,
      method: 'POST',
      statusCallback: `${webhookUrl}/status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });
    
    console.log(`Successfully initiated call with SID: ${call.sid}`);
    return call;
  }
}
