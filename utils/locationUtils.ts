// utils/locationUtils.ts

export const cleanAddress = (text: string): string => {
  return text
    .trim()
    .replace(/\s*,\s*/g, ', ')
    .replace(/\.\s*,/g, ',')
    .replace(/\.+$/, '')
    .replace(/\s+/g, ' ');
};

export const assessAccuracy = (
  displayName: string,
  originalQuery: string
): 'precise' | 'approximate' | 'city' => {
  const lowerDisplay = displayName.toLowerCase();
  const lowerQuery = originalQuery.toLowerCase();

  const queryTerms = lowerQuery
    .split(',')
    .map(term => term.trim())
    .filter(term => term && term !== 'india' && term !== 'tamil nadu');

  const matchedTerms = queryTerms.filter(term =>
    lowerDisplay.includes(term) || term.includes(lowerDisplay.split(',')[0])
  );

  if (
    lowerDisplay.includes('road') ||
    lowerDisplay.includes('street') ||
    lowerDisplay.includes('avenue') ||
    matchedTerms.length >= 2
  ) {
    return 'precise';
  }

  if (matchedTerms.length === 1 && !lowerDisplay.startsWith('coimbatore,')) {
    return 'approximate';
  }

  return 'city';
};
