
from abc import ABC, abstractmethod

class BaseMemory(ABC):
    """Interfaz agnóstica para cualquier backend de memoria persistente."""

    @abstractmethod
    def save_log(self, agent: str, action: str, status: str, output: str):
        pass

    @abstractmethod
    def save_metric(self, agent: str, metric_name: str, value):
        pass

    @abstractmethod
    def save_reflection(self, agent: str, insight: str):
        pass

    @abstractmethod
    def get_recent_logs(self, agent: str, limit: int = 5):
        pass
