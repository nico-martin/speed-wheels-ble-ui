const PROMISE_EVENT_NAME = 'promise-executed';

/**
 * TODO: maybe some refactoring with the CustomEvent syntax?
 */

enum PROMISE_STATES {
  ADDED = 'ADDED',
  FULLFILLED = 'FULLFILLED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  SKIPPED = 'SKIPPED',
}

export enum QUEUE_TYPES {
  ONLY_LAST = 'ONLY_LAST',
  SEQUENCE = 'SQUENCE',
}

interface QueueElementI {
  id: number;
  promise: () => Promise<any>;
  status: PROMISE_STATES;
}

interface QueueElementExecutedI {
  id: number;
  response: any;
  status: PROMISE_STATES;
}

export default class Queue {
  queue: Array<QueueElementI>;
  inProgress: boolean;
  logging: boolean;
  latestId: number;
  type: QUEUE_TYPES;

  constructor(
    type: QUEUE_TYPES = QUEUE_TYPES.SEQUENCE,
    logging: boolean = false
  ) {
    this.logging = logging;
    this.queue = [];
    this.inProgress = false;
    this.latestId = 0;
    this.type = type;
  }

  log(message?: any, ...optionalParams: any[]): void {
    this.logging && console.log(message, ...optionalParams);
  }

  executeDispatch(data: QueueElementExecutedI) {
    const event = new CustomEvent(PROMISE_EVENT_NAME, {
      detail: data,
    });

    document.dispatchEvent(event);
  }

  executeOn(callback: (data: QueueElementExecutedI) => void) {
    // @ts-ignore
    document.addEventListener(PROMISE_EVENT_NAME, (e) => callback(e.detail));
  }

  add(promise: () => Promise<any>, emptyQueue: boolean = false) {
    if (!this.queue) {
      this.queue = [];
    }

    if (emptyQueue) {
      this.queue = this.queue.map((queueElement) => ({
        ...queueElement,
        status:
          queueElement.status === PROMISE_STATES.ADDED
            ? PROMISE_STATES.SKIPPED
            : queueElement.status,
      }));
    }

    this.latestId++;

    const addElement = {
      id: this.latestId,
      promise,
      status: PROMISE_STATES.ADDED,
    };

    this.queue.push(addElement);

    this.log('queue after add', this.queue);

    !this.inProgress && this.executeNext();

    return new Promise((resolve, reject) => {
      this.executeOn((executedElement) => {
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

      if (this.type === QUEUE_TYPES.ONLY_LAST) {
        if (newElement.id > latestElement.id) {
          return newElement;
        } else {
          this.updateQueueElement(newElement.id, {
            status: PROMISE_STATES.SKIPPED,
          });

          return latestElement;
        }
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

          this.executeDispatch({
            id: nextPromise.id,
            response: r,
            status: PROMISE_STATES.FULLFILLED,
          });
        })
        .catch((e) => {
          this.updateQueueElement(nextPromise.id, {
            status: PROMISE_STATES.REJECTED,
          });

          this.executeDispatch({
            id: nextPromise.id,
            response: e,
            status: PROMISE_STATES.REJECTED,
          });
        })
        .finally(() => {
          this.log('queue after execute', this.queue);

          if (this.getNextPromise()) {
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
