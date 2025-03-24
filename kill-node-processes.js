const { execSync } = require('child_process');

console.log('🔧 Killing Node.js processes that might be locking files...');

try {
  // List all Node.js processes
  console.log('Current Node.js processes:');
  const processList = execSync('tasklist /fi "imagename eq node.exe"', { encoding: 'utf8' });
  console.log(processList);
  
  // Kill all Node.js processes except the current one
  console.log('Attempting to kill Node.js processes...');
  const currentPid = process.pid;
  console.log(`Current process ID: ${currentPid} (will not be killed)`);
  
  // Get all Node.js process IDs
  const processLines = processList.split('\n').slice(3); // Skip header lines
  for (const line of processLines) {
    const match = line.match(/node\.exe\s+(\d+)/);
    if (match && match[1]) {
      const pid = parseInt(match[1]);
      if (pid !== currentPid) {
        console.log(`Killing process with PID ${pid}...`);
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'inherit' });
        } catch (killError) {
          console.error(`Failed to kill process ${pid}: ${killError.message}`);
        }
      }
    }
  }
  
  console.log('✅ Node.js processes killed');
} catch (error) {
  console.error('❌ Error managing Node.js processes:', error.message);
}

console.log('🎉 Process cleanup completed');
