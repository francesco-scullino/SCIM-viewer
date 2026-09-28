/**
 * Builds a SCIM filter expression using the "starts with" operator, e.g.
 * buildStartsWithFilter('userName', 'jdoe') => userName sw "jdoe"
 * Returns undefined when the search term is empty so callers can omit the filter entirely.
 */
export function buildStartsWithFilter(attribute: string, term: string): string | undefined {
  const trimmed = term.trim();
  if (!trimmed) return undefined;
  const escaped = trimmed.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `${attribute} sw "${escaped}"`;
}
