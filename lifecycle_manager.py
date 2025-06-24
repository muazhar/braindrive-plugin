import os
import logging
from pathlib import Path
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

logger = structlog.get_logger()

# Import the new base lifecycle manager
try:
    from app.plugins.base_lifecycle_manager import BaseLifecycleManager
    logger.info("Using new architecture: BaseLifecycleManager imported from app.plugins")
except ImportError:
    try:
        import sys
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_path = os.path.join(current_dir, "..", "..", "backend", "app", "plugins")
        backend_path = os.path.abspath(backend_path)
        if os.path.exists(backend_path):
            if backend_path not in sys.path:
                sys.path.insert(0, backend_path)
            from base_lifecycle_manager import BaseLifecycleManager
            logger.info(f"Using new architecture: BaseLifecycleManager imported from local backend: {backend_path}")
        else:
            from abc import ABC, abstractmethod
            from datetime import datetime
            from typing import Set
            class BaseLifecycleManager(ABC):
                def __init__(self, plugin_slug: str, version: str, shared_storage_path: Path):
                    self.plugin_slug = plugin_slug
                    self.version = version
                    self.shared_path = shared_storage_path
                    self.active_users: Set[str] = set()
                    self.instance_id = f"{plugin_slug}_{version}"
                    self.created_at = datetime.now()
                    self.last_used = datetime.now()
                @abstractmethod
                async def get_plugin_metadata(self): pass
                @abstractmethod
                async def get_module_metadata(self): pass
                @abstractmethod
                async def _perform_user_installation(self, user_id, db, shared_plugin_path): pass
                @abstractmethod
                async def _perform_user_uninstallation(self, user_id, db): pass
            logger.info("Using minimal BaseLifecycleManager implementation for remote installation")
    except ImportError as e:
        logger.error(f"Failed to import BaseLifecycleManager: {e}")
        raise ImportError("OpenAIPlugin requires the new architecture BaseLifecycleManager")

class OpenAIPluginLifecycleManager(BaseLifecycleManager):
    """Lifecycle manager for OpenAIPlugin using new architecture"""
    def __init__(self, plugins_base_dir: str = None):
        self.plugin_data = {
            "name": "OpenAIPlugin",
            "description": "Integrates OpenAI API for advanced AI features.",
            "version": "1.0.0",
            "type": "frontend",
            "icon": "Extension",
            "category": "AI Tools",
            "official": False,
            "author": "Your Name",
            "compatibility": "1.0.0",
            "scope": "OpenAIPlugin",
            "bundle_method": "webpack",
            "bundle_location": "dist/remoteEntry.js",
            "is_local": True,
            "long_description": "Chat with OpenAI models in BrainDrive.",
            "plugin_slug": "OpenAIPlugin",
            "source_type": "local",
            "source_url": "",
            "update_check_url": "",
            "last_update_check": None,
            "update_available": False,
            "latest_version": None,
            "installation_type": "local",
            "permissions": ["api.post"]
        }
        self.module_data = [
            {
                "name": "OpenAIChat",
                "display_name": "OpenAI Chat",
                "description": "Chat interface powered by OpenAI.",
                "icon": "Chat",
                "category": "AI Tools",
                "priority": 1,
                "props": {},
                "config_fields": {
                    "apiKey": {
                        "type": "string",
                        "description": "OpenAI API Key",
                        "default": ""
                    }
                },
                "messages": {},
                "required_services": {
                    "api": {"methods": ["post"], "version": "1.0.0"}
                },
                "dependencies": [],
                "layout": {
                    "minWidth": 3,
                    "minHeight": 2,
                    "defaultWidth": 6,
                    "defaultHeight": 4
                },
                "tags": ["AI", "OpenAI", "Chat"]
            }
        ]
        if plugins_base_dir:
            shared_path = Path(plugins_base_dir) / "shared" / self.plugin_data['plugin_slug'] / f"v{self.plugin_data['version']}"
        else:
            shared_path = Path(__file__).parent / "dist"
        super().__init__(
            plugin_slug=self.plugin_data['plugin_slug'],
            version=self.plugin_data['version'],
            shared_storage_path=shared_path
        )

    @property
    def PLUGIN_DATA(self):
        return self.plugin_data

    async def get_plugin_metadata(self) -> Dict[str, Any]:
        return self.plugin_data

    async def get_module_metadata(self) -> List[Dict[str, Any]]:
        return self.module_data

    async def _perform_user_installation(self, user_id: str, db: AsyncSession, shared_plugin_path: Path) -> Dict[str, Any]:
        return {"success": True, "plugin_id": self.plugin_slug}

    async def _perform_user_uninstallation(self, user_id: str, db: AsyncSession) -> Dict[str, Any]:
        return {"success": True, "plugin_id": self.plugin_slug}

    def on_install(self, *args, **kwargs):
        # Add install logic here if needed
        pass

    def on_uninstall(self, *args, **kwargs):
        # Add uninstall logic here if needed
        pass

    def on_update(self, *args, **kwargs):
        # Add update logic here if needed
        pass