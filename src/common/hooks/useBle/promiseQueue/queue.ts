import EventEmitter from './eventEmitter';
import { PROMISE_STATES, QueueElementI, QueueElementExecutedI } from './types';

export default class Queue {
  queue: Array<QueueElementI>;
  inProgress: boolean;
  logging: boolean;
  latestId: number;
  executeEvent: EventEmitter<QueueElementExecutedI>;

  constructor(logging: boolean = false) {
    this.logging = logging;
    this.queue = [];
    this.inProgress = false;
    this.latestId = 0;
    this.executeEvent = new EventEmitter();
  }

  log(message?: any, ...optionalParams: any[]): void {
    this.logging && console.log(message, ...optionalParams);
  }

  add<T>(
    promise: () => Promise<T>,
    queueKey: string = 'default',
    emptyQueue: boolean = false
  ): Promise<T> {
    if (!this.queue) {
      this.queue = [];
    }

    this.log('queue before add', this.queue);

    if (emptyQueue) {
      this.queue = this.queue.map((queueElement) => ({
        ...queueElement,
        status:
          queueElement.status === PROMISE_STATES.ADDED &&
          queueElement.queueKey === queueKey
            ? PROMISE_STATES.SKIPPED
            : queueElement.status,
      }));
    }

    this.latestId++;

    const addElement = {
      id: this.latestId,
      promise,
      status: PROMISE_STATES.ADDED,
      queueKey,
    };

    this.queue.push(addElement);

    this.log('queue after add', this.queue);

    !this.inProgress && this.executeNext();

    return new Promise((resolve, reject) => {
      this.executeEvent.on((executedElement) => {
        if (executedElement.id === addElement.id) {
          if (executedElement.status === PROMISE_STATES.FULLFILLED) {
            resolve(executedElement.response);
          } else {
            reject(executedElement.response);
          }
        }
      });
    });
  }

  getNextPromise(): QueueElementI | false {
    const possibleNextElements = this.queue.filter(
      ({ status }) => status === PROMISE_STATES.ADDED
    );

    if (possibleNextElements.length === 0) {
      return false;
    }

    return possibleNextElements.reduce((latestElement, newElement) => {
      if (!latestElement) {
        return newElement;
      }

      if (newElement.id < latestElement.id) {
        return newElement;
      } else {
        return latestElement;
      }
    }, null);
  }

  executeNext() {
    this.inProgress = true;
    const nextPromise = this.getNextPromise();
    if (nextPromise) {
      nextPromise
        .promise()
        .then((r) => {
          this.updateQueueElement(nextPromise.id, {
            status: PROMISE_STATES.FULLFILLED,
          });

          this.executeEvent.dispatch({
            id: nextPromise.id,
            response: r,
            status: PROMISE_STATES.FULLFILLED,
          });
        })
        .catch((e) => {
          this.updateQueueElement(nextPromise.id, {
            status: PROMISE_STATES.REJECTED,
          });

          this.executeEvent.dispatch({
            id: nextPromise.id,
            response: e,
            status: PROMISE_STATES.REJECTED,
          });
        })
        .finally(() => {
          const newNextPromise = this.getNextPromise();
          this.log('queue after execute', this.queue);
          this.log('next Promise after execute', newNextPromise);

          if (newNextPromise) {
            this.executeNext();
          } else {
            this.inProgress = false;
          }
        });
    }
  }

  updateQueueElement(id: number, values: Partial<QueueElementI>) {
    this.queue = this.queue.map((e) => (e.id === id ? { ...e, ...values } : e));
  }
}
