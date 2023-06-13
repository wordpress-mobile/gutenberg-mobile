const { execSync } = require('child_process');
const fs = require('fs');

const jsonContent = fs.readFileSync('.buildkite/caches.json', 'utf8');
const cachesToUpload = JSON.parse(jsonContent);

cachesToUpload.forEach(item => {
  console.log(execSync(`echo "--- :arrow_up: Upload ${item.display_name} cache"`, { encoding: 'utf8' }));
  // cd into the basedir for the folder to archive because of the folder structure the cache archive use and the fact that not all folders are in the project tree
  console.log(execSync(`cd ${item.folder_to_archive_basedir}`, { encoding: 'utf8' }));
  console.log(execSync(`echo $(pwd)`, { encoding: 'utf8' }));
  console.log(execSync(`ls -al`, { encoding: 'utf8' }));
  console.log(execSync(`save_cache ${item.folder_to_archive} $(hash_directory ${item.folder_to_archive})`, { encoding: 'utf8' }));
});
