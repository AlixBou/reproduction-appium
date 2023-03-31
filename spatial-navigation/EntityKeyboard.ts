import NativeKeyEvent from "react-native-keyevent";
import EntityKeyboardEvent, { KeyEvent } from "./EntityKeyboardEvent";
import { mapKeyCode } from "./mapKeyCode";

export default class EntityKeyboard extends EntityKeyboardEvent {
  private static _instance: EntityKeyboard;

  public static get instance() {
    if (!this._instance) {
      this._instance = new EntityKeyboard();
    }
    return this._instance;
  }

  public mapKeyCode(keyCode: string | number): number | null {
    this.currentKeyCode = mapKeyCode(keyCode);
    return this.currentKeyCode;
  }

  public addEventListener() {
    NativeKeyEvent.onKeyDownListener(this.listenerKeyDown);
    NativeKeyEvent.onKeyUpListener(this.listenerKeyUp);
    console.log("coucou");
  }

  public removeEventListener() {
    NativeKeyEvent.removeKeyDownListener();
    NativeKeyEvent.removeKeyUpListener();
    this.currentKeyCode = null;
  }

  private listenerKeyDown = (keyEvent: KeyEvent) => {
    console.log("coucou2");
    return this.onKeyDownListener(keyEvent.keyCode);
  };

  private listenerKeyUp = () => this.onKeyUpListener();
}
