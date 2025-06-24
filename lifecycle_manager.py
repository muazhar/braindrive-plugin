from app.plugins.base_lifecycle_manager import BaseLifecycleManager

class OpenAIPluginLifecycleManager(BaseLifecycleManager):
    name = "OpenAIPluginLifecycleManager"
    description = "Lifecycle manager for OpenAI Plugin"

    def on_install(self, *args, **kwargs):
        # Add install logic here if needed
        pass

    def on_uninstall(self, *args, **kwargs):
        # Add uninstall logic here if needed
        pass

    def on_update(self, *args, **kwargs):
        # Add update logic here if needed
        pass