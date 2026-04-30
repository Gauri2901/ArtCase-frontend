export const SOLD_TAGS = new Set(['sold', 'sold out']);

export type ProductTagState = {
  label: string;
  isSold: boolean;
  isNew: boolean;
};

export const getDisplayTag = (tags: string[] = []): ProductTagState => {
  const cleanedTags = tags
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (cleanedTags.length === 0) {
    return { label: '', isSold: false, isNew: false };
  }

  const soldTag = cleanedTags.find((tag) => SOLD_TAGS.has(tag.toLowerCase()));
  const label = soldTag || cleanedTags[0];
  const normalizedLabel = label.toLowerCase();

  return {
    label,
    isSold: SOLD_TAGS.has(normalizedLabel),
    isNew: normalizedLabel === 'new',
  };
};
