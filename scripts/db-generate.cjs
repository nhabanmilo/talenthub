const os=require('node:os');
// tsx needs a stable temporary-directory suffix when Windows userInfo is unavailable.
if(process.platform==='win32'){try{os.userInfo()}catch{process.geteuid=()=> 'talenthub-workspace'}}
process.argv=[process.execPath,'drizzle-kit','generate'];
require('../node_modules/drizzle-kit/bin.cjs');
