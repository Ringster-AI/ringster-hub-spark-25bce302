from fastapi import FastAPI, HTTPException
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from typing import Optional, List
import os
from pydantic import BaseModel
from dotenv import load_dotenv
import random
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from typing import Callable
import uvicorn

# Load environment variables
load_dotenv()

# Initialize Twilio client
client = Client(
    os.getenv('TWILIO_ACCOUNT_SID'),
    os.getenv('TWILIO_AUTH _TOKEN')
)

class PhoneNumberRequest(BaseModel):
    webhook_url: Optional[str] = None  # Make webhook_url optional
    country: Optional[str] = "US"  # US or CA for North America
    toll_free: Optional[bool] = False

class PhoneNumberResponse(BaseModel):
    phone_number: str
    sid: str
    webhook_url: str
    capabilities: dict

async def search_random_number(toll_free: bool = False, country: str = "US") -> str:
    """Search for a random available phone number"""
    try:
        if toll_free:
            # Search for toll-free numbers
            available_numbers = client.available_phone_numbers(country) \
                                    .toll_free \
                                    .list(limit=20)
        else:
            # Search for local numbers with no specific area code
            available_numbers = client.available_phone_numbers(country) \
                                    .local \
                                    .list(limit=20)
        
        if not available_numbers:
            if country == "US":
                # Try Canada if US search yields no results
                return await search_random_number(toll_free, "CA")
            raise HTTPException(
                status_code=404,
                detail="No available numbers found"
            )
        
        # Pick a random number from the available ones
        return random.choice(available_numbers).phone_number
        
    except TwilioRestException as e:
        raise HTTPException(status_code=400, detail=f"Error searching numbers: {str(e)}")

async def purchase_phone_number(phone_number: str, webhook_url: str) -> PhoneNumberResponse:
    """Purchase a specific phone number and configure its webhook"""
    try:
        # Purchase the number
        number = client.incoming_phone_numbers \
                      .create(
                          phone_number=phone_number,
                          voice_url=webhook_url,
                          voice_method='POST'
                      )
        
        return PhoneNumberResponse(
            phone_number=number.phone_number,
            sid=number.sid,
            webhook_url=webhook_url,
            capabilities={
                'voice': number.capabilities.get('voice', False),
                'sms': number.capabilities.get('sms', False),
                'mms': number.capabilities.get('mms', False),
                'fax': number.capabilities.get('fax', False)
            }
        )
    except TwilioRestException as e:
        raise HTTPException(status_code=400, detail=f"Error purchasing number: {str(e)}")

# Custom route class to handle OPTIONS
class CORSRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request):
            if request.method == "OPTIONS":
                return await self.options_response(request)
            return await original_route_handler(request)

        return custom_route_handler

    async def options_response(self, request):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": "true",
            },
        )

app = FastAPI()
# Use the custom route class
app.router.route_class = CORSRoute

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/phone-numbers/purchase/random", response_model=PhoneNumberResponse)
async def purchase_random_number(request: PhoneNumberRequest):
    print("Received request:", request)
    try:
        # Use the WEBHOOK_URL from environment variables
        webhook_url = os.getenv('WEBHOOK_URL')
        if not webhook_url:
            raise HTTPException(status_code=500, detail="WEBHOOK_URL not configured")
            
        # Search for a random available number
        phone_number = await search_random_number(
            toll_free=request.toll_free,
            country=request.country
        )
        
        print(f"Using webhook URL: {webhook_url}")
        
        # Purchase the number
        response = await purchase_phone_number(
            phone_number=phone_number,
            webhook_url=webhook_url
        )
        
        print("Purchase response:", response)
        return response
        
    except HTTPException as e:
        print("HTTP Exception:", e)
        raise e
    except Exception as e:
        print("Unexpected error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/phone-numbers/{number_sid}/webhook")
async def update_webhook(number_sid: str, webhook_url: str):
    """Update the webhook URL for an existing phone number"""
    try:
        number = client.incoming_phone_numbers(number_sid).update(
            voice_url=webhook_url,
            voice_method='POST'
        )
        
        return {
            "phone_number": number.phone_number,
            "sid": number.sid,
            "webhook_url": webhook_url,
            "capabilities": {
                'voice': number.capabilities.get('voice', False),
                'sms': number.capabilities.get('sms', False),
                'mms': number.capabilities.get('mms', False),
                'fax': number.capabilities.get('fax', False)
            }
        }
    except TwilioRestException as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/phone-numbers/{number_sid}")
async def release_number(number_sid: str):
    """Release/delete a phone number"""
    try:
        client.incoming_phone_numbers(number_sid).delete()
        return {"message": f"Successfully released number with SID: {number_sid}"}
    except TwilioRestException as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)