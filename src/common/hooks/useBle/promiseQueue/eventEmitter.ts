let instances = 0;
const EVENT_KEY = 'nm-event-emitter';

export default class EventEmitter<T> {
  key: string;

  constructor() {
    instances++;
    this.key = `${EVENT_KEY}-${instances}`;
  }

  on(callback: (data: T) => void) {
    document.addEventListener(this.key, ({ detail }: CustomEvent<T>) => {
      callback(detail);
    });
  }

  dispatch(data: T) {
    const event = new CustomEvent(this.key, {
      detail: data,
    });

    document.dispatchEvent(event);
  }
}
