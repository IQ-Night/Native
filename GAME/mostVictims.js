export function findMostFrequentVictim(votes) {
  if (votes && votes.length > 0) {
    // Create a frequency map for victimId
    const frequencyMap = {};

    // Count occurrences of each victimId or voteFor
    votes.forEach((vote) => {
      const victim = vote.victim || vote.voteFor;
      if (victim) {
        frequencyMap[victim] = (frequencyMap[victim] || 0) + 1;
      }
    });
    // Find the maximum occurrence count
    let maxCount = 0;
    let mostFrequentVictims = [];

    for (const victim in frequencyMap) {
      const count = frequencyMap[victim];
      if (count > maxCount) {
        maxCount = count;
        mostFrequentVictims = [victim];
      } else if (count === maxCount) {
        mostFrequentVictims.push(victim);
      }
    }

    // Determine if there is a tie or a single most frequent victim
    const allEqual = mostFrequentVictims.length > 1;
    const mostFrequentVictim =
      mostFrequentVictims.length === 1 ? mostFrequentVictims[0] : null;

    return {
      mostFrequentVictims: mostFrequentVictim,
      allEqual,
    };
  } else {
    return { mostFrequentVictims: null, allEqual: true };
  }
}
