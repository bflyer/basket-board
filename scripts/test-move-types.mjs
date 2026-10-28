import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const expectedTypes = new Map([
  ['run', '无球跑动'],
  ['dribble', '运球突破'],
  ['pass', '传球'],
  ['screen', '挡拆掩护'],
  ['shot', '投篮']
]);

for (const [moveType, label] of expectedTypes) {
  assert.match(html, new RegExp(`data-move-type="${moveType}"[\\s\\S]*?<span>${label}</span>`), `缺少路线工具：${label}`);
}

assert.match(html, /const DEFAULT_MOVE_TYPE = 'run'/, '默认路线必须是无球跑动');
assert.match(html, /activeMove = \{ pieceIndex: dragIdx, moveType: selectedMoveType, points:/,
  '拖动开始时必须保存当前路线类型');
assert.match(html, /function finishStep\(\)[\s\S]*?resetMoveType\(\);[\s\S]*?updateUI\(\);/,
  '完成步骤后必须恢复默认路线类型');
assert.match(html, /moveType: sanitizeMoveType\(move\.moveType/,
  '导入 JSON 时必须校验路线类型');
assert.match(html, /moveType: normalizeMoveType\(move\.moveType\)/,
  '导出 JSON 时必须保存路线类型');
assert.match(html, /drawTrailOnCanvas\(ctx, move\.points,[\s\S]*?move\.moveType\)/,
  '播放和视频画面必须使用已保存的路线类型');

console.log(`Validated ${expectedTypes.size} selectable move types and reset/JSON/playback integration.`);
