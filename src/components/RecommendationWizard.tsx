import React, { useState } from "react";
import { PlantProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Sprout, Layers, ShieldAlert, Droplets, Thermometer, Sparkles, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";

interface RecommendationWizardProps {
  onSubmit: (profile: PlantProfile) => void;
  isLoading: boolean;
}

export default function RecommendationWizard({ onSubmit, isLoading }: RecommendationWizardProps) {
  const [step, setStep] = useState(1);
  const [plantName, setPlantName] = useState("");
  const [plantVariety, setPlantVariety] = useState("");
  const [medium, setMedium] = useState("Soil");
  const [stage, setStage] = useState("Vegetative Phase");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [soilType, setSoilType] = useState("Loam (Balanced & fertile)");
  const [pH, setPH] = useState("Neutral (6.5 - 7.2)");
  const [climate, setClimate] = useState("Indoor (Climate controlled)");
  const [organicPreference, setOrganicPreference] = useState("No Preference");
  const [language, setLanguage] = useState("Thanglish");

  const symptomsList = [
    "Yellow leaves (chlorosis)",
    "Slow or stunted growth",
    "Purple or dark red leaves",
    "Brown leaf margins / burnt tips",
    "Pale green lower leaves",
    "Leaf curling or twisting",
    "Poor flowering / blossom drop",
    "Weak stems / drooping branches"
  ];

  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      plantName,
      plantVariety: plantVariety || "Common Variety",
      medium,
      stage,
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ["None (Optimal maintenance)"],
      soilType,
      pH,
      climate,
      organicPreference,
      language,
    });
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
        {[1, 2, 3, 4].map((num) => (
          <React.Fragment key={num}>
            <div className="flex flex-col items-center">
              <div
                id={`step-indicator-${num}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                  step === num
                    ? "bg-green-500 text-[#0A0C0B] border-green-500 shadow-md shadow-green-500/20"
                    : step > num
                    ? "bg-green-500/10 text-green-400 border-green-500/40"
                    : "bg-[#0C0F0D] text-slate-500 border-[#1F2922]"
                }`}
              >
                {num}
              </div>
              <span className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${
                step === num ? "text-green-400" : "text-slate-500"
              }`}>
                {num === 1 ? "Plant" : num === 2 ? "Stage" : num === 3 ? "Soil/pH" : "Inputs"}
              </span>
            </div>
            {num < 4 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                  step > num ? "bg-green-500/40" : "bg-[#1F2922]"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div id="recommendation-wizard-card" className="bg-[#0F1210] rounded-2xl border border-[#1F2922] shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#E0E7E1] tracking-tight flex items-center justify-center gap-2">
          <Sprout className="w-6 h-6 text-green-400" />
          Recommendation Wizard
        </h2>
        <p className="text-slate-400 text-sm mt-1">Configure your botanical profile to query the expert agronomist agent.</p>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label htmlFor="plant-name-input" className="block text-sm font-semibold text-slate-300">
                  What plant are you growing? <span className="text-green-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <input
                    id="plant-name-input"
                    type="text"
                    required
                    placeholder="e.g., Tomato, Monstera, Rose, Basil..."
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-[#141815] border border-[#1F2922] rounded-xl focus:outline-none focus:border-green-500/50 focus:bg-[#0C0F0D] transition-all text-[#E0E7E1]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="plant-variety-input" className="block text-sm font-semibold text-slate-300">
                  Variety / Cultivar <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  id="plant-variety-input"
                  type="text"
                  placeholder="e.g., Beefsteak, Variegata, English tea..."
                  value={plantVariety}
                  onChange={(e) => setPlantVariety(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-[#141815] border border-[#1F2922] rounded-xl focus:outline-none focus:border-green-500/50 focus:bg-[#0C0F0D] transition-all text-[#E0E7E1]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Growth Medium</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["Soil", "Hydroponic", "Coco Coir / Perlite"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      id={`medium-${option.toLowerCase().replace(/\s/g, "-")}`}
                      onClick={() => setMedium(option)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        medium === option
                          ? "border-green-500/50 bg-green-500/10 text-green-400 font-semibold"
                          : "border-[#1F2922] bg-[#141815] hover:bg-[#1F2922] text-slate-300"
                      }`}
                    >
                      <Layers className={`w-5 h-5 ${medium === option ? "text-green-400" : "text-slate-500"}`} />
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Current Growth Stage</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: "Seedling / Propagating", desc: "Early roots & small initial leaves" },
                    { name: "Vegetative Phase", desc: "Rapid foliage & stem development" },
                    { name: "Flowering / Budding", desc: "Blossom production, pre-fruitage" },
                    { name: "Fruiting / Ripening", desc: "Developing crops or seeds" },
                    { name: "Senescent / Maintenance", desc: "Dormancy or post-harvest rest" }
                  ].map((stg) => (
                    <button
                      key={stg.name}
                      type="button"
                      id={`stage-${stg.name.toLowerCase().replace(/\s/g, "-").replace(/\//g, "-")}`}
                      onClick={() => setStage(stg.name)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-0.5 cursor-pointer ${
                        stage === stg.name
                          ? "border-green-500/50 bg-green-500/10 text-green-400 font-semibold"
                          : "border-[#1F2922] bg-[#141815] hover:bg-[#1F2922] text-slate-300"
                      }`}
                    >
                      <span className="text-sm font-semibold">{stg.name}</span>
                      <span className="text-xs text-slate-400">{stg.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-slate-400" />
                  Are you observing any health symptoms?
                </label>
                <p className="text-xs text-slate-400">Select all that apply to guide deficiency analysis.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {symptomsList.map((symptom) => {
                    const isSelected = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        type="button"
                        id={`symptom-${symptom.toLowerCase().replace(/\s/g, "-").replace(/\//g, "-").replace(/\(/g, "").replace(/\)/g, "")}`}
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                            : "bg-[#141815] border-[#1F2922] text-slate-300 hover:bg-[#1F2922]"
                        }`}
                      >
                        {symptom}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label htmlFor="soil-type-select" className="block text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-green-400" /> Soil/Substrate Type
                </label>
                <select
                  id="soil-type-select"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-[#141815] border border-[#1F2922] rounded-xl focus:outline-none focus:border-green-500/50 focus:bg-[#0C0F0D] text-[#E0E7E1] text-sm"
                >
                  <option>Loam (Balanced & fertile)</option>
                  <option>Clay (Heavy, poor drainage, nutrient-rich)</option>
                  <option>Sandy (Light, fast draining, nutrient-poor)</option>
                  <option>Silt (Fine particle, moisture holding)</option>
                  <option>Inert/Soilless (Coco, peat, hydro solution)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="ph-select" className="block text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-green-400" /> Measured pH Level
                </label>
                <select
                  id="ph-select"
                  value={pH}
                  onChange={(e) => setPH(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-[#141815] border border-[#1F2922] rounded-xl focus:outline-none focus:border-green-500/50 focus:bg-[#0C0F0D] text-[#E0E7E1] text-sm"
                >
                  <option>Very Acidic (&lt; 5.5) - Needs lime/alkalizer</option>
                  <option>Slightly Acidic (5.5 - 6.5) - Standard for many plants</option>
                  <option>Neutral (6.5 - 7.2) - Balanced</option>
                  <option>Slightly Alkaline (7.2 - 8.0)</option>
                  <option>Very Alkaline (&gt; 8.0) - Needs sulfur/acidifier</option>
                  <option>Unknown / Unmeasured</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="climate-select" className="block text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-green-400" /> Environment / Climate
                </label>
                <select
                  id="climate-select"
                  value={climate}
                  onChange={(e) => setClimate(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-[#141815] border border-[#1F2922] rounded-xl focus:outline-none focus:border-green-500/50 focus:bg-[#0C0F0D] text-[#E0E7E1] text-sm"
                >
                  <option>Indoor (Climate controlled, artificial light)</option>
                  <option>Outdoor (Sunny & warm / tropical)</option>
                  <option>Outdoor (Temperate & humid)</option>
                  <option>Greenhouse / Poly-house</option>
                  <option>Arid / Desert (Dry air, intense sunlight)</option>
                </select>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Fertilizer Preference</label>
                <p className="text-xs text-slate-400 mb-2">Our agents will optimize sources based on your preference.</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: "Strictly Organic", label: "Strictly Organic Sources", desc: "Bone meal, fish emulsion, compost tea, bat guano, kelp." },
                    { id: "Standard Synthetic", label: "Synthetic Inputs", desc: "Highly precise, concentrated mineral salts for rapid absorption." },
                    { id: "Hybrid / Mixed", label: "Hybrid / Organic-Synthetic Mix", desc: "Combine organics for soil life and synthetics for immediate boost." },
                    { id: "No Preference", label: "No Preference (Most effective recommendations)", desc: "Let the AI choose the most optimal ingredients for this stage." }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      id={`pref-${opt.id.toLowerCase().replace(/\s/g, "-").replace(/\//g, "-")}`}
                      onClick={() => setOrganicPreference(opt.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-0.5 cursor-pointer ${
                        organicPreference === opt.id
                          ? "border-green-500/50 bg-green-500/10 text-green-400 font-semibold"
                          : "border-[#1F2922] bg-[#141815] hover:bg-[#1F2922] text-slate-300"
                      }`}
                    >
                      <span className="font-semibold text-sm flex items-center gap-1.5">
                        <Sparkles className={`w-4 h-4 ${organicPreference === opt.id ? "text-green-400" : "text-slate-500"}`} />
                        {opt.label}
                      </span>
                      <span className="text-xs text-slate-400 pl-5.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Preferred Response Language</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "English", label: "English", desc: "Scientific English" },
                    { id: "Thanglish", label: "Thanglish", desc: "Conversational Tamil + English" }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      id={`lang-pref-${lang.id.toLowerCase()}`}
                      onClick={() => setLanguage(lang.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-0.5 cursor-pointer ${
                        language === lang.id
                          ? "border-green-500/50 bg-green-500/10 text-green-400 font-semibold"
                          : "border-[#1F2922] bg-[#141815] hover:bg-[#1F2922] text-slate-300"
                      }`}
                    >
                      <span className="font-semibold text-xs">{lang.label}</span>
                      <span className="text-[10px] text-slate-400">{lang.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary overview before submitting */}
              <div className="bg-[#141815] rounded-xl p-4 border border-[#1F2922] text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-[#E0E7E1] text-sm mb-1">Dossier Request Overview:</div>
                <div><span className="font-medium">Plant:</span> {plantName || "Not specified"} ({plantVariety || "Common"})</div>
                <div><span className="font-medium">System:</span> {medium} | {stage}</div>
                <div><span className="font-medium">Soil Chemistry:</span> {soilType} (pH: {pH})</div>
                <div><span className="font-medium">Preferences:</span> {organicPreference} (Language: {language})</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div id="wizard-navigation-buttons" className="flex items-center justify-between pt-4 border-t border-[#1F2922]">
          {step > 1 ? (
            <button
              type="button"
              id="wizard-back-button"
              onClick={handlePrev}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              id="wizard-next-button"
              onClick={handleNext}
              disabled={step === 1 && !plantName}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all shadow-md shadow-green-900/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              id="wizard-submit-button"
              disabled={isLoading || !plantName}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-green-500 text-[#0A0C0B] hover:bg-green-400 rounded-xl transition-all shadow-lg shadow-green-950/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-[#0A0C0B]" />
                  Generating Dossier...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Recommendation
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
