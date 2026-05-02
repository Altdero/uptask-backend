/** @type {import('lint-staged').Config} */
const config = {
  '*.{js,ts,mjs}': ['prettier --write', 'eslint --fix'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};

export default config;
