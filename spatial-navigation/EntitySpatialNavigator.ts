import { Directions, Lrud } from "lrud";
import EntityEvent from "./EntityEvent";
import { EnumEvents } from "./EnumEvents";
import { EnumKeyCode } from "./EnumKeyCode";
import { LockReason } from "./types/SpatialNavigatorLockReasons";

type EntitySpatialNavigatorConstructor = {
  onLeftAndNoMove?: () => void;
  onRightAndNoMove?: () => void;
};

/**
 * EntitySpatialNavigator is the navigation manager.
 * Controller/Keyboard events are listened by the EntityKeyboard which dispatches KEY_DOWN or LONG_PRESS events.
 *
 * EntitySpatialNavigator instances are created by the Page component which needs to be used on each pages. */
export default class EntitySpatialNavigator {
  private eventSubscriptionIds = {
    [EnumEvents.KEY_DOWN]: ``,
    [EnumEvents.LONG_PRESS]: ``,
  };

  private lrud: Lrud;

  private onLeftAndNoMove: (() => void) | undefined;

  private onRightAndNoMove: (() => void) | undefined;

  constructor({
    onLeftAndNoMove,
    onRightAndNoMove,
  }: EntitySpatialNavigatorConstructor) {
    this.lrud = new Lrud();
    this.onLeftAndNoMove = onLeftAndNoMove;
    this.onRightAndNoMove = onRightAndNoMove;
  }

  /** Handles key events for LRUD
   *
   * @returns true if focus did change, false otherwise */
  private handleKeyEventForLRUD(direction: Directions) {
    const before = this.lrud.currentFocusNode;
    this.lrud.handleKeyEvent({ direction }, { forceFocus: true });
    const after = this.lrud.currentFocusNode;

    return before !== after;
  }

  public registerNode(
    ...[nodeID, nodeConfig]: Parameters<Lrud["registerNode"]>
  ) {
    try {
      this.lrud.registerNode(nodeID, nodeConfig);
    } catch (e) {
      console.error(e);
    }
  }

  public unregisterNode(
    ...[nodeID, nodeConfig]: Parameters<Lrud["unregisterNode"]>
  ) {
    this.lrud.unregisterNode(nodeID, nodeConfig);
  }

  private get hasRootNode(): boolean {
    try {
      this.lrud.getRootNode();
      return true;
    } catch (e) {
      console.warn(
        "[EntitySpatialNavigator] No registered node on this page. Please use the <Page /> component."
      );
      return false;
    }
  }

  private async handleKeyDown({ keycode }: { keycode: number }) {
    if (this.isLocked) return;

    if (!this.hasRootNode) return;

    if (keycode === EnumKeyCode.LEFT) {
      const didFocusChange = this.handleKeyEventForLRUD(Directions.LEFT);
      if (this.onLeftAndNoMove && !didFocusChange) this.onLeftAndNoMove();
    }
    if (keycode === EnumKeyCode.RIGHT) {
      const didFocusChange = this.handleKeyEventForLRUD(Directions.RIGHT);
      if (this.onRightAndNoMove && !didFocusChange) this.onRightAndNoMove();
    }

    if (keycode === EnumKeyCode.UP) this.handleKeyEventForLRUD(Directions.UP);
    if (keycode === EnumKeyCode.DOWN)
      this.handleKeyEventForLRUD(Directions.DOWN);
    if (keycode === EnumKeyCode.ENTER)
      this.handleKeyEventForLRUD(Directions.ENTER);
  }

  private handleLongPress(keycode: number) {
    if (
      keycode === EnumKeyCode.RIGHT ||
      keycode === EnumKeyCode.LEFT ||
      keycode === EnumKeyCode.UP ||
      keycode === EnumKeyCode.DOWN
    ) {
      return this.handleKeyDown({ keycode });
    }
  }

  public subscribe() {
    this.eventSubscriptionIds[EnumEvents.KEY_DOWN] = EntityEvent.subscribe(
      EnumEvents.KEY_DOWN,
      (keycode: number) => this.handleKeyDown({ keycode })
    );
    this.eventSubscriptionIds[EnumEvents.LONG_PRESS] = EntityEvent.subscribe(
      EnumEvents.LONG_PRESS,
      (keyCode: number) => this.handleLongPress(keyCode)
    );
  }

  public unsubscribe() {
    EntityEvent.unsubscribe(
      EnumEvents.KEY_DOWN,
      this.eventSubscriptionIds[EnumEvents.KEY_DOWN]
    );
    EntityEvent.unsubscribe(
      EnumEvents.LONG_PRESS,
      this.eventSubscriptionIds[EnumEvents.LONG_PRESS]
    );
  }

  private currentLockReasonsSet: Set<LockReason> = new Set();

  private get isLocked() {
    return this.currentLockReasonsSet.size > 0;
  }

  public lock(lockReason: LockReason) {
    if (this.currentLockReasonsSet.has(lockReason)) {
      console.warn(
        "You tried to lock the SpatialNavigator with a lockReason that is already locking it"
      );
    } else {
      this.currentLockReasonsSet.add(lockReason);
    }
  }

  public unlock(lockReason: LockReason) {
    this.currentLockReasonsSet.delete(lockReason);
  }
}
