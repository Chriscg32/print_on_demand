from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class DocumentEvent:
    event_type: str
    payload: Dict
    timestamp: str

class DocumentEventHandler:
    def __init__(self):
        self.events: List[DocumentEvent] = []
        
    def process_event(self, event: DocumentEvent) -> bool:
        """Process individual events with reduced complexity"""
        if not self._validate_event(event):
            return False
            
        return self._handle_event_type(event)
    
    def _validate_event(self, event: DocumentEvent) -> bool:
        """Validate event structure"""
        return bool(event.event_type and event.payload)
    
    def _handle_event_type(self, event: DocumentEvent) -> bool:
        """Handle different event types"""
        handlers = {
            'create': self._handle_create,
            'update': self._handle_update,
            'delete': self._handle_delete
        }
        handler = handlers.get(event.event_type)
        return handler(event) if handler else False
    
    def _handle_create(self, event: DocumentEvent) -> bool:
        self.events.append(event)
        return True
        
    def _handle_update(self, event: DocumentEvent) -> bool:
        self.events.append(event)
        return True
        
    def _handle_delete(self, event: DocumentEvent) -> bool:
        self.events.append(event)
        return True
