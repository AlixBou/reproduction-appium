import { EnumEvents } from "./EnumEvents";
import uniqueId from "lodash.uniqueid";

type EventCallbacks = Map<string, (data: any) => void>;
type Events = Map<EnumEvents | string, EventCallbacks>;

class EntityEvent {
  private static _instance: EntityEvent;

  private events: Events = new Map();

  private currentSize = 0;

  private timeout?: NodeJS.Timeout;

  public static get instance() {
    if (!this._instance) {
      this._instance = new EntityEvent();
    }

    return this._instance;
  }

  public dispatch(event: EnumEvents | string, data?: any) {
    this.events.get(event)?.forEach((callback) => {
      callback(data);
    });

    this.size();
  }

  public subscribe(
    event: EnumEvents | string,
    callback: (data: any) => void
  ): string {
    if (!this.events.has(event)) {
      this.events.set(event, new Map());
    }

    const events = this.events.get(event) as EventCallbacks;

    let id: string;
    do {
      id = `${uniqueId()}`;
    } while (events.has(id));

    events.set(id, callback);
    this.size();

    return id;
  }

  public unsubscribe(event: EnumEvents | string, id: string) {
    const currentEvent = this.events.get(event);

    if (currentEvent) {
      currentEvent.delete(id);

      if (currentEvent.size === 0) {
        this.remove(event);

        return;
      }
      this.size();
    }
  }

  private remove(event: EnumEvents | string) {
    this.events.delete(event);
    this.size();
  }

  public size() {
    if (this.currentSize === this.events.size) return;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.currentSize = this.events.size;
    }, 500);
  }
}

export default EntityEvent.instance;
