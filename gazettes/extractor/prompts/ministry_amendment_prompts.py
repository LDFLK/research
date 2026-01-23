INITIAL_PROMPT = """
        You are analyzing a Sri Lankan Government Gazette notification that lists amendments to existing ministerial assignments, institutions, and laws.

        Your task is to extract **all changes** into a structured JSON array.
        DO NOT EXTRACT any header or footer.

        Each change must include:
        - `ministry_name`: The full name of the ministry the change refers to.
        - `change_type`: One of the following:
          - "ADD" — for inserted items or additions
          - "OMIT" — for omitted or removed items
          - "RENUMBER" — for renumbered item ranges
        - `affected_column`: The column the change applies to:
          - "I" → Duties & Functions
          - "II" → Departments, Statutory Institutions, or Public Corporations
          - "III" → Laws and Ordinances to be Implemented
        - `details`: A list of **strictly formatted strings** that describe the changes, using the following rules:

          ### FORMAT RULES:

          - For ADD:
            - If a name **and** item number are given (e.g., `10. Registration of persons`) and a position is described (e.g., "immediately after item 9"), use this format:
              - `Inserted: item <insertion_number> — <name>`
              -  Example: `Inserted: item 10 — Registration of persons`

            - If only the name is given (no item number or position), use:
              - `Inserted: <name>`

            - If only an item number is given without a name, use:
              - `Inserted: item <number>`

            - If Column III and position is described (e.g., "after item Voluntary Social Service Organizations (Registration and Supervision) Act, No. 31 of 1980").
              - `after: Voluntary Social Service Organizations (Registration and Supervision) Act, No. 31 of 1980`
              - `Inserted: <name>`

          - For OMIT:
            - If a name is given, use: `Omitted: <name>`
            - If only a number is shown, use: `Omitted: item <number>`

          - For RENUMBER:
            - Always use: `Renumbered: items <old_range> as <new_range>`

        - Always include one JSON object per unique combination of `ministry_name`, `change_type`, and `affected_column`.
        - Do NOT combine multiple `change_type`s in one object.
        - Do NOT return incomplete or malformed JSON.

        Wrap your response in a single line of valid JSON. Do not return incomplete objects or extra text.
        ### Use the following flat JSON array format:
        [
          {{
            "ministry_name": "string",
            "change_type": "ADD" | "OMIT" | "RENUMBER",
            "affected_column": "I" | "II" | "III",
            "details": ["string", ...]
          }}
        ]

        TEXT:

        {docs}
        """