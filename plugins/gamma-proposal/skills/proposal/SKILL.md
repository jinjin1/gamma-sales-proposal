---
name: proposal
description: >
  AI-powered sales proposal generator. Transforms unstructured inputs (meeting notes,
  RFPs, emails, free-form text) into professional proposals with pricing and timelines,
  then converts them into Gamma presentations, documents, or webpages.
  Trigger: "proposal", "제안서", "견적서", "RFP response", "create a proposal",
  "write a quote", or any request to generate a sales proposal after a customer meeting.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
  - WebFetch
  - WebSearch
  - Agent
---

# /gamma-proposal:proposal

Generate a sales proposal from unstructured customer context, then optionally produce a
Gamma presentation/document/webpage with PDF/PPTX/PNG export.

**Language rule**: Detect the user's language from their input. All output — questions,
extracted summaries, and the final proposal — must be in that language. If the input
mixes languages, prefer the language used for business context.

## Workflow

### Step 1: Collect context

Ask the user for customer information. Accept any format: meeting notes, call transcripts,
RFP documents, email threads, or free-form descriptions.

Extract from the unstructured input:
- Company name, industry, size
- Pain points / solution needs
- Budget and timeline (if mentioned)
- Special requirements

Show the extracted summary and ask the user to confirm. Mark missing items as *(not mentioned)*.

### Step 2: Product & pricing info

Check `data/my-products/` in the working directory.

- **Files exist**: Load and use them. Ask if updates are needed.
- **Empty / missing**: Ask the user to provide product info (file path, URL, or paste).
  Save to `data/my-products/products.md` for reuse in future proposals.

### Step 3: Reference proposals (optional)

Check `data/references/` for past successful proposals. If available, use them as
tone/structure references. If not, proceed with the default 6-section structure.

### Step 4: Draft the proposal

**Default structure** (override with reference proposal structure if available):

1. Executive Summary
2. Pain Points & Challenges
3. Proposed Solution
4. Pricing & Quote
5. ROI Analysis
6. Implementation Timeline

Insert `\n---\n` between sections for Gamma card splitting.

**Rules:**
- Only use product/pricing data from `data/my-products/`
- Never fabricate products, features, or prices
- Mark uncertain figures with `[TBD]` or equivalent in the user's language

Save to: `output/draft/{companyName}_{YYYY-MM-DD}_proposal.md`

### Step 5: Review

Show a section-by-section summary and ask the user:
- **Approve** → proceed to Step 6
- **Edit** → revise specific sections, then re-summarize
- **Regenerate** → re-run Step 4

### Step 6: Gamma document generation

After approval, ask the user for output preferences:

```
Output format: presentation (default) / document / webpage
Dimensions:   16x9 (default) / 4x3 / fluid / a4
Images:       AI-generated (default) / web images / no images
Export:       PDF (default) / PPTX / PNG
```

Proceed with defaults if the user skips selection.

Call Gamma API — see [references/gamma-api.md](references/gamma-api.md) for full spec.

**Recommended settings:**
- `textMode: 'preserve'` — keep proposal text as-is
- `cardSplit: 'inputTextBreaks'` — map sections to cards via `---` breaks
- `textOptions.language` — match the user's language (e.g., `'ko'`, `'en'`, `'ja'`)
- `additionalInstructions` — clean professional layout with ample whitespace
- `imageOptions.style` — `"professional, corporate, minimal"`

**Optional: share with customer directly**
If the user provides a customer email, use `sharingOptions.emailOptions` to send a
view-only Gamma link.

If `GAMMA_API_KEY` is not set, save the markdown draft only and inform the user.

### Step 7: Done

Report: draft file path, Gamma URL, exported file path.

## File structure

```
data/my-products/    # Product & pricing info (created on first use, reused later)
data/references/     # Past successful proposals for tone/structure reference
output/draft/        # Markdown drafts
output/              # Final PDF/PPTX/PNG exports
```
