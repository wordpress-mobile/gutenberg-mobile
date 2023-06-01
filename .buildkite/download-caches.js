const { execSync } = require('child_process');
const fs = require('fs');

const jsonContent = fs.readFileSync('.buildkite/caches.json', 'utf8');
const cachesToUpload = JSON.parse(jsonContent);

cachesToUpload.forEach(item => {
  console.log(execSync(`echo "--- :arrow_down: Download ${item.display_name}"`, { encoding: 'utf8' }));
  console.log(execSync(`buildkite-agent artifact download ${item.archive_name} .`, { encoding: 'utf8' }));
  console.log(execSync(`tar --extract --gzip --file=${item.archive_name} --directory=${item.folder_to_archive_basedir} ${item.folder_to_archive}`, { encoding: 'utf8' }));
});
