/** @type {import('next').NextConfig} */
const nextConfig = {
  // The MongoDB driver is loaded from node_modules at runtime instead of being bundled.
  serverExternalPackages: ['mongodb'],

  // Do not copy browser console messages into the dev log. On Windows, writing that log file
  // was picked up as a file change and made the page reload over and over.
  logging: { browserToTerminal: false },

  // Do not generate an AGENTS.md file in the project folder.
  agentRules: false,
};

export default nextConfig;
