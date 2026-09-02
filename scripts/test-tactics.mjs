import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const tacticsDir = join(projectRoot, 'tactics');
const index = JSON.parse(await readFile(join(tacticsDir, 'index.json'), 'utf8'));
const pieceCount = 11;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validatePoint(point, label) {
  assert(point && Number.isFinite(point.x) && Number.isFinite(point.y), `${label}: 坐标不是有限数字`);
  assert(point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1, `${label}: 坐标超出 0–1`);
}

assert(index.schemaVersion === 2, 'tactics/index.json: 不支持的索引版本');
assert(Array.isArray(index.tactics) && index.tactics.length > 0, 'tactics/index.json: tactics 不能为空');

const ids = new Set();
const categoryCounts = { tactic: 0, exercise: 0 };
for (const entry of index.tactics) {
  assert(entry && typeof entry.id === 'string' && entry.id, '索引项缺少 id');
  assert(typeof entry.file === 'string' && /^[\p{L}\p{N}_-]+\.json$/u.test(entry.file), `${entry.id}: 文件名不安全`);
  assert(!ids.has(entry.id), `${entry.id}: id 重复`);
  ids.add(entry.id);
  assert(entry.category === 'tactic' || entry.category === 'exercise', `${entry.id}: 栏目无效`);
  categoryCounts[entry.category]++;

  const tactic = JSON.parse(await readFile(join(tacticsDir, entry.file), 'utf8'));
  assert(tactic.schemaVersion === 2, `${entry.file}: schemaVersion 必须为 2`);
  assert(tactic.id === entry.id, `${entry.file}: id 与索引不一致`);
  assert(typeof tactic.name === 'string' && tactic.name.trim(), `${entry.file}: 缺少名称`);
  assert(typeof tactic.description === 'string' && tactic.description.trim(), `${entry.file}: 缺少基础描述`);
  assert(tactic.court?.coordinateSystem === 'normalized', `${entry.file}: 必须使用 normalized 坐标`);
  assert(Array.isArray(tactic.court.pieceOrder) && tactic.court.pieceOrder.length === pieceCount, `${entry.file}: pieceOrder 数量错误`);
  assert(Array.isArray(tactic.setupPositions) && tactic.setupPositions.length === pieceCount, `${entry.file}: 初始位置数量错误`);
  tactic.setupPositions.forEach((point, index) => validatePoint(point, `${entry.file} 初始位置 ${index + 1}`));
  assert(Array.isArray(tactic.steps) && tactic.steps.length > 0, `${entry.file}: 至少需要一个步骤`);

  tactic.steps.forEach((step, stepIndex) => {
    assert(typeof step.annotation === 'string' && step.annotation.trim(), `${entry.file} 步骤 ${stepIndex + 1}: 缺少描述`);
    assert(Array.isArray(step.moves) && step.moves.length > 0, `${entry.file} 步骤 ${stepIndex + 1}: 缺少移动`);
    step.moves.forEach((move, moveIndex) => {
      assert(Number.isInteger(move.pieceIndex) && move.pieceIndex >= 0 && move.pieceIndex < pieceCount,
        `${entry.file} 步骤 ${stepIndex + 1} 移动 ${moveIndex + 1}: pieceIndex 无效`);
      assert(Array.isArray(move.points) && move.points.length >= 2,
        `${entry.file} 步骤 ${stepIndex + 1} 移动 ${moveIndex + 1}: 轨迹点不足`);
      move.points.forEach((point, pointIndex) =>
        validatePoint(point, `${entry.file} 步骤 ${stepIndex + 1} 移动 ${moveIndex + 1} 点 ${pointIndex + 1}`)
      );
    });
  });
}

assert(categoryCounts.tactic > 0, '战术区不能为空');
assert(categoryCounts.exercise > 0, '练习区不能为空');
console.log(`Validated ${ids.size} repository items (${categoryCounts.tactic} tactics, ${categoryCounts.exercise} exercises).`);
