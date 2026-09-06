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

    const clickSpy = sinon.stub().resolves();
    const fakeHandle = {
      asLocator: () => ({click: clickSpy}),
      [Symbol.dispose]: () => {},
    };

    page.getElementByUid.resolves(fakeHandle as never);
    page.getAXNodeByUid.returns(undefined);
    page.waitForEventsAfterAction.callsFake(async (action: () => unknown) => {
      await action();
      return {} as never;
    });

    await click.handler(
      {params: {uid: 'target'}, page} as never,
      response as never,
      context as never,
    );

    sinon.assert.calledOnce(clickSpy);
  });
});/**
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

    const clickSpy = sinon.stub().resolves();
    const fakeHandle = {
      asLocator: () => ({click: clickSpy}),
      [Symbol.dispose]: () => {},
    };

    page.getElementByUid.resolves(fakeHandle as never);
    page.getAXNodeByUid.returns(undefined);
    page.waitForEventsAfterAction.callsFake(async (action: () => unknown) => {
      await action();
      return {} as never;
    });

    await click.handler(
      {params: {uid: 'target'}, page} as never,
      response as never,
      context as never,
    );

    sinon.assert.calledOnce(clickSpy);
  });
});
