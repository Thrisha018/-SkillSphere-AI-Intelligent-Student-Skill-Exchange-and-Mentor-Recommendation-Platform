import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import mongomock
from app.config import settings

logger = logging.getLogger("skillsphere.database")

class Database:
    client = None
    db = None
    is_mock = False

    @classmethod
    def connect(cls):
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
            real_client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            # Trigger server selection check
            real_client.admin.command('ping')
            cls.client = real_client
            cls.db = cls.client[settings.DATABASE_NAME]
            cls.is_mock = False
            logger.info(f"Successfully connected to MongoDB database: {settings.DATABASE_NAME}")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            logger.warning(f"Failed to connect to physical MongoDB at {settings.MONGODB_URL} ({str(e)}). Falling back to in-memory mongomock database.")
            cls.client = mongomock.MongoClient()
            cls.db = cls.client[settings.DATABASE_NAME]
            cls.is_mock = True
            logger.info("Using mongomock in-memory MongoDB engine.")

    @classmethod
    def get_db(cls):
        if cls.db is None:
            cls.connect()
        return cls.db

def get_database():
    return Database.get_db()
