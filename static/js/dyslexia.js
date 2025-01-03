function getTextNodes(node) {
  const textNodes = [];

  if (node.nodeType === Node.TEXT_NODE) {
    textNodes.push(node);
    return textNodes;
  }

  node.childNodes.forEach((child) => {
    textNodes.push(...getTextNodes(child));
  });

  return textNodes;
}

function dyslexifyString(str) {
  if (str.length < 4) {
    return str;
  }

  const strArr = str.split('');

  const index1 = Math.floor(Math.random() * (str.length / 2 - 1)) + 1;
  const temp1 = strArr[index1];
  strArr[index1] = strArr[index1 + 1];
  strArr[index1 + 1] = temp1;

  if (str.length < 6) {
    return strArr.join('');
  }

  const index2 = Math.floor(Math.random() * (str.length / 2 - 1)) + 1 + Math.floor(str.length / 2);
  const temp2 = strArr[index2];
  strArr[index2] = strArr[index2 + 1];
  strArr[index2 + 1] = temp2;

  return strArr.join('');
}

function dyslexifyPage(baseNode = undefined) {
  const textNodes = getTextNodes(baseNode ?? document.body);

  textNodes.forEach((node) => {
    const words = node.nodeValue.split(' ');
    const mappedWords = words.map(dyslexifyString);

    node.nodeValue = mappedWords.join(' ');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  dyslexifyPage();
});

document.addEventListener('DOMNodeInserted', (event) => {
  dyslexifyPage(event.target);
});