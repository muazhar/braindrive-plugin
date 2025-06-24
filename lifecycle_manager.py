import json
import logging
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
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
        db_result = await self._create_database_records(user_id, db)
        if not db_result['success']:
            return db_result
        logger.info(f"OpenAIPlugin: User installation completed for {user_id}")
        return {
            'success': True,
            'plugin_id': db_result['plugin_id'],
            'modules_created': db_result['modules_created']
        }

    async def _perform_user_uninstallation(self, user_id: str, db: AsyncSession) -> Dict[str, Any]:
        existing_check = await self._check_existing_plugin(user_id, db)
        if not existing_check['exists']:
            return {'success': False, 'error': 'Plugin not found for user'}
        plugin_id = existing_check['plugin_id']
        delete_result = await self._delete_database_records(user_id, plugin_id, db)
        if not delete_result['success']:
            return delete_result
        logger.info(f"OpenAIPlugin: User uninstallation completed for {user_id}")
        return {
            'success': True,
            'plugin_id': plugin_id,
            'deleted_modules': delete_result['deleted_modules']
        }

    async def _check_existing_plugin(self, user_id: str, db: AsyncSession) -> Dict[str, Any]:
        try:
            plugin_query = text("""
            SELECT id, name, version, enabled, created_at, updated_at
            FROM plugin
            WHERE user_id = :user_id AND plugin_slug = :plugin_slug
            """)
            result = await db.execute(plugin_query, {
                'user_id': user_id,
                'plugin_slug': self.plugin_data['plugin_slug']
            })
            plugin_row = result.fetchone()
            if plugin_row:
                return {
                    'exists': True,
                    'plugin_id': plugin_row.id,
                    'plugin_info': {
                        'id': plugin_row.id,
                        'name': plugin_row.name,
                        'version': plugin_row.version,
                        'enabled': plugin_row.enabled,
                        'created_at': plugin_row.created_at,
                        'updated_at': plugin_row.updated_at
                    }
                }
            else:
                return {'exists': False}
        except Exception as e:
            logger.error(f"Error checking existing plugin: {e}")
            return {'exists': False, 'error': str(e)}

    async def _create_database_records(self, user_id: str, db: AsyncSession) -> Dict[str, Any]:
        try:
            current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            plugin_slug = self.plugin_data['plugin_slug']
            plugin_id = f"{user_id}_{plugin_slug}"
            plugin_stmt = text("""
            INSERT INTO plugin
            (id, name, description, version, type, enabled, icon, category, status,
            official, author, last_updated, compatibility, downloads, scope,
            bundle_method, bundle_location, is_local, long_description,
            config_fields, messages, dependencies, created_at, updated_at, user_id,
            plugin_slug, source_type, source_url, update_check_url, last_update_check,
            update_available, latest_version, installation_type, permissions)
            VALUES
            (:id, :name, :description, :version, :type, :enabled, :icon, :category,
            :status, :official, :author, :last_updated, :compatibility, :downloads,
            :scope, :bundle_method, :bundle_location, :is_local, :long_description,
            :config_fields, :messages, :dependencies, :created_at, :updated_at, :user_id,
            :plugin_slug, :source_type, :source_url, :update_check_url, :last_update_check,
            :update_available, :latest_version, :installation_type, :permissions)
            """)
            await db.execute(plugin_stmt, {
                'id': plugin_id,
                'name': self.plugin_data['name'],
                'description': self.plugin_data['description'],
                'version': self.plugin_data['version'],
                'type': self.plugin_data['type'],
                'enabled': True,
                'icon': self.plugin_data['icon'],
                'category': self.plugin_data['category'],
                'status': 'activated',
                'official': self.plugin_data['official'],
                'author': self.plugin_data['author'],
                'last_updated': current_time,
                'compatibility': self.plugin_data['compatibility'],
                'downloads': 0,
                'scope': self.plugin_data['scope'],
                'bundle_method': self.plugin_data['bundle_method'],
                'bundle_location': self.plugin_data['bundle_location'],
                'is_local': self.plugin_data['is_local'],
                'long_description': self.plugin_data['long_description'],
                'config_fields': json.dumps({}),
                'messages': None,
                'dependencies': None,
                'created_at': current_time,
                'updated_at': current_time,
                'user_id': user_id,
                'plugin_slug': plugin_slug,
                'source_type': self.plugin_data['source_type'],
                'source_url': self.plugin_data['source_url'],
                'update_check_url': self.plugin_data['update_check_url'],
                'last_update_check': self.plugin_data['last_update_check'],
                'update_available': self.plugin_data['update_available'],
                'latest_version': self.plugin_data['latest_version'],
                'installation_type': self.plugin_data['installation_type'],
                'permissions': json.dumps(self.plugin_data['permissions'])
            })
            modules_created = []
            for module_data in self.module_data:
                module_id = f"{user_id}_{plugin_slug}_{module_data['name']}"
                module_stmt = text("""
                INSERT INTO module
                (id, plugin_id, name, display_name, description, icon, category,
                enabled, priority, props, config_fields, messages, required_services,
                dependencies, layout, tags, created_at, updated_at, user_id)
                VALUES
                (:id, :plugin_id, :name, :display_name, :description, :icon, :category,
                :enabled, :priority, :props, :config_fields, :messages, :required_services,
                :dependencies, :layout, :tags, :created_at, :updated_at, :user_id)
                """)
                await db.execute(module_stmt, {
                    'id': module_id,
                    'plugin_id': plugin_id,
                    'name': module_data['name'],
                    'display_name': module_data['display_name'],
                    'description': module_data['description'],
                    'icon': module_data['icon'],
                    'category': module_data['category'],
                    'enabled': True,
                    'priority': module_data['priority'],
                    'props': json.dumps(module_data['props']),
                    'config_fields': json.dumps(module_data['config_fields']),
                    'messages': json.dumps(module_data['messages']),
                    'required_services': json.dumps(module_data['required_services']),
                    'dependencies': json.dumps(module_data['dependencies']),
                    'layout': json.dumps(module_data['layout']),
                    'tags': json.dumps(module_data['tags']),
                    'created_at': current_time,
                    'updated_at': current_time,
                    'user_id': user_id
                })
                modules_created.append(module_id)
            await db.commit()
            logger.info(f"Created database records for plugin {plugin_id} with {len(modules_created)} modules")
            return {'success': True, 'plugin_id': plugin_id, 'modules_created': modules_created}
        except Exception as e:
            logger.error(f"Error creating database records: {e}")
            await db.rollback()
            return {'success': False, 'error': str(e)}

    async def _delete_database_records(self, user_id: str, plugin_id: str, db: AsyncSession) -> Dict[str, Any]:
        try:
            module_delete_stmt = text("""
            DELETE FROM module
            WHERE plugin_id = :plugin_id AND user_id = :user_id
            """)
            module_result = await db.execute(module_delete_stmt, {
                'plugin_id': plugin_id,
                'user_id': user_id
            })
            deleted_modules = module_result.rowcount
            plugin_delete_stmt = text("""
            DELETE FROM plugin
            WHERE id = :plugin_id AND user_id = :user_id
            """)
            plugin_result = await db.execute(plugin_delete_stmt, {
                'plugin_id': plugin_id,
                'user_id': user_id
            })
            if plugin_result.rowcount == 0:
                return {'success': False, 'error': 'Plugin not found or not owned by user'}
            await db.commit()
            logger.info(f"Deleted database records for plugin {plugin_id} ({deleted_modules} modules)")
            return {'success': True, 'deleted_modules': deleted_modules}
        except Exception as e:
            logger.error(f"Error deleting database records: {e}")
            await db.rollback()
            return {'success': False, 'error': str(e)}

    async def install_plugin(self, user_id: str, db: AsyncSession) -> Dict[str, Any]:
        try:
            shared_path = self.shared_path
            shared_path.mkdir(parents=True, exist_ok=True)
            result = await self.install_for_user(user_id, db, shared_path)
            return result
        except Exception as e:
            logger.error(f"Plugin installation failed for user {user_id}: {e}")
            return {'success': False, 'error': str(e)}

    async def delete_plugin(self, user_id: str, db: AsyncSession) -> Dict[str, Any]:
        try:
            result = await self.uninstall_for_user(user_id, db)
            return result
        except Exception as e:
            logger.error(f"Plugin deletion failed for user {user_id}: {e}")
            return {'success': False, 'error': str(e)}

    async def get_plugin_status(self, user_id: str, db: AsyncSession) -> Dict[str, Any]:
        try:
            existing_check = await self._check_existing_plugin(user_id, db)
            if not existing_check['exists']:
                return {'exists': False, 'status': 'not_installed'}
            plugin_id = existing_check['plugin_id']
            is_active = user_id in self.active_users
            return {
                'exists': True,
                'status': 'healthy' if is_active else 'inactive',
                'plugin_id': plugin_id,
                'plugin_info': existing_check['plugin_info'],
                'files_exist': True,
                'plugin_directory': str(self.shared_path)
            }
        except Exception as e:
            logger.error(f"Error checking plugin status for user {user_id}: {e}")
            return {'exists': False, 'status': 'error', 'error': str(e)}

    def on_install(self, *args, **kwargs):
        # Add install logic here if needed
        pass

    def on_uninstall(self, *args, **kwargs):
        # Add uninstall logic here if needed
        pass

    def on_update(self, *args, **kwargs):
        # Add update logic here if needed
        pass