// returns a random number between min and max (both included)
export default function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}