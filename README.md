# Domain Discovery MCP

Remote MCP server that lets Claude Code and any other MCP-compatible host
check whether domain names are free to register. Ask your assistant for name
ideas or a list of names, and it checks them for you.

Two ways to connect, same tools:

- npm connector `domain-discovery-mcp`, launched by your host via `npx`.
- Remote endpoint, nothing to install:

```
https://domain-discovery.remotify.run/mcp
```

A name is reported `available` only when it is confirmed free. Anything that
cannot be confirmed comes back `unknown`, never guessed.

## Install

Most users don't install: the hosts below launch it via `npx` (Node.js 20+):

```bash
npx -y domain-discovery-mcp@latest
```

Every host also takes the remote URL instead, shown under
[Remote endpoint](#remote-endpoint).

## Wire it into your MCP host

Every host below launches the same command; only the config differs. No
sign-in. A key is optional, see [API key (optional)](#api-key-optional).

### Claude Code

```bash
claude mcp add -s user domain-discovery -- npx -y domain-discovery-mcp@latest
```

`-s user` registers it for every working directory. `claude mcp list` shows
it; `/mcp` inside a session shows the live status and the tool.

### Codex CLI

```bash
codex mcp add domain-discovery -- npx -y domain-discovery-mcp@latest
```

### OpenCode V2

```bash
opencode mcp add domain-discovery --global -- npx -y domain-discovery-mcp@latest
```

`--global` registers it for every project; omit it for the current one.

### Cursor

`~/.cursor/mcp.json`:

```json
{ "mcpServers": { "domain-discovery": { "command": "npx", "args": ["-y", "domain-discovery-mcp@latest"] } } }
```

### VS Code

`.vscode/mcp.json`:

```json
{ "servers": { "domain-discovery": { "type": "stdio", "command": "npx", "args": ["-y", "domain-discovery-mcp@latest"] } } }
```

### Windsurf

`~/.codeium/windsurf/mcp_config.json`:

```json
{ "mcpServers": { "domain-discovery": { "command": "npx", "args": ["-y", "domain-discovery-mcp@latest"] } } }
```

### Gemini CLI

`~/.gemini/settings.json`:

```json
{ "mcpServers": { "domain-discovery": { "command": "npx", "args": ["-y", "domain-discovery-mcp@latest"] } } }
```

### Claude Desktop

`claude_desktop_config.json`:

```json
{ "mcpServers": { "domain-discovery": { "command": "npx", "args": ["-y", "domain-discovery-mcp@latest"] } } }
```

### Anything else

Any host that launches MCP servers takes the same `command` plus `args`.

## Remote endpoint

Hosts that connect to a URL, and cloud apps (claude.ai, ChatGPT custom
connectors), use `https://domain-discovery.remotify.run/mcp`, no sign-in:

```bash
claude mcp add -s user --transport http domain-discovery https://domain-discovery.remotify.run/mcp
codex mcp add domain-discovery --url https://domain-discovery.remotify.run/mcp
```

JSON hosts: `"url"` (Cursor, OpenCode `"type": "remote"`), `"type": "http"`
(VS Code), `"httpUrl"` (Gemini CLI), `"serverUrl"` (Windsurf).

## API key (optional)

Anonymous access works without a key. For higher limits, set
`DOMAIN_DISCOVERY_API_KEY` in the connector's environment; it sends the key
as `Authorization: Bearer <key>` and never writes it to disk.

| Host | How |
|------|-----|
| Claude Code | add `-e DOMAIN_DISCOVERY_API_KEY=<key>` to `claude mcp add` |
| Codex CLI | add `--env DOMAIN_DISCOVERY_API_KEY=<key>` to `codex mcp add` |
| JSON configs | add `"env": { "DOMAIN_DISCOVERY_API_KEY": "<key>" }` next to `command` and `args` |
| Remote endpoint | send the header: `--header`, `--bearer-token-env-var`, or `"headers"` |

## Tools exposed

- `check_domains(domains)` - checks a list of names and returns one result
  per name: its status, the registrar and dates for registered names, and a
  link to order it.

Prompts: `bulk_check` checks a list in one go; `name_ideas` suggests names
and checks them.

## Statuses

| Status | Meaning |
|--------|---------|
| `available` | confirmed free to register; may still be priced premium |
| `registered`, `premium`, `reserved`, `expired`, `redemption`, `pending_delete` | taken or held by the registry |
| `unknown` | could not be confirmed; not free |
| `invalid`, `unsupported_tld` | not a checkable name |

## Typical first-run flow

1. Connect your host as above.
2. Ask: "Is example-shop.com free? Also try .net and .io."
3. The assistant calls `check_domains` and answers per name, with an order
   link for each free one.

## License

Apache-2.0. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
