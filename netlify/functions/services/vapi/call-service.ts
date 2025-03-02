
import { VapiBaseService } from './base-service';

export class VapiCallService extends VapiBaseService {
  async getCallTranscript(callId: string) {
    console.log(`Retrieving transcript for call: ${callId}`);
    
    const data = await this.makeRequest(`https://api.vapi.ai/call/${callId}/transcript`, 'GET');
    console.log('Successfully retrieved call transcript');
    return data;
  }

  async getCallRecording(callId: string) {
    console.log(`Retrieving recording for call: ${callId}`);
    
    const data = await this.makeRequest(`https://api.vapi.ai/call/${callId}/recording`, 'GET');
    console.log('Successfully retrieved call recording URL');
    return data;
  }
}
