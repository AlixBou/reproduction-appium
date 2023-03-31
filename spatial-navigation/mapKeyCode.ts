import { TypeMapKeyCode } from "./TypeMapKeyCode";
import { EnumKeyCode } from "./EnumKeyCode";

export const mapKeyCode: TypeMapKeyCode = (keyCode) => {
  switch (keyCode) {
    case 19:
      return EnumKeyCode.UP;
    case 20:
      return EnumKeyCode.DOWN;
    case 21:
      return EnumKeyCode.LEFT;
    case 22:
      return EnumKeyCode.RIGHT;
    case 23:
    case 66:
      return EnumKeyCode.ENTER;
    case 4:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    default:
      return null;
  }
};
