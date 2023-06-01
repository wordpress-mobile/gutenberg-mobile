const { execSync } = require('child_process');
const fs = require('fs');

const jsonContent = fs.readFileSync('.buildkite/caches.json', 'utf8');
const cachesToUpload = JSON.parse(jsonContent);

cachesToUpload.forEach(item => {
  console.log(execSync(`echo "--- :arrow_up: Upload ${item.display_name} cache"`, { encoding: 'utf8' }));
  console.log(execSync(`tar --create --gzip --file=${item.archive_name} --directory=${item.folder_to_archive_basedir} ${item.folder_to_archive}`, { encoding: 'utf8' }));
  console.log(execSync(`buildkite-agent artifact upload ${item.archive_name}`, { encoding: 'utf8' }));
});
