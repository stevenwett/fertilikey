const webpack = require('webpack');
const config = require('./webpack.config.js');

// Create webpack compiler instance
const compiler = webpack(config);

// Add hook to log modified files
compiler.hooks.watchRun.tap('WatchRun', (comp) => {
  if (comp.modifiedFiles) {
    const changedFiles = Array.from(comp.modifiedFiles);
    console.log('\nFiles changed:');
    changedFiles.forEach(file => console.log(` - ${file}`));
  }
});

// Run webpack watch with proper callback
compiler.watch({
  aggregateTimeout: 300, // Wait 300ms after changes before rebuilding
  poll: 1000, // Check for changes every second
  ignored: /node_modules/
}, (err, stats) => {
  if (err) {
    console.error(err);
    return;
  }
  
  // Output build stats with nice formatting
  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    assets: true
  }));
});

console.log('Webpack is watching for changes...');