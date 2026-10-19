import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = html.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `找不到 ${name}()`);
  const bodyStart = html.indexOf('{', start);
  let depth = 0;
  for (let index = bodyStart; index < html.length; index++) {
    if (html[index] === '{') depth++;
    if (html[index] === '}') depth--;
    if (depth === 0) return html.slice(start, index + 1);
  }
  throw new Error(`${name}() 结构不完整`);
}

assert.match(html, /id="btn-next" onclick="goNext\(\)"/, '页面缺少“下一步”按钮');
assert.match(html, /btnNext\.disabled = totalSteps < 1/, '初始摆放页没有正确控制“下一步”');
assert.match(html, /btnNext\.disabled = currentStep >= totalSteps - 1/, '最后一步没有禁用“下一步”');

const steps = [
  { moves: [{ pieceIndex: 0, points: [{ x: 10, y: 10 }] }], annotation: '修改后的第一步字幕' },
  { moves: [{ pieceIndex: 1, points: [{ x: 20, y: 20 }] }], annotation: '第二步字幕' },
  { moves: [{ pieceIndex: 2, points: [{ x: 30, y: 30 }] }], annotation: '第三步字幕' }
];
const originalSteps = JSON.stringify(steps);
const calls = [];
const context = {
  isPlaying: false,
  activeMove: null,
  currentStep: 0,
  steps,
  renderPieces: () => calls.push('render'),
  updateUI: () => calls.push('ui')
};
vm.runInNewContext(`${extractFunction('goNext')}\nthis.goNext = goNext;`, context);

context.goNext();
assert.equal(context.currentStep, 1, '应进入已有的下一步');
assert.equal(JSON.stringify(context.steps), originalSteps, '进入下一步不得改写任何步骤');
assert.deepEqual(calls, ['render', 'ui'], '进入下一步后应刷新球场和按钮');

context.currentStep = steps.length - 1;
calls.length = 0;
context.goNext();
assert.equal(context.currentStep, steps.length - 1, '最后一步不应继续前进');
assert.deepEqual(calls, [], '最后一步不应触发无效刷新');

context.currentStep = -1;
context.goNext();
assert.equal(context.currentStep, 0, '从初始摆放页应能进入已有的第一步');
assert.equal(JSON.stringify(context.steps), originalSteps, '从初始摆放页前进也不得改写步骤');

context.currentStep = 0;
context.isPlaying = true;
context.goNext();
assert.equal(context.currentStep, 0, '播放期间不得切换步骤');

console.log('Validated non-destructive next-step navigation.');
