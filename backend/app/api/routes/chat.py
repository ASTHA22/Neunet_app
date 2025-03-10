from fastapi import APIRouter, HTTPException
from ...models.chat import ChatRequest, ChatResponse
from ...services.chat import chat_service

router = APIRouter()

@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message to the chat system and get a response
    """
    try:
        # Get the last message from the conversation
        last_message = request.messages[-1] if request.messages else None
        if not last_message:
            raise HTTPException(status_code=400, detail="No message provided")
        
        # Process the message
        result = await chat_service.process_message(
            message=last_message.content,
            job_id=request.job_id,
            candidate_email=request.candidate_email
        )
        
        return ChatResponse(
            response=result["response"],
            suggested_actions=result["suggested_actions"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
