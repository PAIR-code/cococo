import engine from './engine';
import undo from './undo';

class KeyboardManager {
  constructor() {
    document.addEventListener('keypress', this.handleKeyPress);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'z' && e.metaKey && !e.shiftKey) {
      undo.undo();
    } else if (e.key === 'z' && e.metaKey && e.shiftKey) {
      undo.redo();
    }
  };

  handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      engine.togglePlay();
    }
  };
}

export default new KeyboardManager();
