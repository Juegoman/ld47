import { RIGHT_BOUND, LEFT_BOUND, DEPTH } from "./constants.js";

export default function (x, y, camera, frames) {
    let ray = camera.getPickRay(x, y);
    ray.direction.y *= -1;
    const sorted = [...frames].sort((a, b) => b.floor.z - a.floor.z);

    let hitFrame = 1;
    let found = false;
    let pos = { x: 0, y: 0, z: 0 };
    while (!found) {
        if (hitFrame === DEPTH) {
            return pos;
        }
        let frame = sorted[hitFrame];
        let frameTime = (frame.floor.z - ray.origin.z) / ray.direction.z;
        pos = {
            x: ray.origin.x + ray.direction.x * frameTime,
            y: ray.origin.y + ray.direction.y * frameTime,
            z: frame.floor.z
        }
        if (pos.x < LEFT_BOUND - 10) {
            pos.x = LEFT_BOUND;
            found = true;
        }
        if (pos.x > RIGHT_BOUND + 10) {
            pos.x = RIGHT_BOUND;
            found = true;
        }
        if (pos.y < frame.ceiling.y + 25) {
            pos.y = frame.ceiling.y + 25;
            found = true;
        }
        if (pos.y > frame.floor.y - 25) {
            pos.y = frame.floor.y - 25;
            found = true;
        }
        hitFrame += 1;
    }
    if (pos.z > 600) return { x: 0, y: 0, z: 0 };
    return pos;
}