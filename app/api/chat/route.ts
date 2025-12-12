import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GENERIC_API_DOCUMENTATION } from "@/lib/prompt";
import { CONFIG } from "@/lib/config";

const groq = new Groq({ apiKey: CONFIG.llmConfig.apiKey });

// Conversation memory (consider using Redis/DB in production)
let conversationMemory = [
  { role: "system", content: GENERIC_API_DOCUMENTATION }
];

// =======================
// HELPER FUNCTIONS
// =======================

// Decode protobuf hex names
function decodeProtobufName(nameField: string): string {
  try {
    if (typeof nameField === 'string' && nameField.includes('"value"')) {
      const parsed = JSON.parse(nameField);
      const hexValue = parsed.value;

      if (hexValue) {
        const buffer = Buffer.from(hexValue, 'hex');
        return buffer.toString('utf8');
      }
    }
    return nameField;
  } catch (e) {
    return nameField;
  }
}

// Select most recent entity by created date
function selectLatestEntity(entities: any[]): any {
  if (!entities || entities.length === 0) return null;
  if (entities.length === 1) return entities[0];

  return entities.sort((a, b) => {
    const dateA = new Date(a.created || '1900-01-01').getTime();
    const dateB = new Date(b.created || '1900-01-01').getTime();
    return dateB - dateA;
  })[0];
}

// Resolve variables in any data structure
function resolveVariables(data: any, variables: Record<string, any>): any {
  if (typeof data === 'string') {
    return resolveString(data, variables);
  }

  if (Array.isArray(data)) {
    return data.map(item => resolveVariables(item, variables));
  }

  if (data && typeof data === 'object') {
    const resolved: any = {};
    for (const [key, value] of Object.entries(data)) {
      resolved[key] = resolveVariables(value, variables);
    }
    return resolved;
  }

  return data;
}

// Resolve variable references in strings
function resolveString(str: string, variables: Record<string, any>): any {
  if (typeof str !== 'string') return str;

  const pattern = /\{\{([^}]+)\}\}/g;
  const matches = [...str.matchAll(pattern)];

  if (matches.length === 0) return str;

  // If entire string is a variable, return the value directly
  if (matches.length === 1 && matches[0][0] === str) {
    return getByPath(matches[0][1], variables);
  }

  // Replace variables in string
  let result = str;
  for (const match of matches) {
    const value = getByPath(match[1], variables);
    result = result.replace(match[0], String(value));
  }
  return result;
}

// Get value from nested path like "variable.body[0].id" or "variable[*].field"
function getByPath(path: string, variables: Record<string, any>): any {
  // Handle wildcard array access: variable[*].field
  if (path.includes('[*]')) {
    const [arrayPath, ...fieldParts] = path.split('[*].');
    const fieldPath = fieldParts.join('[*].');

    // Get the array
    let array: any = variables;
    if (arrayPath) {
      const parts = arrayPath.split('.');
      for (const part of parts) {
        array = array[part];
        if (array === undefined) {
          throw new Error(`Variable path not found: ${path} (failed at ${part})`);
        }
      }
    }

    if (!Array.isArray(array)) {
      throw new Error(`Path ${arrayPath} is not an array (got ${typeof array})`);
    }

    // Extract field from each array element
    return array.map(item => {
      let value = item;
      if (fieldPath) {
        const fieldParts = fieldPath.split('.');
        for (const part of fieldParts) {
          const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
          if (arrayMatch) {
            const [, key, index] = arrayMatch;
            value = value[key]?.[parseInt(index)];
          } else {
            value = value[part];
          }
          if (value === undefined) {
            throw new Error(`Variable path not found: ${path} (failed at ${part} in array element)`);
          }
        }
      }
      return value;
    });
  }

  // Regular path: variable.body[0].id
  const parts = path.split('.');
  let value: any = variables;

  for (const part of parts) {
    // Handle array access: variable[0]
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      value = value[key]?.[parseInt(index)];
    } else {
      value = value[part];
    }

    if (value === undefined) {
      throw new Error(`Variable path not found: ${path} (failed at ${part})`);
    }
  }

  return value;
}

// Call your API
async function callGraphAPI(method: string, endpoint: string, body?: any) {
  const url = CONFIG.apiUrl + endpoint;

  console.log(`  📡 ${method} ${endpoint}`);
  if (body) {
    console.log(`  📦 Body:`, JSON.stringify(body, null, 2));
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

// Execute a single step
async function executeStep(step: any, variables: Record<string, any>): Promise<any> {

  // Skip relation steps if the source entity is empty
  if (step.api?.endpoint?.includes('{{') && step.api.endpoint.includes('.body[0].id')) {
    const varName = step.api.endpoint.match(/\{\{([^}]+)\.body\[0\]\.id\}\}/)?.[1];
    if (varName && (!variables[varName]?.body || variables[varName].body.length === 0)) {
      console.log(`  ⚠️ Skipping step ${step.stepNumber} because '${varName}' has no results`);
      variables[step.saveResultAs] = []; // safe empty array
      return [];
    }
  }

  console.log(`\n[Step ${step.stepNumber}] ${step.description}`);

  // Validate HTTP method
  if (!step.api?.method || (step.api.method !== 'POST' && step.api.method !== 'GET')) {
    throw new Error(`Step ${step.stepNumber} has invalid HTTP method`);
  }

  try {
    // Resolve endpoint variables
    let endpoint = resolveString(step.api.endpoint, variables);

    // Detect array iteration patterns in body
    const bodyStr = JSON.stringify(step.api.body || {});
    const arrayPattern = /\{\{([^}]+)\[\*\]\.([^}]+)\}\}/;
    const arrayMatch = bodyStr.match(arrayPattern);

    // ==============================
    // Array iteration (multiple IDs)
    // ==============================
    if (arrayMatch) {
      const arrayVarPath = arrayMatch[1]; // e.g., 'deptRelations'
      const fieldName = arrayMatch[2];    // e.g., 'relatedEntityId'

      console.log(`  🔄 Detected array iteration pattern: ${arrayVarPath}[*].${fieldName}`);

      // Get array values
      let arrayValues: any[];
      try {
        arrayValues = getByPath(`${arrayVarPath}[*].${fieldName}`, variables);
      } catch (e: any) {
        console.error(`  ❌ Failed to resolve array path: ${e.message}`);
        throw e;
      }

      if (!Array.isArray(arrayValues)) {
        throw new Error(`Expected array from path ${arrayVarPath}, got ${typeof arrayValues}`);
      }

      console.log(`  🔄 Iterating over ${arrayValues.length} items`);
      const results: any[] = [];

      for (const currentId of arrayValues) {
        // Construct body for each ID
        const itemBody: Record<string, any> = { ...step.api.body, id: currentId };
        if (fieldName in itemBody) delete itemBody[fieldName];

        const itemResult = await callGraphAPI(step.api.method, endpoint, itemBody);

        // Decode protobuf names and fallback to fetch name if missing
        if (itemResult.body && Array.isArray(itemResult.body)) {
          for (const entity of itemResult.body) {
            if (entity.name) {
              entity.decodedName = decodeProtobufName(entity.name);
            } else if (entity.id) {
              const lookup = await callGraphAPI('POST', '/v1/entities/search', { id: entity.id });
              if (lookup.body?.[0]?.name) {
                entity.decodedName = decodeProtobufName(lookup.body[0].name);
              }
            }
          }
        }

        results.push(itemResult);
      }

      // Flatten all entity bodies and save to variables
      const flattened = results.flatMap(r => r.body || []);
      if (step.saveResultAs) {
        variables[step.saveResultAs] = flattened;
        console.log(`  ✅ Saved ${flattened.length} results as '${step.saveResultAs}'`);
      }

      return flattened;
    }

    // ==============================
    // Single API call (no array iteration)
    // ==============================
    let body = step.api.body && Object.keys(step.api.body).length > 0
      ? resolveVariables(step.api.body, variables)
      : null;

    const result = await callGraphAPI(step.api.method, endpoint, body);

    // Auto-select latest entity if multiple results
    if (step.action === 'search' && result.body && result.body.length > 1) {
      console.log(`  ⚠️  Multiple results (${result.body.length}), selecting latest`);
      result.body = [selectLatestEntity(result.body)];
    }

    if (step.action === 'search' && (!result.body || result.body.length === 0)) {
      console.log(`  ⚠️ Search returned 0 results for '${step.description}'`);
      result.body = [];
    }

    // Auto-decode protobuf names
    if (result.body && Array.isArray(result.body)) {
      result.body = result.body.map((entity: any) => {
        if (entity.name) entity.decodedName = decodeProtobufName(entity.name);
        return entity;
      });
    }

    if (step.saveResultAs) {
      variables[step.saveResultAs] = result;
      console.log(`  ✅ Saved as '${step.saveResultAs}'`);
    }

    return result;

  } catch (error: any) {
    console.error(`  ❌ Step ${step.stepNumber} failed:`, error.message);

    console.log(`  📊 Available variables:`, Object.keys(variables));
    if (error.message.includes('Variable path not found')) {
      const varName = error.message.match(/path not found: ([^\s(]+)/)?.[1];
      if (varName) {
        const baseVar = varName.split('.')[0].split('[')[0];
        console.log(
          `  📊 Structure of '${baseVar}':`,
          JSON.stringify(variables[baseVar], null, 2).substring(0, 500)
        );
      }
    }

    throw error;
  }
}


// Extract JSON from LLM response
function extractJSON(text: string): string | null {
  // Try markdown code blocks first
  let match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) return match[1].trim();

  match = text.match(/```\s*([\s\S]*?)\s*```/);
  if (match) return match[1].trim();

  // Try to find raw JSON
  match = text.match(/\{[\s\S]*\}/);
  if (match) return match[0];

  return null;
}

// Generate natural language response
async function generateFinalAnswer(
  question: string,
  variables: Record<string, any>
): Promise<string> {
  console.log('\n[Generating final answer...]');

  const completion = await groq.chat.completions.create({
    model: CONFIG.llmConfig.model,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that converts query results into natural language answers."
      },
      {
        role: "user",
        content: `Question: "${question}"

Query Results:
${JSON.stringify(variables, null, 2)}

Provide a clear, natural language answer to the question based on these results. 
If the results contain decodedName fields, use those for display.
Be concise but complete.`
      }
    ],
  });

  return completion.choices[0]?.message?.content || "Unable to generate answer.";
}

// =======================
// MAIN ROUTE HANDLER
// =======================

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || question.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Question is required'
      }, { status: 400 });
    }

    console.log('\n' + '='.repeat(80));
    console.log('QUERY:', question);
    console.log('='.repeat(80));

    // Add question to conversation memory
    conversationMemory.push({ role: "user", content: question });

    // Phase 1: Generate plan
    console.log('\n[PHASE 1] Generating execution plan...');

    const planCompletion = await groq.chat.completions.create({
      model: CONFIG.llmConfig.model,
      messages: conversationMemory,
      temperature: 0.1, // Lower temperature for more consistent JSON
    });

    const planText = planCompletion.choices[0]?.message?.content || "";

    // Save plan to memory
    conversationMemory.push({ role: "assistant", content: planText });

    // Extract and parse JSON
    const jsonText = extractJSON(planText);
    if (!jsonText) {
      throw new Error("No JSON found in LLM output");
    }

    let plan: any;
    try {
      plan = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse plan JSON:", e);
      throw new Error("Invalid JSON in plan");
    }

    console.log('✅ Plan generated with', plan.steps?.length || 0, 'steps');

    // Phase 2: Execute plan
    console.log('\n[PHASE 2] Executing plan...');

    const variables: Record<string, any> = {};

    for (const step of plan.steps || []) {
      await executeStep(step, variables);
    }

    console.log('✅ Execution complete');

    // Phase 3: Generate natural language answer
    console.log('\n[PHASE 3] Generating answer...');

    const answer = await generateFinalAnswer(question, variables);

    console.log('✅ Answer generated');
    console.log('📝 FINAL ANSWER:\n', answer);
    console.log('\n' + '='.repeat(80));
    console.log('COMPLETE');
    console.log('='.repeat(80) + '\n');

    return NextResponse.json({
      success: true,
      answer,
      debug: {
        plan: plan.understanding,
        steps: plan.steps.length,
        variables: Object.keys(variables)
      }
    });

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Optional: Clear conversation memory (useful for testing)
export async function DELETE() {
  conversationMemory = [
    { role: "system", content: GENERIC_API_DOCUMENTATION }
  ];

  return NextResponse.json({ success: true, message: "Memory cleared" });
}