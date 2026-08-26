import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

load_dotenv()

_MONGODB_URI = os.getenv("MONGODB_URI")
_MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "bank_app")

if not _MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set. Add it to a .env file at the project root.")

_client: MongoClient = MongoClient(_MONGODB_URI)
_database: Database = _client[_MONGODB_DB_NAME]


def get_database() -> Database:
    return _database
