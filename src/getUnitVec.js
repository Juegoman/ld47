export default (origin, target) => {
  const full = { x: target.x - origin.x, y: target.y - origin.y, z: target.z - origin.z };
  const distance = Math.sqrt(full.x**2 + full.y**2 + full.z**2);
  // invert y because we live in clown world
  const direction = { x: full.x / distance, y: -full.y / distance, z: full.z / distance };
  return { origin, direction, target, distance};
}