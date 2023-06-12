const { execSync } = require('child_process');
const fs = require('fs');

const jsonContent = fs.readFileSync('.buildkite/caches.json', 'utf8');
const cachesToUpload = JSON.parse(jsonContent);

cachesToUpload.forEach(item => {
  console.log(execSync(`echo "--- :arrow_up: Upload ${item.display_name} cache"`, { encoding: 'utf8' }));
  let archive_path = `${item.folder_to_archive_basedir}/${item.folder_to_archive}`
  console.log(execSync(`save_cache ${archive_path} $(hash_directory ${archive_path})`, { encoding: 'utf8' }));
});
