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

## Step 0: Check API Key

```bash
echo "${GAMMA_API_KEY:+set}"
```

If not set, guide the user:

> You need a Gamma API key to generate Gamma documents.
>
> 1. Go to https://gamma.app > Profile > **Account Settings** > **API Keys** > **Create API Key**
> 2. **Required plan:** Pro, Ultra, Teams, or Business
>
> Set it: `export GAMMA_API_KEY="your_key"`

Use AskUserQuestion to collect the key. If provided, set it as an environment variable
for the session.

**IMPORTANT: Never print or log the API key.**

If the user wants to skip Gamma generation, proceed without a key — the workflow will
produce a markdown draft only.

## Step 1: Collect context

Ask the user for customer information. Accept any format: meeting notes, call transcripts,
RFP documents, email threads, or free-form descriptions.

Extract from the unstructured input:
- Company name, industry, size
- Pain points / solution needs
- Budget and timeline (if mentioned)
- Special requirements

Show the extracted summary and ask the user to confirm. Mark missing items as *(not mentioned)*.

## Step 2: Product & pricing info

Check `data/my-products/` in the working directory.

- **Files exist**: Load and use them. Ask if updates are needed.
- **Empty / missing**: Ask the user to provide product info (file path, URL, or paste).
  Save to `data/my-products/products.md` for reuse in future proposals.

## Step 3: Reference proposals (optional)

Check `data/references/` for past successful proposals. If available, use them as
tone/structure references. If not, proceed with the default 6-section structure.

## Step 4: Draft the proposal

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

## Step 5: Review

Show a section-by-section summary and ask the user:
- **Approve** → proceed to Step 6
- **Edit** → revise specific sections, then re-summarize
- **Regenerate** → re-run Step 4

## Step 6: Gamma document generation

If no API key was set in Step 0, skip to Step 7 with markdown draft only.

After approval, ask the user for output preferences:

```
Output format: presentation (default) / document / webpage
Dimensions:   16x9 (default) / 4x3 / fluid / a4
Images:       AI-generated (default) / web images / no images
Export:       PDF (default) / PPTX / PNG
```

Proceed with defaults if the user skips selection.

### API Call

Build JSON payload and call via python3 + curl, passing the key from the environment variable.
See [references/gamma-api.md](references/gamma-api.md) for full spec.

```bash
python3 -c "
import json, subprocess, sys

payload = {
    'inputText': open('output/draft/DRAFT_FILE').read(),
    'textMode': 'preserve',
    'format': 'FORMAT_HERE',
    'cardSplit': 'inputTextBreaks',
    'exportAs': 'EXPORT_HERE',
    'additionalInstructions': 'Clean, professional layout with ample whitespace.',
    'textOptions': {'language': 'LANG_HERE'},
    'imageOptions': {'source': 'SOURCE_HERE', 'style': 'professional, corporate, minimal'},
    'cardOptions': {'dimensions': 'DIM_HERE'}
}

result = subprocess.run(
    ['curl', '-s', '-w', '\\n%{http_code}', '-X', 'POST',
     'https://public-api.gamma.app/v1.0/generations',
     '-H', 'X-API-KEY: ' + sys.argv[1],
     '-H', 'Content-Type: application/json',
     '-d', json.dumps(payload)],
    capture_output=True, text=True
)
print(result.stdout)
" "\$GAMMA_API_KEY"
```

Replace placeholders with user-selected values from the option mapping.

### Response Handling

Extract `generationId`. On error:
- 401: "Invalid API key."
- 402: "Insufficient credits."
- 429: "Too many requests. Please try again later."

### Poll for Result

Poll every 5 seconds until `completed` or `failed`. Max 5 minutes.

```bash
for i in $(seq 1 60); do
  sleep 5
  RESP=$(curl -s "https://public-api.gamma.app/v1.0/generations/${GENERATION_ID}" \
    -H "X-API-KEY: ${GAMMA_API_KEY}")
  STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))")
  if [ "$STATUS" = "completed" ]; then
    echo "$RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print('GAMMA_URL='+d.get('gammaUrl',''))
print('EXPORT_URL='+d.get('exportUrl',''))
"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "FAILED"; echo "$RESP"; break
  fi
done
```

### Download Export

```bash
curl -s -o "output/{filename}.{format}" -H "X-API-KEY: ${GAMMA_API_KEY}" "${EXPORT_URL}"
```

**Optional: share with customer directly**
If the user provides a customer email, include `sharingOptions.emailOptions` in the
generation request to send a view-only Gamma link.

## Step 7: Done

Report: draft file path, Gamma URL, exported file path.

## Error Reference

| Error | Action |
|-------|--------|
| Key not set | Show setup guide from Step 0 |
| 401 | Ask to verify API key |
| 402 | Direct to Gamma dashboard to add credits |
| 429 | Wait and retry |
| Generation failed | Analyze error + offer retry |
| Timeout (>5 min) | Show generation ID, check gamma.app later |

## File structure

```
data/my-products/    # Product & pricing info (created on first use, reused later)
data/references/     # Past successful proposals for tone/structure reference
output/draft/        # Markdown drafts
output/              # Final PDF/PPTX/PNG exports
```
