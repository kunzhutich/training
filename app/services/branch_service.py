from typing import List

from app.models.branch import Branch
from app.models.exceptions import BranchNotFoundError, DuplicateBranchCodeError
from app.repositories.branch_repository import BranchRepository


class BranchService:
    def __init__(self, branch_repo: BranchRepository) -> None:
        self._branch_repo = branch_repo

    def create_branch(self, branch_code: str, name: str) -> Branch:
        if self._branch_repo.get(branch_code) is not None:
            raise DuplicateBranchCodeError(f"Branch code '{branch_code}' is already registered.")
        branch = Branch(branch_code=branch_code, name=name)
        self._branch_repo.add(branch)
        return branch

    def list_branches(self) -> List[Branch]:
        return self._branch_repo.list_all()

    def get_branch(self, branch_code: str) -> Branch:
        branch = self._branch_repo.get(branch_code)
        if branch is None:
            raise BranchNotFoundError(f"No branch with code {branch_code}.")
        return branch
