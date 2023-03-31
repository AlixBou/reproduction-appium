import EntityEvent from "./EntityEvent";
import { AbstractEntityKeyboardEvent } from "./AbstractEntityKeyboardEvent";
import { EnumEvents } from "./EnumEvents";
import { EnumKeyCode } from "./EnumKeyCode";

export type KeyEvent = {
  keyCode: number;
  action: number;
  pressedKey: string;
};

export default abstract class EntityKeyboardEvent extends AbstractEntityKeyboardEvent {
  protected currentKeyCode: EnumKeyCode | null = null;

  private longPressTimeout?: NodeJS.Timeout;

  /**
   * Indicates whether we pressing are a key right now or not
   * Boxes trigger many "keyDown" event if we do a long press. We want to absorb
   * this and do our own longPress mechanism.
   */
  private isPressing = false;

  protected onKeyDownListener(key: string | number) {
    const mappedKeyCode = this.mapKeyCode(key);
    if (mappedKeyCode !== null) {
      console.info(`[KeyboardEvent] Key  has been pressed`);
      this.action();
    } else {
      console.info("[KeyboardEvent] Pressed an unrecognized key ", key);
    }
  }

  protected onKeyUpListener() {
    this.isPressing = false;

    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = undefined;
    }
  }

  /**
   * How the presses work:
   * - We trigger a short press
   * - If key is not released, we wait for a trigger delay
   *   - if delay is done, we trigger a first long press event
   *   - then successive long
   *
   *
   * Examples:
   *
   * Suppose I press a key for 2 seconds, I'll have the following events:
   * 0ms        +500ms   +300ms   +300ms   +300ms
   * SHORT         |  LONG  |  LONG  |  LONG  |  LONG ...
   *
   * If I press it for 400ms
   * 0ms    +400ms
   * SHORT          ... nothing more
   *
   * If I press it for 600ms
   * 0ms    +500ms
   * SHORT        | LONG    ... nothing more
   */
  private action() {
    if (this.isPressing) {
      return;
    }
    this.isPressing = true;

    this.dispatchShortPressEvent();

    this.longPressTimeout = setTimeout(
      () => this.repeatedLongPress(),
      // Initial delay here - this is when we are waiting to know whether we have a long press or not
      500
    );
  }

  private repeatedLongPress() {
    this.dispatchLongPressEvent();

    this.longPressTimeout = setTimeout(
      () => this.repeatedLongPress(),
      // Repeat delay - we are in the long press, and we repeat the action
      150
    );
  }

  private dispatchShortPressEvent() {
    EntityEvent.dispatch(EnumEvents.KEY_DOWN, this.currentKeyCode);
  }

  private dispatchLongPressEvent() {
    console.info(`[KeyboardEvent] Long press for  key has been triggered`);

    EntityEvent.dispatch(EnumEvents.LONG_PRESS, this.currentKeyCode);
  }
}
