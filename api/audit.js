module.exports = async function (req, res){
  var key = "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";
  if(!key){
    res.status(500).json({error:"GROQ_API_KEY is not set"});
    return;
  }
if(req.method !== "POST"){
  res.status(405).json({error:"Method not allowed"});
  return;
}
var context = req.body && req.body.context;
if(!context){
  res.status(400).json({error:"No context provided"});
  return;
}
var prompt = "You are a senior personalisation strategis. Analyse the following business context and return ONLY a valid JSON object with this structure: {overallScore: number, scoreLabel: string, scoreSummary: string, sections: [{id: string, title: string, icon: string, items: [{title: string, detail: string, priority: string}]}]}. The sections must be: segmentation, abtesting, funnel, quickwins. Each section needs 3 to 4 items. Priority values must be High, Medium, or Low. Return JSON only, no markedown. \n\nBusiness context:\n" + context;
try{
  var response = await fetch("https://api.anthropic.com/v1/messages",{
    method: "POST",
    headers:{
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model:"claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{role:"user", content: prompt}]
    })
  });
  var data = await response.json();
  if(!response.ok){
    res.status(500).json({error:"Groq error"+JSON.stringify(data.error)});
    return;
  }
  var text = data.content[0].text;
  text = text.replace(/'''json/g,"").replace(/'''/g,"").trim();
  var audit = JSON.parse(text);
  res.status(200).json(audit);
} catch(err){
  console.error(err);
  res.status(500).json({error:err.message});
}
};
