// Mock Unsplash tool for generating images
export async function unsplash_tool({ query }: { query: string }): Promise<string> {
  // In a real implementation, this would call the actual Unsplash API
  // For now, we'll return random Unsplash images based on the query
  
  const imageIds = [
    'photo-1613228097818-386b8d5f2a08', // coffee
    'photo-1613477581401-c40e1ad085d2', // sunset
    'photo-1745814132532-1c8bd029f1e3', // street art
    'photo-1612192666336-561178b9cbfd', // food
    'photo-1593168098026-10d982cb9055', // mountains
    'photo-1686548814818-fac48b347b75', // fashion
    'photo-1559321987-c98064686fb9', // city lights
    'photo-1526673945462-bbebcd9f24f5', // pets
    'photo-1724435811349-32d27f4d5806', // people
    'photo-1535713875002-d1d0cf377fde', // portraits
    'photo-1494790108755-2616b612b786', // women
    'photo-1507003211169-0a1dd7228f2d', // men
    'photo-1438761681033-6461ffad8d80', // lifestyle
    'photo-1472099645785-5658abf4ff4e'  // professional
  ];
  
  // Select a random image ID
  const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
  
  // Return a properly formatted Unsplash URL
  return `https://images.unsplash.com/${randomId}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8ZW58MHx8fHwxNzU2ODI1MjUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral`;
}