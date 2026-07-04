import { useState, useEffect, useRef } from "react";
import { PlantProfile, FertilizerRecommendation, ChatMessage } from "./types";
import RecommendationWizard from "./components/RecommendationWizard";
import RecommendationDossier from "./components/RecommendationDossier";
import { 
  Sprout, 
  MessageSquare, 
  Compass, 
  Layers, 
  HelpCircle, 
  Activity, 
  Send, 
  Trash2, 
  BookOpen, 
  User, 
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  BarChart4,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Application State
  const [profile, setProfile] = useState<PlantProfile | null>(null);
  const [recommendation, setRecommendation] = useState<FertilizerRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // History list to switch between profiles
  const [history, setHistory] = useState<FertilizerRecommendation[]>([]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with some friendly intro message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          id: "welcome",
          role: "model",
          text: "Welcome to Flora AI! Naan unga personal Botanical & Agronomy AI agent. Inga unga plant details-ah wizard-la configure panni detailed fertilizer dossiers peralam, illati plant health, soil pH, or compost making pathi direct-ah Thanglish or English-la kelunga! 🌿",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  // Scroll to chat bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Load recommendations from localStorage if available
  useEffect(() => {
    const stored = localStorage.getItem("flora_recommendations");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FertilizerRecommendation[];
        setHistory(parsed);
        if (parsed.length > 0) {
          // Set latest as active by default
          setRecommendation(parsed[0]);
          setProfile({
            plantName: parsed[0].plantName || "Analyzed Subject",
            plantVariety: "Cultivar",
            medium: "Soil",
            stage: parsed[0].stage || "Vegetative",
            symptoms: [],
            soilType: "Loam",
            pH: "6.5",
            climate: "Moderate",
            organicPreference: "None"
          });
        }
      } catch (e) {
        console.error("Failed to parse history from localStorage:", e);
      }
    }
  }, []);

  const saveToHistory = (newRec: FertilizerRecommendation) => {
    const updated = [newRec, ...history.filter(h => h.plantName !== newRec.plantName)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("flora_recommendations", JSON.stringify(updated));
  };

  const handleRecommendationSubmit = async (profileData: PlantProfile) => {
    setIsLoading(true);
    setProfile(profileData);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Dossier generation failed. Please ensure GEMINI_API_KEY is configured.");
      }

      const data = await response.json() as FertilizerRecommendation;
      // Inject plant details into the result
      data.plantName = profileData.plantName;
      data.stage = profileData.stage;
      data.timestamp = new Date().toLocaleDateString();
      
      setRecommendation(data);
      saveToHistory(data);

      // Add context to chat about new recommendation
      setChatMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          role: "model",
          text: `🔬 **Dossier Generated for ${profileData.plantName}**: I have evaluated your ${profileData.plantName} (${profileData.stage}) and recommended a targeted N-P-K formula of **${data.npkRatio}**. Review the details on your dashboard, or ask me questions about it here!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error: any) {
      console.error("Error generating recommendation:", error);
      alert(error.message || "An error occurred while communicating with the AI server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const msgText = textToSend || chatInput;
    if (!msgText.trim()) return;

    if (!textToSend) {
      setChatInput("");
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      // Map chat messages format for api
      const apiHistory = chatMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgText,
          chatHistory: apiHistory,
          context: recommendation ? {
            plantName: recommendation.plantName,
            stage: recommendation.stage,
            symptoms: profile?.symptoms || []
          } : null
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get chat response. Please verify your internet and API Key.");
      }

      const resData = await response.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        text: resData.text || "I was unable to retrieve a response.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, modelMsg]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setChatMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "model",
          text: `⚠️ **Agent Communication Offline**: ${error.message || "Could not reach the Botanical Agent server. Please make sure the app was successfully initialized."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const selectHistoryItem = (rec: FertilizerRecommendation) => {
    setRecommendation(rec);
    setProfile({
      plantName: rec.plantName || "Analyzed Subject",
      plantVariety: "Cultivar",
      medium: "Soil",
      stage: rec.stage || "Vegetative",
      symptoms: [],
      soilType: "Loam",
      pH: "6.5",
      climate: "Moderate",
      organicPreference: "None"
    });
  };

  const clearHistory = () => {
    setHistory([]);
    setRecommendation(null);
    setProfile(null);
    localStorage.removeItem("flora_recommendations");
  };

  // Safe defaults for sidebar telemetry indicators
  const getNPKValues = () => {
    if (recommendation) {
      const parts = recommendation.npkRatio.split("-").map(p => p.trim());
      return {
        n: parts[0] || "10",
        p: parts[1] || "10",
        k: parts[2] || "10"
      };
    }
    // Default mock data when no profile loaded yet (just to match mockup aesthetic)
    return {
      n: "Low",
      p: "Opt.",
      k: "Opt."
    };
  };

  const npkVals = getNPKValues();

  return (
    <div id="flora-app" className="w-full min-h-screen bg-[#0A0C0B] text-[#E0E7E1] font-sans flex flex-col overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <nav id="top-nav" className="h-16 border-b border-[#1F2922] flex items-center justify-between px-6 bg-[#0F1210]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-md shadow-green-950/20">
            <svg className="w-5 h-5 text-[#0A0C0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
          </div>
          <span className="font-bold tracking-tight text-xl">FLORA<span className="text-green-400 font-extrabold">AI</span></span>
        </div>

        {/* Live System Indicators */}
        <div className="hidden md:flex gap-6 items-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Agronomist Node: Online</span>
          </div>
          <div className="h-4 w-[1px] bg-[#1F2922]" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span>Gemini: Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-bold text-white">Guest Cultivator</span>
            <span className="text-[10px] text-green-400 uppercase font-bold tracking-wider">Expert Tier</span>
          </div>
          <div className="w-9 h-9 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center">
            <User className="w-4 h-4 text-green-400" />
          </div>
        </div>
      </nav>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Sidebar Left: Subject Profile & History */}
        <aside id="sidebar-left" className="w-full lg:w-72 border-r border-[#1F2922] bg-[#0C0F0D] p-5 flex flex-col gap-6 flex-shrink-0">
          
          {/* Active Subject Card */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold mb-3">Active Subject</h3>
            <div className="p-4 rounded-xl bg-[#141815] border border-[#1F2922] space-y-2">
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <Sprout className="w-4.5 h-4.5 text-green-400 flex-shrink-0" />
                <span className="truncate">{profile?.plantName || "Select / Query Plant"}</span>
              </div>
              <div className="text-xs text-green-400 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                {profile ? `${profile.stage}` : "No Active Diagnosis"}
              </div>
            </div>
          </div>

          {/* Soil Telemetry Block */}
          <div className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold flex items-center justify-between">
              <span>Telemetry Estimation</span>
              <span className="text-green-500/80 font-mono tracking-normal text-[9px] font-bold">LIVE</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-[#141815] border border-[#1F2922]">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Nitrogen (N)</div>
                <div className="text-base font-mono font-bold text-orange-400 mt-1">{npkVals.n}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141815] border border-[#1F2922]">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Phosphate (P)</div>
                <div className="text-base font-mono font-bold text-green-400 mt-1">{npkVals.p}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141815] border border-[#1F2922]">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Potash (K)</div>
                <div className="text-base font-mono font-bold text-green-400 mt-1">{npkVals.k}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141815] border border-[#1F2922]">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">pH Index</div>
                <div className="text-base font-mono font-bold text-slate-300 mt-1">
                  {profile?.pH ? profile.pH.split(" ")[0] : "6.4"}
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Expert Insight */}
          <div className="p-4 rounded-xl bg-green-950/15 border border-green-500/20">
            <div className="text-xs font-bold text-green-400 mb-1.5 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              Agent Telemetry Insight
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              {recommendation 
                ? `System recommends applying ${recommendation.npkRatio} at a ${recommendation.feedingSchedule.dosage} rate every ${recommendation.feedingSchedule.frequency.toLowerCase()}.`
                : "Enter details into the wizard on the right to trigger real-time NPK ratio suggestions and nutrient diagnostics."
              }
            </p>
          </div>

          {/* History / Saved Profiles List */}
          {history.length > 0 && (
            <div className="mt-2 space-y-2 flex-1 flex flex-col justify-end">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold flex items-center gap-1">
                  <History className="w-3 h-3 text-slate-400" /> Diagnosis History
                </h3>
                <button 
                  onClick={clearHistory}
                  title="Clear diagnostic history" 
                  className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {history.map((h, i) => (
                  <button
                    key={i}
                    id={`history-item-${i}`}
                    onClick={() => selectHistoryItem(h)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all flex items-center justify-between ${
                      recommendation?.plantName === h.plantName 
                        ? "bg-[#1F2922] text-green-400 font-bold" 
                        : "text-slate-400 hover:bg-[#141815] hover:text-slate-200"
                    }`}
                  >
                    <span className="truncate">{h.plantName}</span>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono font-bold">NPK {h.npkRatio}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Workspace (Middle): Wizard / Dossier Result */}
        <section id="main-workspace" className="flex-1 bg-[#0A0C0B] p-5 md:p-6 lg:p-8 overflow-y-auto border-r border-[#1F2922]">
          <AnimatePresence mode="wait">
            {!recommendation ? (
              <motion.div
                key="wizard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto py-4"
              >
                <div className="mb-6 text-center lg:text-left">
                  <span className="px-2.5 py-1 rounded bg-[#1F2922] text-green-400 text-xs font-bold uppercase tracking-wider">
                    Agent Intelligence Dashboard
                  </span>
                  <h1 className="text-3xl font-extrabold text-white mt-3 tracking-tight">AI Soil & Plant Nutrient Planner</h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Calculate dynamic biological N-P-K balances, diagnose nutrient deficiency symptoms, and generate a customized fertilizer regimen.
                  </p>
                </div>

                <RecommendationWizard onSubmit={handleRecommendationSubmit} isLoading={isLoading} />
              </motion.div>
            ) : (
              <motion.div
                key="dossier"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto"
              >
                <RecommendationDossier 
                  data={recommendation} 
                  onBack={() => {
                    setRecommendation(null);
                    setProfile(null);
                  }} 
                  onAskAgent={(q) => handleSendMessage(q)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Workspace Right: Interactive Agronomist Chat Agent */}
        <section id="chat-section" className="w-full lg:w-96 bg-[#0C0F0D] flex flex-col border-t lg:border-t-0 border-[#1F2922] flex-shrink-0">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-[#1F2922] bg-[#0F1210] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#1F2922] rounded flex items-center justify-center border border-green-500/20">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">Botanist AI Agent</h3>
                <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase">Answers all plant care questions</p>
              </div>
            </div>

            <button
              onClick={() => setChatMessages([
                {
                  id: "welcome",
                  role: "model",
                  text: "Chat feed re-established! Sollunga, unga garden-ah optimize panna, soil-ah ready panna, or pH adjustments panna naan epdi help pannanum?",
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ])}
              title="Reset conversation"
              className="text-slate-500 hover:text-slate-200 p-1.5 rounded hover:bg-[#141815] transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Stream Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[360px] lg:max-h-none min-h-[250px] lg:min-h-0">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="w-7 h-7 rounded bg-[#1F2922] flex-shrink-0 flex items-center justify-center border border-green-500/10 text-xs">
                    🌱
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  msg.role === "user"
                    ? "bg-[#1F2922] text-white rounded-tr-none border border-green-500/15"
                    : "bg-[#141815] border border-[#1F2922] text-slate-200 rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span className="block text-[8px] text-slate-500 font-mono text-right">{msg.timestamp}</span>
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-[8px] font-bold tracking-widest text-slate-300 border border-slate-700 italic">
                    U
                  </div>
                )}
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded bg-[#1F2922] flex-shrink-0 flex items-center justify-center border border-green-500/10 text-xs">
                  🌱
                </div>
                <div className="bg-[#141815] border border-[#1F2922] rounded-2xl p-4 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-green-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-green-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Chat Suggestions Chips */}
          <div className="px-4 py-2 bg-[#0A0C0B] border-t border-[#1F2922] flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Prompts:</span>
            {[
              "NPK ratio-na enna?",
              "Soil pH lower panna enna pannanum?",
              "Nitrogen leaf burn signs enna?",
              "Organic compost epdi seiyarathu?"
            ].map((sug, i) => (
              <button
                key={i}
                id={`suggestion-chip-${i}`}
                onClick={() => handleSendMessage(sug)}
                className="text-[10px] bg-[#141815] text-slate-400 hover:text-green-400 px-2 py-1 rounded-md border border-[#1F2922] transition-colors cursor-pointer"
              >
                "{sug}"
              </button>
            ))}
          </div>

          {/* Chat input form */}
          <div className="p-4 bg-[#0F1210] border-t border-[#1F2922]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                placeholder="Ask about fertilizer ratios, pH levels, compost..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatLoading}
                className="w-full bg-[#141815] border border-[#1F2922] rounded-full py-3 pl-4 pr-12 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-green-500/50"
              />
              <button
                type="submit"
                id="chat-submit-btn"
                disabled={isChatLoading || !chatInput.trim()}
                className="absolute right-1.5 p-2 bg-green-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-full text-[#0A0C0B] hover:bg-green-400 transition-colors cursor-pointer"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        </section>

        {/* Mock IoT Telemetry Sensor Right Edge-Bar (as styled in design mock) */}
        <aside id="sidebar-right" className="hidden lg:flex w-14 border-l border-[#1F2922] flex-col items-center py-6 gap-6 bg-[#0F1210] flex-shrink-0">
          <button 
            title="IoT Power Status" 
            className="w-9 h-9 rounded-xl bg-[#141815] border border-[#1F2922] flex items-center justify-center text-slate-500 hover:text-green-400 transition-colors cursor-pointer"
          >
            <Zap className="w-4.5 h-4.5" />
          </button>
          <button 
            title="Statistical Charts" 
            className="w-9 h-9 rounded-xl bg-[#141815] border border-[#1F2922] flex items-center justify-center text-slate-500 hover:text-green-400 transition-colors cursor-pointer"
          >
            <BarChart4 className="w-4.5 h-4.5" />
          </button>
          <button 
            title="Information Dossier" 
            className="w-9 h-9 rounded-xl bg-[#141815] border border-[#1F2922] flex items-center justify-center text-slate-500 hover:text-green-400 transition-colors cursor-pointer"
          >
            <Info className="w-4.5 h-4.5" />
          </button>
          
          <div className="mt-auto flex flex-col items-center gap-1">
             <div className="w-2 h-12 bg-[#141815] border border-[#1F2922] rounded-full relative overflow-hidden">
               <div className="absolute bottom-0 w-full h-4/5 bg-green-500 rounded-full"></div>
             </div>
             <div className="text-[8px] text-slate-500 font-extrabold tracking-wider font-mono">BAT</div>
          </div>
        </aside>

      </div>
    </div>
  );
}
