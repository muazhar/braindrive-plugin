from app.core.user_initializer.base import UserInitializerBase
from app.core.user_initializer.registry import register_initializer

class OpenAIPluginInitializer(UserInitializerBase):
    name = "openai_plugin_initializer"
    description = "Initializes data for OpenAI Plugin"
    priority = 500
    dependencies = ["pages_initializer"]

    async def initialize(self, user_id: str, db, **kwargs) -> bool:
        try:
            # Initialize your plugin's data here (e.g., create default settings)
            return True
        except Exception as e:
            import logging
            logging.error(f"Error initializing OpenAIPlugin: {e}")
            return False

    async def cleanup(self, user_id: str, db, **kwargs) -> bool:
        try:
            # Clean up if initialization fails
            return True
        except Exception as e:
            import logging
            logging.error(f"Error during OpenAIPlugin cleanup: {e}")
            return False

register_initializer(OpenAIPluginInitializer)