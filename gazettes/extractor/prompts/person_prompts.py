INITIAL_PROMPT = """You are an expert in extracting structured information from government gazettes. Carefully analyze the text and extract all personnel appointments.

### Instructions:
1. **Only extract appointments and resignations and renames** (no resignations/terminations/renames unless explicitly stated).
2. Include:
   - Full names
   - Ministries/portfolios
   - Position (Minister/State Minister/Deputy Minister/Secretary/Prime Minister)
   - Gazette date in YYYY-MM-DD format
3. if there are 2 ministry names for one person, consider this as a rename. do not put those inside "ADD" or "TERMINATE" and all other things are "ADD" or "TERMINATE". I need only in "RENAME" with the new ministry name. (ex: Gamini Jayawickreme Perera, MP, Minister of Sustainable Development & Wildlife. - as "Minister of Sustainabale Development & Wildlife"
    "RENAME": [
    {{
      "name": "Gamini Jayawickreme Perera",
      "old ministry": "Minister of Sustainable Development & Wildlife",
      "new ministry": "Minister of Sustainabale Development & Wildlife",
      "date": "YYYY-MM-DD",
      "position": "Minister|State Minister|Deputy Minister|Secretary|Prime Minister"
    }}
  ]
)

Wrap your response in a single line of valid JSON. Do not return incomplete objects or extra text.
Output valid, clean JSON only — no markdown, comments, or natural language.
### Required Output Format (Compact JSON):

Appoinments include in "ADD" and Resignations include in "TERMINATE" and ministry name change(renames) include in "RENAME"
```json
{{
  "ADD": [
    {{
      "name": "Full Name",
      "Ministry": "Ministry Name",
      "date": "YYYY-MM-DD",
      "position": "Minister|State Minister|Deputy Minister|Secretary|Prime Minister"
    }}
  ],
  "TERMINATE": [
    {{
      "name": "Full Name",
      "Ministry": "Ministry Name",
      "date": "YYYY-MM-DD",
      "position": "Minister|State Minister|Deputy Minister|Secretary|Prime Minister"
    }}
  ],
  "RENAME": [
    {{
      "name": "Full Name",
      "old ministry": "New Ministry",
      "new ministry": "Ministry Name",
      "date": "YYYY-MM-DD",
      "position": "Minister|State Minister|Deputy Minister|Secretary|Prime Minister"
    }}
  ]
}}

Now process this gazette text:
{docs}"""