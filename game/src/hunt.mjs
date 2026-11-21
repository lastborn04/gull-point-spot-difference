export function createHunt(differences, { duration = null, hints = 2, now = 0 } = {}) {
  const found = new Set();
  let remainingHints = hints;
  let hinted = null;
  let deadline = duration === null ? null : now + duration;
  let status = 'playing';

  function timeLeft(time) {
    if (deadline === null) return null;
    const remaining = Math.max(0, deadline - time);
    if (remaining === 0 && status === 'playing') status = 'expired';
    return remaining;
  }

  function inspect(side, x, y, time) {
    timeLeft(time);
    if (status !== 'playing') return { kind: 'closed' };

    let nearest;
    let closestDistance = Infinity;
    for (const difference of differences) {
      const area = difference[side];
      const distance = Math.hypot((x - area.x) / area.rx, (y - area.y) / area.ry);
      const edge = area.edgeBounds;
      const insideEdge = edge && x >= edge.left && x <= edge.right && y >= edge.top && y <= edge.bottom;
      if ((distance <= 1 || insideEdge) && distance < closestDistance) {
        closestDistance = distance;
        nearest = difference;
      }
    }

    if (!nearest) {
      if (deadline !== null) deadline -= 4000;
      timeLeft(time);
      return { kind: 'miss' };
    }
    if (found.has(nearest.id)) return { kind: 'repeat', id: nearest.id };

    found.add(nearest.id);
    if (hinted === nearest.id) hinted = null;
    if (found.size === differences.length) status = 'complete';
    return { kind: 'found', id: nearest.id };
  }

  function revealHint(time) {
    timeLeft(time);
    if (status !== 'playing') return null;
    if (hinted !== null) return hinted;
    if (remainingHints === 0) return null;
    const next = differences.find(difference => !found.has(difference.id));
    if (!next) return null;
    remainingHints -= 1;
    hinted = next.id;
    return hinted;
  }

  function snapshot(time) {
    const remainingTime = timeLeft(time);
    return {
      status,
      remainingTime,
      found: [...found],
      remaining: differences.length - found.size,
      remainingHints,
      hinted,
    };
  }

  return { inspect, revealHint, snapshot };
}
