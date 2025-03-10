import os
from typing import List, Dict, Optional
from openai import AzureOpenAI
from ..core.config import get_settings

settings = get_settings()

class ChatService:
    def __init__(self):
        self.client = AzureOpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
        )
        
    async def process_message(self, message: str, job_id: Optional[int] = None, candidate_email: Optional[str] = None) -> Dict:
        """
        Process a chat message using Azure OpenAI
        """
        # Enhance the message with context if provided
        enhanced_message = message
        if job_id:
            enhanced_message = f"For job ID {job_id}: {message}"
        if candidate_email:
            enhanced_message = f"{enhanced_message} (regarding candidate: {candidate_email})"
            
        # Create the system message based on available functions
        system_message = """You are an AI recruitment assistant with access to the following functions:
1. Fetch top candidates by percentage or count
2. Send emails to candidates
3. Update application status
4. Create and manage job descriptions
5. Execute custom SQL queries

When appropriate, suggest these actions to help with recruitment tasks.
"""
        
        # Call Azure OpenAI
        try:
            response = self.client.chat.completions.create(
                model=settings.DEPLOYMENT_NAME,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": enhanced_message}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            content = response.choices[0].message.content
            
            # Extract suggested actions
            suggested_actions = self._extract_suggested_actions(content)
            
            return {
                "response": content,
                "suggested_actions": suggested_actions
            }
            
        except Exception as e:
            # Log the error and return a user-friendly message
            print(f"Error calling Azure OpenAI: {str(e)}")
            return {
                "response": "I apologize, but I encountered an error processing your request. Please try again.",
                "suggested_actions": []
            }
    
    def _extract_suggested_actions(self, content: str) -> List[Dict[str, str]]:
        """
        Extract suggested actions from the response content
        """
        actions = []
        
        # Common action keywords to look for
        action_keywords = {
            "send email": "Would you like me to send an email?",
            "schedule interview": "Should I schedule an interview?",
            "fetch candidates": "Would you like me to fetch candidate details?",
            "update status": "Should I update the candidate's status?",
            "create job": "Would you like me to create a job posting?",
        }
        
        # Check for action keywords in the content
        content_lower = content.lower()
        for keyword, suggestion in action_keywords.items():
            if keyword in content_lower:
                actions.append({
                    "type": keyword,
                    "suggestion": suggestion
                })
        
        return actions

chat_service = ChatService()
