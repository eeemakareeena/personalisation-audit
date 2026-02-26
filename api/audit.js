module.exports = async function (req, res){
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
  var response = await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method: "POST",
    headers:{
      "Content-Type": "application/json",
      "Authorization":"Bearer" + process.env.GROQ_API_KEY
    },
    body: JSON.stringify({
      model:"llama3-70b-8192",
      max_tokens: 1500,
      messages: [{role:"user", content: prompt}]
    })
  });
  var data = await response.json();
  if(!response.ok){
    res.status(500).json({error:"Groq error"+JSON.stringify(data.error)});
    return;
  }
  var text = data.choices[0].message.content;
  text = text.replace(/'''json/g,"").replace(/'''/g,"").trim();
  var audit = JSON.parse(text);
  res.status(200).json(audit);
} catch(err){
  console.error(err);
  res.status(500).json({error:err.message});
}
};