
export class VapiBaseService {
  protected apiKey: string;
  protected apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  protected async makeRequest(url: string, method: string, body?: any) {
    console.log(`Making ${method} request to ${url}`);
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Request failed: ${errorText}`);
      throw new Error(`Request failed: ${errorText}`);
    }

    const data = await response.json();
    return data;
  }
}
