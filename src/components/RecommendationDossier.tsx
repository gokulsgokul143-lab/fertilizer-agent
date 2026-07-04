import React from "react";
import { FertilizerRecommendation } from "../types";
import { 
  Sprout, 
  TrendingUp, 
  Droplet, 
  Activity, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Sparkles, 
  ArrowLeft, 
  CornerDownRight,
  MessageSquare,
  FileText
} from "lucide-react";

interface RecommendationDossierProps {
  data: FertilizerRecommendation;
  onBack: () => void;
  onAskAgent: (question: string) => void;
}

export default function RecommendationDossier({ data, onBack, onAskAgent }: RecommendationDossierProps) {
  // Parse NPK ratio safely to draw custom telemetry bars
  const parseNPK = (npkStr: string) => {
    const parts = npkStr.split("-").map(p => parseInt(p.trim()) || 0);
    const n = parts[0] || 0;
    const p = parts[1] || 0;
    const k = parts[2] || 0;
    const maxVal = Math.max(n, p, k, 10); // Normalizer
    return {
      n, p, k,
      nPercent: Math.min(100, Math.round((n / maxVal) * 100)),
      pPercent: Math.min(100, Math.round((p / maxVal) * 100)),
      kPercent: Math.min(100, Math.round((k / maxVal) * 100))
    };
  };

  const npkTelemetry = parseNPK(data.npkRatio);

  const getStatusColor = (status: string) => {
    const lower = status.toLowerCase();
    if (lower.includes("deficient") || lower.includes("low")) return "text-orange-400 border-orange-500/20 bg-orange-500/10";
    if (lower.includes("excessive") || lower.includes("high")) return "text-red-400 border-red-500/20 bg-red-500/10";
    if (lower.includes("optimal") || lower.includes("good")) return "text-green-400 border-green-500/20 bg-green-500/10";
    return "text-slate-400 border-[#1F2922] bg-[#141815]";
  };

  return (
    <div id="recommendation-dossier" className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          id="dossier-back-btn"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white bg-[#0F1210] border border-[#1F2922] rounded-xl hover:bg-[#141815] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> New Recommendation
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Expert Recommendation Loaded</span>
        </div>
      </div>

      {/* Hero Overview */}
      <div className="bg-gradient-to-r from-[#0F1210] to-[#141815] border border-[#1F2922] rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                Botanical Profile
              </span>
              <span className="text-xs text-slate-400">Analysis generated on {new Date().toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {data.plantName || "Analyzed Subject"}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              {data.summary}
            </p>
          </div>

          {/* NPK Telemetry Meter */}
          <div className="w-full md:w-auto md:min-w-[280px] bg-[#0A0C0B] border border-[#1F2922] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F2922]">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target N-P-K Formula</span>
              <span className="text-lg font-mono font-bold text-green-400">{data.npkRatio}</span>
            </div>
            <div className="space-y-3">
              {/* Nitrogen */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Nitrogen (N) - Growth</span>
                  <span className="font-mono text-slate-400">{npkTelemetry.n}</span>
                </div>
                <div className="h-2 bg-[#141815] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${npkTelemetry.nPercent}%` }}></div>
                </div>
              </div>

              {/* Phosphorus */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Phosphorus (P) - Roots/Flowers</span>
                  <span className="font-mono text-slate-400">{npkTelemetry.p}</span>
                </div>
                <div className="h-2 bg-[#141815] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${npkTelemetry.pPercent}%` }}></div>
                </div>
              </div>

              {/* Potassium */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Potassium (K) - Strength/Vigor</span>
                  <span className="font-mono text-slate-400">{npkTelemetry.k}</span>
                </div>
                <div className="h-2 bg-[#141815] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${npkTelemetry.kPercent}%` }}></div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal italic pt-1">
              {data.npkExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Soil & Nutrients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Chemistry & Primary Nutrients */}
        <div className="bg-[#0F1210] border border-[#1F2922] rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#1F2922]">
            <Activity className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white">Soil Chemistry & Primary Telemetry</h3>
          </div>

          <div className="p-4 rounded-xl bg-[#141815] border border-[#1F2922] space-y-2">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Medium Assessment</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{data.soilChemistry}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Primary Nutrient Profiles</h4>
            <div className="space-y-2">
              {data.primaryNutrients.map((item, index) => (
                <div key={index} className="p-3.5 rounded-lg bg-[#141815] border border-[#1F2922] flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-sm">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.nutrient}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic">{item.role}</p>
                    <p className="text-xs text-slate-300 mt-1 leading-normal">{item.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Micronutrients & Sources */}
        <div className="bg-[#0F1210] border border-[#1F2922] rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[#1F2922]">
              <Layers className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">Micronutrients & Specialized Feed</h3>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Secondary & Trace Minerals</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.micronutrients.map((micro, index) => (
                  <div key={index} className="p-3 rounded-lg bg-[#141815] border border-[#1F2922] space-y-1 text-xs">
                    <span className="font-bold text-white text-sm">{micro.nutrient}</span>
                    <p className="text-slate-400 leading-normal">{micro.importance}</p>
                    <div className="flex gap-1.5 items-start text-green-400 pt-1">
                      <CornerDownRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] leading-normal">{micro.remedy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Sources Selection */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Approved Input Channels</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Organic Sources */}
                <div className="p-4 rounded-xl bg-[#141815] border border-green-500/10 space-y-2">
                  <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Recommended Organics</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {data.fertilizerSources.organic.map((org, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{org}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Synthetic Sources */}
                <div className="p-4 rounded-xl bg-[#141815] border border-blue-500/10 space-y-2">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Synthetic Alternates</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {data.fertilizerSources.synthetic.map((syn, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>{syn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feeding Routine & Hydration Adjustments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <div className="bg-[#0F1210] border border-[#1F2922] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <Calendar className="w-4.5 h-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Frequency Interval</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{data.feedingSchedule.frequency}</div>
          <p className="text-xs text-slate-400">Avoid over-application. Maintain consistency to minimize osmotic stress on root hairs.</p>
        </div>

        {/* Dosage */}
        <div className="bg-[#0F1210] border border-[#1F2922] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <Clock className="w-4.5 h-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Prescribed Dosage Strength</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{data.feedingSchedule.dosage}</div>
          <p className="text-xs text-slate-400">Apply always with water dilution to prevent leaf tip burn and toxic salt crystallization.</p>
        </div>

        {/* Water absorption */}
        <div className="bg-[#0F1210] border border-[#1F2922] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <Droplet className="w-4.5 h-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Hydration Adjustments</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{data.wateringAdjustments}</p>
        </div>
      </div>

      {/* Immediate Action Plan Timeline */}
      <div className="bg-[#0F1210] border border-[#1F2922] rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2 pb-5 border-b border-[#1F2922] mb-6">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-bold text-white">Execution Routine (Immediate Steps)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {data.actionPlan.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-200 leading-relaxed">{step}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Expert Pro Tips */}
          <div className="bg-[#141815] border border-green-500/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-green-400">
              <Sparkles className="w-4.5 h-4.5" />
              <span className="text-xs font-bold uppercase tracking-widest">Botanist's Insider Pro-Tips</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              {data.expertTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-green-500 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Suggested Chat prompts to explore further */}
      <div className="bg-[#0F1210] border border-[#1F2922] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-green-400" />
            Have questions about these instructions?
          </h4>
          <p className="text-xs text-slate-400">Ask the AI Botanist to clarify concentrations, explain NPK interactions, or customize for your weather!</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAskAgent(`Can you explain why you chose NPK ratio ${data.npkRatio} instead of something more balanced like 10-10-10?`)}
            className="px-3 py-1.5 rounded-lg bg-[#141815] hover:bg-[#1F2922] border border-[#1F2922] text-xs font-semibold text-slate-300 hover:text-green-400 transition-all cursor-pointer"
          >
            "Why this N-P-K ratio?"
          </button>
          <button
            onClick={() => onAskAgent(`What signs should I look for to know if this fertilizer plan is working or if I am overfeeding?`)}
            className="px-3 py-1.5 rounded-lg bg-[#141815] hover:bg-[#1F2922] border border-[#1F2922] text-xs font-semibold text-slate-300 hover:text-green-400 transition-all cursor-pointer"
          >
            "How to check for overfeeding?"
          </button>
        </div>
      </div>
    </div>
  );
}
