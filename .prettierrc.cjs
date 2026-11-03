module.exports = {
	useTabs: true,
	tabWidth: 3,
	singleQuote: true,
	jsxSingleQuote: false,
	trailingComma: 'all',
	printWidth: 100,
	semi: true,
	arrowParens: 'always',
	endOfLine: 'lf',
	bracketSpacing: true,
	overrides: [
		{
			files: ['**/*.html', '**/*.css', '**/*.scss', '**/*.json', '**/*.md'],
			options: {
				singleQuote: false,
			},
		},
		{
			files: ['**.yml', '**.yaml'],
			options: {
				useTabs: false,
				tabWidth: 3,
			},
		},
	],
};
