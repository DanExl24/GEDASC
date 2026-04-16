import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_PORT = '3000';
const envPath = path.resolve(process.cwd(), '.env');
const input = process.argv[2]?.trim();

if (!input) {
  console.error('Uso: npm run set-ip -- <IP>');
  process.exit(1);
}

const normalizedHost = normalizeHost(input);

if (!normalizedHost) {
  console.error('IP invalida. Use un valor como 192.168.1.12');
  process.exit(1);
}

const nextApiUrl = `http://${normalizedHost}:${DEFAULT_PORT}`;
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const apiLine = `VITE_API_URL=${nextApiUrl}`;

let nextEnvContent;

if (/^VITE_API_URL=.*$/m.test(envContent)) {
  nextEnvContent = envContent.replace(/^VITE_API_URL=.*$/m, apiLine);
} else {
  const separator = envContent && !envContent.endsWith('\n') ? '\n' : '';
  nextEnvContent = `${envContent}${separator}${apiLine}\n`;
}

fs.writeFileSync(envPath, nextEnvContent, 'utf8');

console.log(`IP actualizada correctamente: ${nextApiUrl}`);

function normalizeHost(value) {
  const withoutProtocol = value.replace(/^https?:\/\//i, '');
  const host = withoutProtocol.split(':')[0];
  const ipv4Pattern =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  return ipv4Pattern.test(host) ? host : null;
}
