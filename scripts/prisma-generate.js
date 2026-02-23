import { execSync } from 'child_process';

try {
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { 
    cwd: '/vercel/share/v0-project',
    stdio: 'inherit' 
  });
  console.log('Prisma Client generated successfully!');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
