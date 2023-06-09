function checkStringLength(string, length) {
  return string.length <= length;
}

function isPalindrome(string) {
  const normalizedString = string.toLowerCase().replaceAll(' ', '');
  const reversedString = [...normalizedString].reverse().join('');

  return normalizedString === reversedString;
}

function getNumsgitFromStr(text) {
  const result = typeof(text) === 'number' ? String(text) : text.replaceAll(' ', '');

  return result.replace(/\D/g, '') || NaN;
}
