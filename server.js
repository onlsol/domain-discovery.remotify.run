#!/usr/bin/env node
// domain-discovery-mcp: a stdio MCP server that forwards to the remote
// endpoint. It holds no checking logic; tools, prompts and wording come from
// the server, so they never go stale in an installed copy.
import { readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(HERE, "package.json"), "utf8")).version;
export const ENDPOINT = "https://domain-discovery.remotify.run/mcp";

// Serve the remote's tools and prompts over `transport`, forwarding each call.
export async function bridge(remote, transport) {
  const server = new Server(
    { name: "domain-discovery-mcp", version: VERSION },
    {
      capabilities: { tools: {}, prompts: {} },
      instructions: remote.getInstructions(),
    },
  );
  server.setRequestHandler(ListToolsRequestSchema, (req) => remote.listTools(req.params));
  server.setRequestHandler(CallToolRequestSchema, (req) => remote.callTool(req.params));
  server.setRequestHandler(ListPromptsRequestSchema, (req) => remote.listPrompts(req.params));
  server.setRequestHandler(GetPromptRequestSchema, (req) => remote.getPrompt(req.params));
  await server.connect(transport);
  return server;
}

// Open the remote session, with the optional key as a Bearer header.
export async function connectRemote(env = process.env) {
  const key = env.DOMAIN_DISCOVERY_API_KEY;
  const headers = key ? { Authorization: `Bearer ${key}` } : {};
  const remote = new Client({ name: "domain-discovery-mcp", version: VERSION });
  await remote.connect(new StreamableHTTPClientTransport(new URL(ENDPOINT), { requestInit: { headers } }));
  return remote;
}

async function main() {
  let remote;
  try {
    remote = await connectRemote();
  } catch (error) {
    // stdout is the MCP stream; one line to stderr and a non-zero exit.
    process.stderr.write(`domain-discovery-mcp: cannot reach ${ENDPOINT}: ${error.message}\n`);
    process.exit(1);
  }
  await bridge(remote, new StdioServerTransport());
}

// Run only as the entry point (npx runs it through a symlink), not on import.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
