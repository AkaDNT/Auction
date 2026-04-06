export function buildMockImage(seed: string, width = 1600, height = 1000) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export const mockImages = {
  homeHero: buildMockImage("auction-home-hero", 1400, 1000),
  homeMarket: buildMockImage("auction-home-market", 1200, 900),
  authHero: buildMockImage("auction-auth-hero", 1200, 900),
  adminPanel: buildMockImage("auction-admin-panel", 1200, 900),
  auctionsHeader: buildMockImage("auction-list-header", 1400, 900),
  analyticsChart: buildMockImage("auction-analytics-chart", 1200, 900),
  lotsBoard: buildMockImage("auction-lots-board", 1200, 900),
  usersBoard: buildMockImage("auction-users-board", 1200, 900),
  settingsBoard: buildMockImage("auction-settings-board", 1200, 900),
};

export function getAuctionImage(id: string) {
  return buildMockImage(`auction-${id}`, 1200, 900);
}

export function getCategoryImage(slug: string) {
  return buildMockImage(`category-${slug}`, 1200, 900);
}
