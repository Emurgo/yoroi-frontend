/**
 * Splits the passed ID string by DOT and returns the first part.
 *
 * NOTE: fails with error in case there is no DOT in the identifier,
 * UNLESS the ID is an empty string - in that case returns empty string.
 */
export function identifierToPolicy(id: string) {
  if (id === '') return '';
  const [policy, name] = id.split('\.');
  if (policy == null || name == null) {
    throw 'incorrect asset identifier, cannot split: ' + id;
  }
  return policy;
}