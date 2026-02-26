module.exports = async function handler(req, res) {
if (req.method !== “POST”) {
return res.status(405).json({ error: “Method not allowed” });
}

var context = req.body.context;

if (!context) {
return res.status(400).json({ error: “No context provided” });
}

var systemPrompt = “You are a senior personalisation strategist with deep expertise in CRO, behavioural analytics, and customer journey optimisation. You analyse businesses and produce sharp, actionable personalisation audits. Your audits are data-informed, specific, and commercially focused. You avoid generic advice. You must respond ONLY with a valid JSON object. No markdown, no preamble, no explanation outside the JSON. Return this exact structure: { overallScore: number 1-10, scoreLabel: one of Untapped Potential or Early Stage or Developing or Proficient or Advanced, scoreSummary: 2 sentences on overall personalisation maturity, sections: [ { id: segmentation, title: Audience Segmentation, icon: O, items: [ { title: short finding title, detail: specific actionable insight 1-2 sentences, priority: High or Medium or Low } ] }, { id: abtesting, title: AB Testing Opportunities, icon: +, items: [] }, { id: funnel, title: Funnel Dropoff Risks, icon: v, items: [] }, { id: quickwins, title: Quick Wins, icon: *, items: [] } ] } Each section must have 3-4 items. Return valid JSON only.”;

var requestBody = {
model: “llama3-70b-8192”,
temperature: 0.7,
max_tokens: 1500,
messages: [
{ role: “system”, content: systemPrompt },
{ role: “user”, content: “Audit this business and return JSON:\n\n” + context }
]
};

try {
var response = await fetch(“https://api.groq.com/openai/v1/chat/completions”, {
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“Authorization”: “Bearer “ + process.env.GROQ_API_KEY
},
body: JSON.stringify(requestBody)
});

var data = await response.json();

if (!response.ok) {
  return res.status(500).json({ error: data.error ? data.error.message : "Groq API error" });
}

var raw = data.choices[0].message.content;
var clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
var audit = JSON.parse(clean);

return res.status(200).json(audit);

} catch (err) {
console.error(err);
return res.status(500).json({ error: “Failed to generate audit” });
}
};
