export default class Queue {
  queue: Record<number, Array<() => Promise<any>>>;
  inProgress: boolean;

  constructor() {
    this.queue = [];
    this.inProgress = false;
  }

  add(promise: () => Promise<any>, emptyQueue: boolean = false) {
    if (!this.queue) {
      this.queue = [];
    }

    const priority = emptyQueue ? 0 : 1;
    if (!this.queue[priority]) {
      this.queue[priority] = [];
    }

    this.queue[priority].push(promise);
    !this.inProgress && this.executeNext();
  }

  executeNext() {
    const activeQueue = Math.min.apply(Math, Object.keys(this.queue));
    const indexToExecute = this.queue[activeQueue].length - 1;
    this.inProgress = true;
    this.queue[activeQueue][indexToExecute]()
      .then((e) => {
        //console.log('success', e);
      })
      .catch((e) => {
        //console.log('error', this.nextToExecute, e);
      })
      .finally(() => {
        this.queue[activeQueue] = this.queue[activeQueue].slice(
          indexToExecute + 1
        );

        if (this.queue[activeQueue].length === 0) {
          if (activeQueue === 0) {
            this.queue = [];
          } else {
            delete this.queue[activeQueue];
          }
        }

        if (Object.keys(this.queue).length !== 0) {
          this.executeNext();
        } else {
          this.inProgress = false;
        }
      });
  }
}
