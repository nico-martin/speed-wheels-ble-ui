export enum PROMISE_STATES {
  ADDED = 'ADDED',
  FULLFILLED = 'FULLFILLED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  SKIPPED = 'SKIPPED',
}

export interface QueueElementI<T = any> {
  id: number;
  promise: () => Promise<T>;
  status: PROMISE_STATES;
  queueKey: string;
}

export interface QueueElementExecutedI {
  id: number;
  response: any;
  status: PROMISE_STATES;
}
