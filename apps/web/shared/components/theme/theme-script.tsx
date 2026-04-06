export function ThemeScript() {
  const script = `
(function() {
  try {
    var storageKey = 'auction-theme';
    var storedTheme = window.localStorage.getItem(storageKey);
    var theme = storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    var root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (error) {}
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
