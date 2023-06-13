const { execSync } = require('child_process');
const fs = require('fs');

const jsonContent = fs.readFileSync('.buildkite/caches.json', 'utf8');
const cachesToUpload = JSON.parse(jsonContent);

cachesToUpload.forEach(item => {
  console.log(execSync(`echo "--- :arrow_down: Download ${item.display_name}"`, { encoding: 'utf8' }));
  // cd into the basedir for the folder to archive because of the folder structure the cache archive use and the fact that not all folders are in the project tree
  console.log(execSync(`cd ${item.folder_to_archive_basedir}`, { encoding: 'utf8' }));
  console.log(execSync(`echo $(pwd)`, { encoding: 'utf8' }));
  console.log(execSync(`ls -al`, { encoding: 'utf8' }));
  console.log(execSync(`restore_cache $(hash_directory ${item.folder_to_archive})`, { encoding: 'utf8' }));
});

// Some of the cache data needs to be connected to the submodule projects.
//
// The npm postinstall hooks normally does that, but we obviously don't run it when using cached data.

console.log("--- :pnpm: :jetpack: Setup pnpm symlinks");
console.log(execSync("./bin/run-jetpack-command.sh 'install --ignore-scripts'"));

console.log("--- :globe_with_meridians: Propagate i18n from local cache to submodules");
console.log(execSync("./bin/i18n-check-cache.sh"));
