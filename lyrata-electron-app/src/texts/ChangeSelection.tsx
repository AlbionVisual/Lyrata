export interface BlockedDataInterface {
  tagName: string;
  selectionPos?: number[];
  text: string;
}

export function changeSelection(
  amount: number,
  blockedData: BlockedDataInterface[],
  position: number,
  selectionSize: number
): number {
  if (!position) {
    // Если по какой-то причине нету id текущего блока
    position = 0;
  }
  let currentBlock = blockedData[position];

  if (!currentBlock.selectionPos) {
    // Если в нашем блоке ещё не установлен выделитель (либо мы только перекинулись на этот блок)
    if (amount > 0)
      currentBlock.selectionPos = [
        0,
        blockedData[position].text.length > selectionSize
          ? selectionSize
          : blockedData[position].text.length,
      ];
    else if (amount < 0)
      currentBlock.selectionPos = [
        blockedData[position].text.length - selectionSize < 0
          ? 0
          : blockedData[position].text.length - selectionSize,
        blockedData[position].text.length,
      ];
    return position;
  }

  if (currentBlock.selectionPos[1] >= currentBlock.text.length && amount > 0) {
    // Если выделитель уже в конце текущего блока
    if (position + 1 >= blockedData.length) return position; // в конце текста...
    position += 1;
    currentBlock.selectionPos = undefined;
    return changeSelection(amount, blockedData, position, selectionSize);
  }

  if (currentBlock.selectionPos[0] <= 0 && amount < 0) {
    // Если выделитель уже в начале текущего блока
    if (position - 1 < 0) return position; // в начале текста...
    position -= 1;
    currentBlock.selectionPos = undefined;
    return changeSelection(amount, blockedData, position, selectionSize);
  }

  // Остался только вариант, когда выделитель нужно переместить
  currentBlock.selectionPos[0] += amount;
  currentBlock.selectionPos[1] += amount;
  if (currentBlock.selectionPos[1] > currentBlock.text.length) {
    currentBlock.selectionPos[1] = currentBlock.text.length;
    currentBlock.selectionPos[0] =
      currentBlock.selectionPos[1] - selectionSize > 0
        ? currentBlock.selectionPos[1] - selectionSize
        : 0;
  }
  if (currentBlock.selectionPos[0] < 0) {
    currentBlock.selectionPos[0] = 0;
    currentBlock.selectionPos[1] =
      currentBlock.selectionPos[0] + selectionSize < currentBlock.text.length
        ? currentBlock.selectionPos[0] + selectionSize
        : currentBlock.text.length;
  }
  return position;
}
