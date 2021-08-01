type SortableByDate = { date: string };
export const sortByDate = (
  objectA: SortableByDate,
  objectB: SortableByDate,
) => {
  if (objectA.date < objectB.date) {
    return -1;
  }
  if (objectA.date > objectB.date) {
    return 1;
  }
  return 0;
};

type SortableByCount = { count: number };
export const sortByCount = (
  objectA: SortableByCount,
  objectB: SortableByCount,
) => {
  if (objectA.count < objectB.count) {
    return 1;
  }
  if (objectA.count > objectB.count) {
    return -1;
  }
  return 0;
};

export const splitArrayInChunks = (array: any[], chunkLength: number) => {
  const chunks = [];
  let chunkIndex = 0;
  const arrayLength = array.length;

  while (chunkIndex < arrayLength) {
    chunks.push(array.slice(chunkIndex, (chunkIndex += chunkLength)));
  }

  return chunks;
};
