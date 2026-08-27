from dataclasses import dataclass


@dataclass
class Admin:
    id: str
    username: str
    password_hash: str
    full_name: str
