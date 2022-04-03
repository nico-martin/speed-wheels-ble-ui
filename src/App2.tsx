import React from 'react';
import ReactDOM from 'react-dom';
import PromiseQueue, { QUEUE_TYPES } from '@common/hooks/useBle/promiseQueue';

const bleQueue = new PromiseQueue(QUEUE_TYPES.ONLY_LAST, true);

const p = (payload: any = true): Promise<any> =>
  new Promise((resolve, reject) =>
    window.setTimeout(() => resolve(payload), 2000)
  );

ReactDOM.render(
  <React.Fragment>
    <button
      onClick={() =>
        bleQueue.add(() => p('test').then((e) => console.log('DONE', e)))
      }
    >
      add to queue
    </button>
    <br />
    <button onClick={() => bleQueue.add(() => p(), true)}>
      add to queue as last
    </button>
  </React.Fragment>,
  document.querySelector('#app')
);
