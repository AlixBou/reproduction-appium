import { EnumKeyCode } from "./EnumKeyCode";

export abstract class AbstractEntityKeyboardEvent {
  protected abstract currentKeyCode: number | null;

  abstract mapKeyCode(keyCode: string | number): EnumKeyCode | null;

  abstract addEventListener(): void;

  abstract removeEventListener(): void;

  protected abstract onKeyDownListener(key: string | number): void;

  protected abstract onKeyUpListener(): void;
}
