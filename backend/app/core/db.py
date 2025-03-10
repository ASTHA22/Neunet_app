from azure.cosmos import CosmosClient, exceptions
from .config import get_settings
from typing import Optional

settings = get_settings()

class Database:
    def __init__(self):
        self.client = CosmosClient(
            url=settings.COSMOS_ENDPOINT,
            credential=settings.COSMOS_KEY
        )
        self.database = self.client.get_database_client(settings.COSMOS_DATABASE)
        
        # Initialize containers
        self.questionnaire_container = self.database.get_container_client("jobDescriptionQuestionnaire")
        self.applications_container = self.database.get_container_client("applications")

    async def get_questionnaire(self, job_id: str) -> Optional[dict]:
        try:
            query = f"SELECT * FROM c WHERE c.job_id = '{job_id}'"
            items = self.questionnaire_container.query_items(
                query=query,
                enable_cross_partition_query=True
            )
            async for item in items:
                return item
            return None
        except exceptions.CosmosHttpResponseError:
            return None

    async def get_applications(self, job_id: str) -> list:
        try:
            query = f"SELECT * FROM c WHERE c.job_id = '{job_id}'"
            items = self.applications_container.query_items(
                query=query,
                enable_cross_partition_query=True
            )
            return [item async for item in items]
        except exceptions.CosmosHttpResponseError:
            return []

    async def create_questionnaire(self, questionnaire: dict) -> bool:
        try:
            self.questionnaire_container.create_item(body=questionnaire)
            return True
        except exceptions.CosmosHttpResponseError:
            return False

    async def create_application(self, application: dict) -> bool:
        try:
            self.applications_container.create_item(body=application)
            return True
        except exceptions.CosmosHttpResponseError:
            return False

# Create a global database instance
db = Database()
