from typing import Set
 
 
class Branch:
    def __init__(self, branch_code: str, location: str, manager_id: str):
        self._branch_code = branch_code
        self._location = location
        self._manager_id = manager_id
        self._staff_ids: Set[str] = set()
 
    @property
    def branch_code(self) -> str:
        return self._branch_code
 
    @property
    def location(self) -> str:
        return self._location
 
    @property
    def manager_id(self) -> str:
        return self._manager_id
 
    @property
    def staff_ids(self) -> Set[str]:
        return set(self._staff_ids)
 
    def add_staff(self, staff_id: str) -> None:
        self._staff_ids.add(staff_id)
 
    def staff_to_manager_ratio(self) -> float:
        return len(self._staff_ids) / 1
 
    def __str__(self) -> str:
        return f"{self._branch_code} - {self._location} (staff: {len(self._staff_ids)})"
