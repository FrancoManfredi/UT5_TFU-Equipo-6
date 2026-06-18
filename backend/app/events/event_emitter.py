from typing import Callable, Dict, List, Any


class EventEmitter:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._subscribers: Dict[str, List[Callable]] = {}
        return cls._instance

    def on(self, event: str, callback: Callable) -> None:
        if event not in self._subscribers:
            self._subscribers[event] = []
        self._subscribers[event].append(callback)

    def off(self, event: str, callback: Callable) -> None:
        if event in self._subscribers:
            self._subscribers[event] = [
                cb for cb in self._subscribers[event] if cb != callback
            ]

    def emit(self, event: str, data: Any = None) -> None:
        for callback in self._subscribers.get(event, []):
            callback(data)


event_emitter = EventEmitter()
