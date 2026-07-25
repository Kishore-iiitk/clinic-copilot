import { Router, type IRouter } from "express";
import { groq, MODEL, MODEL_FAST } from "../lib/groq";
import { ExplainRiskBody, CreateSoapNoteBody, TranslateTextBody } from "../validators";

const router: IRouter = Router();

// POST /ai/explain-risk
router.post("/ai/explain-risk", async (req, res): Promise<void> => {
  const body = ExplainRiskBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { patientName, diagnosis, vitalsHistory } = body.data;
  const recent = vitalsHistory.slice(-6);
  const vitalsText = recent
    .map(
      (v, i) =>
        `Reading ${i + 1}: HR ${v.heartRate} bpm, SpO2 ${v.spo2}%, BP ${v.bpSystolic}/${v.bpDiastolic} mmHg, Temp ${v.temperature}°C, RR ${v.respiratoryRate}/min`
    )
    .join("\n");

  const prompt = `You are a clinical AI assistant in a hospital ward. Analyze these recent vitals for ${patientName ?? "the patient"}${diagnosis ? ` (${diagnosis})` : ""} and write a concise, plain-language explanation (2-3 sentences max) of why this patient may be deteriorating. Be specific about which numbers are concerning and what pattern you see. Write for a nurse who will read this quickly during rounds.

Recent vitals (oldest to newest):
${vitalsText}

Respond with only the explanation text, no preamble.`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    const explanation = response.choices[0]?.message?.content?.trim() ?? "Unable to generate explanation.";
    res.json({ explanation });
  } catch (err) {
    req.log.error({ err }, "Groq explain-risk error");
    res.status(500).json({ explanation: "AI explanation temporarily unavailable." });
  }
});

// POST /ai/soap-note
router.post("/ai/soap-note", async (req, res): Promise<void> => {
  const body = CreateSoapNoteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { transcript, patientName, diagnosis } = body.data;

  const prompt = `You are a clinical documentation AI. Convert the following voice note or shorthand text from a doctor/nurse into a structured SOAP note. Be concise and clinical.

Patient: ${patientName ?? "Unknown"}${diagnosis ? ` (${diagnosis})` : ""}
Raw note: "${transcript}"

Respond ONLY with valid JSON in exactly this format:
{
  "subjective": "What the patient reports (symptoms, complaints, history)",
  "objective": "Measurable findings (vitals, exam findings, lab values)",
  "assessment": "Clinical interpretation and diagnosis",
  "plan": "Treatment plan and next steps"
}`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    let parsed: { subjective: string; objective: string; assessment: string; plan: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        subjective: "Unable to parse transcript.",
        objective: "N/A",
        assessment: "N/A",
        plan: "Please re-dictate the note.",
      };
    }

    res.json({
      subjective: parsed.subjective ?? "",
      objective: parsed.objective ?? "",
      assessment: parsed.assessment ?? "",
      plan: parsed.plan ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Groq soap-note error");
    res.status(500).json({
      subjective: "AI temporarily unavailable.",
      objective: "",
      assessment: "",
      plan: "Please try again.",
    });
  }
});

// POST /ai/translate
router.post("/ai/translate", async (req, res): Promise<void> => {
  const body = TranslateTextBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { text } = body.data;

  const prompt = `Translate the following medical text from English to Tamil. Keep medical terms accurate and use clear, simple Tamil that a healthcare worker would understand. Respond with only the Tamil translation, nothing else.

Text to translate:
${text}`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL_FAST,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.1,
    });

    const translated = response.choices[0]?.message?.content?.trim() ?? text;
    res.json({ translated });
  } catch (err) {
    req.log.error({ err }, "Groq translate error");
    res.status(500).json({ translated: text });
  }
});

export default router;
