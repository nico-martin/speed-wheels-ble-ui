// todo: https://twitter.com/nic_o_martin/status/1420279703227744258
// does not work yet

export default class Queue {
  promisequeue: Array<() => Promise<any>>;
  nextToExecute: number;
  nowExecuting: number;
  executed: number;

  constructor() {
    this.promisequeue = [];
    this.nextToExecute = 0;
    this.executed = 0;
  }

  add(promise: () => Promise<any>) {
    this.promisequeue.push(promise);
    //console.log('add');
    this.promisequeue.length >= this.executed && this.executeNext();
  }

  executeNext() {
    if (
      this.promisequeue[this.nextToExecute] &&
      this.nextToExecute !== this.nowExecuting
    ) {
      this.nowExecuting = this.nextToExecute;
      this.promisequeue[this.nextToExecute]()
        .then(() => {
          //console.log('success', this.nextToExecute);
        })
        .catch((e) => {
          //console.log('error', this.nextToExecute, e);
        })
        .finally(() => {
          this.executed++;
          this.nextToExecute++;
          this.executeNext();
        });
    }
  }
}
