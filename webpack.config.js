module.exports = {
	entry: "./client/js/app.js",
	output: {
		filename: "lib/client/bundle.js"
	},
	module: {
		loaders: {
			test: '\.js$',
			exclude: /(node_modules|bower_components)/,
			loader: 'babel',
			query: {
				presets: ['react', 'es2015']
			}
		}
	}
};
