module.exports = async function (req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  var context = req.body && req.body.context;
  if (!context) {
    res.status(400).json({ error: "No context provided" });
    return;
  }

  var key = process.env.GROQ_API_KEY;
  if (!key) {
    res.status(500).json({ error: "API key not configured" });
    return;
  }

  var prompt = "You are a senior personalisation strategist. Analyse the business context below and return ONLY a valid JSON object. No markdown, no backticks, no explanation. Just raw JSON.\n\nReturn exactly this structure:\n{\"overallScore\":7,\"scoreLabel\":\"Developing\",\"scoreSummary\":\"Two sentence summary here.\",\"sections\":[{\"id\":\"segmentation\",\"title\":\"Audience Segmentation\",\"icon\":\"S\",\"items\":[{\"title\":\"Finding title\",\"detail\":\"Actionable insight here.\",\"priority\":\"High\"}]},{\"id\":\"abtesting\",\"title\":\"AB Testing Opportunities\",\"icon\":\"A\",\"items\":[{\"title\":\"Finding title\",\"detail\":\"Actionable insight here.\",\"priority\":\"Medium\"}]},{\"id\":\"funnel\",\"title\":\"Funnel Dropoff Risks\",\"icon\":\"F\",\"items\":[{\"title\":\"Finding title\",\"detail\":\"Actionable insight here.\",\"priority\":\"High\"}]},{\"id\":\"quickwins\",\"title\":\"Quick Wins\",\"icon\":\"Q\",\"items\":[{\"title\":\"Finding title\",\"detail\":\"Actionable insight here.\",\"priority\":\"Low\"}]}]}\n\nEach section must have 3 to 4 items. Priority must be High, Medium, or Low.\n\nBusiness context:\n" + context;

  try {
    var response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    var data = await response.json();

    if (!response.ok) {
      res.status(500).json({ error: "API error: " + (data.error ? data.error.message : "unknown") });
      return;
    }

    var text = data.choices[0].message.content.trim();
    var start = text.indexOf("{");
    var end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      res.status(500).json({ error: "Invalid response format" });
      return;
    }
    text = text.substring(start, end + 1);
    var audit = JSON.parse(text);
    res.status(200).json(audit);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};