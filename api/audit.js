module.exports = async function handler(req, res) {
// Only allow POST
if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

const { context } = req.body;

if (!context) {
return res.status(400).json({ error: ‘No context provided’ });
}

const systemPrompt = `You are a senior personalisation strategist with deep expertise in CRO, behavioural analytics, and customer journey optimisation — similar to specialists at Dynamic Yield, Optimizely, or Segment. You analyse businesses and produce sharp, actionable personalisation audits.

Your audits are data-informed, specific, and commercially focused. You avoid generic advice. Every recommendation should feel tailored to the specific business context provided.

You must respond ONLY with a valid JSON object. No markdown, no preamble, no explanation outside the JSON.

Return this exact structure:
{
“overallScore”: <number 1-10>,
“scoreLabel”: “<one of: Untapped Potential | Early Stage | Developing | Proficient | Advanced>”,
“scoreSummary”: “<2 sentences on overall personalisation maturity>”,
“sections”: [
{
“id”: “segmentation”,
“title”: “Audience Segmentation”,
“icon”: “◈”,
“items”: [
{
“title”: “<short finding title>”,
“detail”: “<specific, actionable insight — 1-2 sentences>”,
“priority”: “<High | Medium | Low>”
}
]
},
{
“id”: “abtesting”,
“title”: “A/B Testing Opportunities”,
“icon”: “⊞”,
“items”: […]
},
{
“id”: “funnel”,
“title”: “Funnel Drop-off Risks”,
“icon”: “↘”,
“items”: […]
},
{
“id”: “quickwins”,
“title”: “Quick Wins”,
“icon”: “◎”,
“items”: […]
}
]
}

Each section must have 3-4 items. Be specific and commercially sharp.`;

try {
const response = await fetch(‘https://api.groq.com/openai/v1/chat/completions’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘Authorization’: `Bearer ${process.env.GROQ_API_KEY}`
},
body: JSON.stringify({
model: ‘llama3-70b-8192’,
temperature: 0.7,
max_tokens: 1500,
messages: [
{ role: ‘system’, content: systemPrompt },
{ role: ‘user’, content: `Please audit the following business context and return a personalisation audit as JSON:\n\n${context}` }
]
})
});

```
const data = await response.json();

if (!response.ok) {
  return res.status(500).json({ error: data.error?.message || 'Groq API error' });
}

const raw = data.choices?.[0]?.message?.content || '';
const clean = raw.replace(/```json|```/g, '').trim();
const audit = JSON.parse(clean);

return res.status(200).json(audit);
```

} catch (err) {
console.error(err);
return res.status(500).json({ error: ‘Failed to generate audit’ });
}
}
