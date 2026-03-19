# gamma-sales-proposal

A Claude Code plugin that generates professional sales proposals from unstructured inputs — meeting notes, RFPs, emails, or free-form text — and converts them into polished Gamma presentations, documents, or webpages.

## Features

- **Unstructured input** — Paste meeting notes, RFP documents, email threads, or describe the customer situation in any format
- **Auto-extraction** — Automatically extracts company name, industry, pain points, budget, and timeline from raw text
- **Product catalog reuse** — Save your product/pricing info once, reuse across all future proposals
- **6-section proposal** — Executive Summary, Pain Points, Solution, Pricing, ROI, Timeline
- **Gamma integration** — Convert proposals into presentations, documents, or webpages via [Gamma API](https://developers.gamma.app)
- **Multi-format export** — PDF, PPTX, or PNG
- **Multi-language** — Outputs in the user's language automatically
- **Human-in-the-loop** — Review, edit, or regenerate before final output

## Installation

Clone the repository:

```bash
git clone https://github.com/jinjin1/gamma-sales-proposal.git
```

Load as a local plugin:

```bash
claude --plugin-dir ./gamma-sales-proposal
```

### Prerequisites

- [Claude Code](https://claude.ai/claude-code) v1.0.33+
- A [Gamma API key](https://gamma.app/settings/api-keys) (Pro plan or above)

## Setup

1. Create a `.env` file in your working directory:

```bash
GAMMA_API_KEY=your-gamma-api-key
```

2. (Optional) Add your product/pricing info to `data/my-products/products.md` — or the plugin will ask you on first use.

3. (Optional) Drop past successful proposals into `data/references/` for tone/structure reference.

## Usage

```
/gamma-proposal:proposal
```

The plugin walks you through a 7-step workflow:

1. **Context** — Paste meeting notes, RFP, or customer description
2. **Products** — Load saved product info or provide new
3. **References** — Optionally use past proposals as templates
4. **Draft** — AI generates a structured proposal
5. **Review** — Approve, edit sections, or regenerate
6. **Generate** — Convert to Gamma presentation/document/webpage
7. **Done** — Get draft path, Gamma URL, and exported file

## Project structure

```
gamma-sales-proposal/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── skills/
│   └── proposal/
│       ├── SKILL.md             # Skill definition
│       └── references/
│           └── gamma-api.md     # Gamma API reference
├── data/
│   ├── my-products/             # Your product/pricing info
│   └── references/              # Past proposal references
├── .env.example
├── .gitignore
└── LICENSE
```

## Gamma API options

The plugin leverages the full Gamma API:

| Option | Choices |
|---|---|
| Format | `presentation`, `document`, `webpage`, `social` |
| Dimensions | `16x9`, `4x3`, `a4`, `letter`, `fluid` |
| Images | AI-generated, Pexels, Pictographic, no images |
| Export | PDF, PPTX, PNG |
| Sharing | Email directly to customer with view/comment/edit access |

## License

MIT
