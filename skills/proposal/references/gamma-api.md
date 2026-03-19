# Gamma API Reference

## Base URL

`https://public-api.gamma.app/v1.0`

## Authentication

All requests require `X-API-KEY` header. Key stored in `.env` as `GAMMA_API_KEY`.

## 1. Generate Content

```
POST /generations
```

### Required

| Parameter | Description |
|---|---|
| `inputText` | Proposal markdown content. Max 100,000 tokens. Use `\n---\n` to control card splits. |
| `textMode` | `generate` (expand), `condense` (summarize), `preserve` (keep as-is) |

### Optional

| Parameter | Default | Options |
|---|---|---|
| `format` | `presentation` | `presentation`, `document`, `webpage`, `social` |
| `numCards` | `10` | 1-60 (Ultra: 1-75). Only applies when `cardSplit: 'auto'` |
| `cardSplit` | `auto` | `auto`, `inputTextBreaks` (split on `\n---\n`) |
| `themeId` | workspace default | Retrieve via `GET /themes` |
| `folderIds` | — | Retrieve via `GET /folders` |
| `exportAs` | — | `pdf`, `pptx`, `png`. Must be in initial request |
| `additionalInstructions` | — | Max 5000 chars. Design/layout/style guidance |

### textOptions

Only applies when `textMode` is `generate` or `condense`. Ignored with `preserve`.

| Parameter | Options / Limit |
|---|---|
| `amount` | `brief`, `medium`, `detailed`, `extensive` |
| `tone` | Free string (e.g., `"professional, upbeat"`) |
| `audience` | Free string (e.g., `"executives"`, `"new hires"`) |
| `language` | Language code (e.g., `"ko"`, `"en"`, `"ja"`) |

### imageOptions

| Parameter | Options |
|---|---|
| `source` | `aiGenerated`, `pictographic`, `pexels`, `giphy`, `webFreeToUseCommercially`, `noImages`, etc. |
| `model` | When `source: 'aiGenerated'`. e.g., `"flux-1-pro"`. Auto-selected if omitted |
| `style` | When `source: 'aiGenerated'`. Max 500 chars. e.g., `"minimal, black and white, line art"` |

### cardOptions

| Parameter | Values by format |
|---|---|
| `dimensions` | presentation: `fluid`, `16x9`, `4x3` / document: `fluid`, `pageless`, `letter`, `a4` / social: `1x1`, `4x5`, `9x16` |
| `headerFooter` | 6 positions: `topLeft`, `topRight`, `topCenter`, `bottomLeft`, `bottomRight`, `bottomCenter` |

headerFooter item structure:
```json
{
  "bottomRight": { "type": "cardNumber" },
  "topLeft": { "type": "image", "source": "themeLogo", "size": "md" },
  "bottomLeft": { "type": "text", "value": "Confidential" }
}
```

### sharingOptions

| Parameter | Options |
|---|---|
| `workspaceAccess` | `noAccess`, `view`, `comment`, `edit`, `fullAccess` |
| `externalAccess` | `noAccess`, `view`, `comment`, `edit` |
| `emailOptions.recipients` | Array of email addresses |
| `emailOptions.access` | `view`, `comment`, `edit`, `fullAccess` |

## 2. Generate from Template

```
POST /generations/from-template
```

| Parameter | Required | Description |
|---|---|---|
| `gammaId` | Yes | Template ID (single-page templates only) |
| `prompt` | Yes | Modification instructions. Can include text + image URLs |
| `themeId` | No | Theme override |
| `exportAs` | No | `pdf`, `pptx`, `png` |
| `imageOptions` | No | Same as above |
| `sharingOptions` | No | Same as above |

## 3. Polling

```
GET /generations/{generationId}
```

Poll every 5 seconds. Most generations complete within 2-3 minutes. Recommend 5-minute max timeout.

Response: `status` (`pending`/`completed`/`failed`), `gammaUrl`, `exportUrl`, credit usage.

On 429 responses, check `Retry-After` header and use exponential backoff.

## 4. Export Download

`exportUrl` is a signed URL that expires after ~1 week. Download promptly after generation.

```
GET {exportUrl}
X-API-KEY: {key}
```

## Code References

- TypeScript client: `src/gamma/client.ts`
- Document builder: `src/engine/document-builder.ts`
- Types: `src/data/types.ts`

## Tips

- `cardSplit: 'inputTextBreaks'` + `\n---\n` gives precise section-to-card mapping
- Use `additionalInstructions` for design guidance: "clean layout with ample whitespace"
- Consistent `imageOptions.style` improves visual coherence
- Set `textOptions.language` to match the proposal language (e.g., `'ko'`, `'en'`)
- `textMode: 'preserve'` ignores `textOptions.amount/tone/audience`
