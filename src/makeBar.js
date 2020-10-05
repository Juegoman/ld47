export default function (percentage) {
  if (percentage === 0) return '';
  const number = Math.floor(percentage * 74);
  if (number === 0) return '█';
  return [...Array(number)].map(() => '█').join('');
}