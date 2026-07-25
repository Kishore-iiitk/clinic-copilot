import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useCreateSoapNote, useCreatePatientNote, useGetPatient, getGetPatientNotesQueryKey } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Save, Loader2, ArrowLeft, Stethoscope } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function VoiceNote() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { role } = useRole();

  // Guard: nurses should not access this page
  useEffect(() => {
    if (role === "Nurse") {
      setLocation(`/patients/${id}`);
    }
  }, [role, id, setLocation]);

  const { data: patient } = useGetPatient(Number(id), { query: { enabled: !!id } });

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [soapData, setSoapData] = useState<{
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const createSoapNote = useCreateSoapNote();
  const createPatientNote = useCreatePatientNote();

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) setTranscript((prev) => prev + " " + final);
        setInterimTranscript(interim);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      setInterimTranscript("");
      setSoapData(null);
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleStructure = () => {
    const fullText = (transcript + " " + interimTranscript).trim();
    if (!fullText) return;
    createSoapNote.mutate(
      {
        data: {
          transcript: fullText,
          patientName: patient?.name,
          diagnosis: patient?.diagnosis,
        },
      },
      { onSuccess: (data) => setSoapData(data) }
    );
  };

  const handleSave = () => {
    if (!soapData) return;
    createPatientNote.mutate(
      {
        id: Number(id),
        data: {
          role: "Doctor",
          rawText: transcript.trim(),
          isSoap: true,
          soapSubjective: soapData.subjective,
          soapObjective: soapData.objective,
          soapAssessment: soapData.assessment,
          soapPlan: soapData.plan,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPatientNotesQueryKey(Number(id)) });
          setLocation(`/patients/${id}`);
        },
      }
    );
  };

  const hasSpeechSupport = typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  if (role === "Nurse") return null; // redirect in progress

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <Link
          href={`/patients/${id}`}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Doctor SOAP Note</h1>
          </div>
          <p className="text-sm font-medium text-gray-500">{patient?.name}</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
          Doctor only
        </span>
      </div>

      {/* Mic card */}
      <Card className="border-gray-100 shadow-sm bg-white">
        <CardContent className="p-8 flex flex-col items-center">
          {hasSpeechSupport ? (
            <>
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-40 animate-pulse" />
                )}
                <button
                  onClick={toggleRecording}
                  className={cn(
                    "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                    isRecording
                      ? "bg-red-500 text-white scale-105"
                      : "bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  {isRecording ? (
                    <Square className="w-10 h-10 fill-current" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </button>
              </div>
              <p className="mt-6 text-sm font-bold uppercase tracking-wider text-gray-400">
                {isRecording ? "Listening... tap to stop" : "Tap to start dictating"}
              </p>
            </>
          ) : (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center">
              Your browser does not support voice input. Please type your note below.
            </p>
          )}

          {/* Transcript area */}
          <div className="w-full mt-8 bg-gray-50 border border-gray-100 rounded-xl p-5 min-h-[160px] text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap shadow-inner">
            {!hasSpeechSupport ? (
              <textarea
                className="w-full bg-transparent outline-none resize-none min-h-[130px] text-gray-800 placeholder:text-gray-400"
                placeholder="Type your clinical note here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            ) : (
              <>
                {transcript}
                <span className="text-gray-400">{interimTranscript}</span>
                {!transcript && !interimTranscript && !isRecording && (
                  <span className="text-gray-400 italic">
                    Voice transcript will appear here. Speak naturally — describe symptoms, findings, and your plan.
                  </span>
                )}
              </>
            )}
          </div>

          {(transcript || interimTranscript) && !isRecording && !soapData && (
            <Button
              onClick={handleStructure}
              disabled={createSoapNote.isPending}
              className="w-full mt-6 shadow-md"
              size="lg"
            >
              {createSoapNote.isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : null}
              Structure as SOAP Note
            </Button>
          )}
        </CardContent>
      </Card>

      {/* SOAP output */}
      {soapData && (
        <Card className="border-gray-100 shadow-sm bg-white">
          <CardContent className="p-6 md:p-8 space-y-6">
            <h3 className="font-bold text-xl border-b border-gray-100 pb-3 text-gray-900">
              Structured SOAP Note
            </h3>

            <div className="space-y-5">
              {(
                [
                  { key: "subjective" as const, label: "Subjective", color: "blue" },
                  { key: "objective" as const, label: "Objective", color: "gray" },
                  { key: "assessment" as const, label: "Assessment", color: "amber" },
                  { key: "plan" as const, label: "Plan", color: "green" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                    {label}
                  </label>
                  <textarea
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm leading-relaxed resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={soapData[key]}
                    onChange={(e) =>
                      setSoapData({ ...soapData, [key]: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={handleSave}
              disabled={createPatientNote.isPending}
              className="w-full mt-8 shadow-md h-14 text-base"
              size="lg"
            >
              {createPatientNote.isPending ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <Save className="w-6 h-6 mr-2" />
              )}
              Save to Patient Record
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
