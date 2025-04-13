import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import CardContent from "../components/ui/CardContent";
import SteelTable from "../components/ui/SteelTable";
import DataPlot from "../components/ui/DataPlot";
import PrefPlot from "../components/ui/PrefPlot";
import Nav from "../components/ui/Nav";
import SteelKey from "../components/ui/SteelKey";

import { steels } from "../data/steelData";


const defaultPrefs = {
  category: "",
  primaryUse: 0,
  sharpeningFrequency: 0,
  corrosionConcern: 0,
  sharpeningEase: 0,
  knifeUsage: 0,
  toughnessWeight: 1,
  edgeRetentionWeight: 1,
  corrosionWeight: 1,
};


const Home = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [result, setResult] = useState(null);

  // Utility Functions
  const normalize = (val) => (val == null || isNaN(val) ? 0 : val / 12);
  const clamp = (val) => Math.min(12, Math.max(1, val));

  const getScore = (steel, prefs) => {
    if (!steel.toughness || !steel.edgeRetention || !steel.corrosion) return -1;

    let E = prefs.edgeRetentionWeight * 2;
    let T = prefs.toughnessWeight * 2;
    let C = prefs.corrosionWeight * 2;

    if ([1, 5].includes(prefs.primaryUse)) T += 1.5;
    if ([3, 4].includes(prefs.primaryUse)) E += 1.5;
    if (prefs.sharpeningFrequency <= 2) E += 1;
    else if (prefs.sharpeningFrequency >= 4) T += 1;
    if (prefs.corrosionConcern >= 4) C += 1.5;

    E += prefs.sharpeningEase * 0.25;

    if (prefs.knifeUsage === 1) E += 1.5;
    else if (prefs.knifeUsage === 5) T += 1.5;
    else {
      E += 1;
      T += 1;
    }

    return (
      normalize(steel.edgeRetention) * clamp(E) +
      normalize(steel.toughness) * clamp(T) +
      normalize(steel.corrosion) * clamp(C)
    );
  };

  // Handlers
  const resetQuestionnaire = () => {
    setStep(0);
    setPrefs(defaultPrefs);
    setResult(null);
    navigate('/');
  };

  const handleNext = (updates) => {
    const newPrefs = { ...prefs, ...updates };
    setPrefs(newPrefs);

    if (step === 6) {
      let scored;

      if (newPrefs.category === "Both") {
        const scoreAndSort = (category) =>
          steels
            .filter((steel) => steel.category === category)
            .map((steel) => ({ ...steel, score: getScore(steel, newPrefs) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        scored = {
          tool: scoreAndSort("Tool"),
          stainless: scoreAndSort("Stainless"),
        };
      } else {
        scored = steels
          .filter((steel) => steel.category === newPrefs.category || !newPrefs.category)
          .map((steel) => ({ ...steel, score: getScore(steel, newPrefs) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
      }

      setResult(scored);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  // Render Question Flow
  const renderButtonQuestion = (question, key, labels, values) => (
    <>
      <p className="question">{question}</p>
      <div className="space-x-2">
        {labels.map((label, i) => (
          <Button key={i} onClick={() => handleNext({ [key]: values[i] })}>{label}</Button>
        ))}
      </div>
    </>
  );

  const renderQuestion = () => {
    switch (step) {
      case 0:
        return (
          <>
            <p className="question">What type of steel are you most interested in?</p>
            <p className="text-sm mb-4 text-gray-300">
              <strong>Stainless Steel</strong>: Excellent corrosion resistance.<br />
              <strong>Tool</strong>: Durable and tough, offering excellent edge retention.<br />
              <strong>Both</strong>: If you're open to both, we can recommend based on your needs.
            </p>
            <div className="space-x-2">
              <Button onClick={() => handleNext({ category: "Stainless" })}>Stainless Steel</Button>
              <Button onClick={() => handleNext({ category: "Tool" })}>Tool Steel</Button>
              <Button onClick={() => handleNext({ category: "Both" })}>Both</Button>
            </div>
          </>
        );
      case 1:
        return (
          <div className="prefplot-wrapper">
            <PrefPlot
              onWeightChange={(t, e, c) =>
                setPrefs({ ...prefs, toughnessWeight: t, edgeRetentionWeight: e, corrosionWeight: c })
              }
            />
            <div className="mt-4 space-x-2">
              <Button onClick={() => handleNext({})}>Next</Button>
            </div>
          </div>
        );
      case 2:
        return renderButtonQuestion(
          "What’s your primary use case for the knife?",
          "primaryUse",
          ["Hunting", "Fishing", "Cooking", "Camping", "Everyday Carry"],
          [5, 4, 3, 2, 1]
        );
      case 3:
        return renderButtonQuestion(
          "How often do you plan on sharpening the knife?",
          "sharpeningFrequency",
          ["Very Frequently (Every Week)", "Frequently", "Occasionally", "Rarely", "Never"],
          [5, 4, 3, 2, 1]
        );
      case 4:
        return renderButtonQuestion(
          "Are you primarily concerned with corrosion resistance?",
          "corrosionConcern",
          ["Extremely Concerned", "Somewhat Concerned", "Neutral", "Slightly Concerned", "Not Concerned"],
          [5, 4, 3, 2, 1]
        );
      case 5:
        return renderButtonQuestion(
          "Do you have a preference for ease of sharpening?",
          "sharpeningEase",
          ["I'm a beginner", "Still getting comfortable", "Comfortable", "Not my first rodeo", "I'm a pro"],
          [5, 4, 3, 2, 1]
        );
      case 6:
        return renderButtonQuestion(
          "Will your knife be used for delicate slicing or heavy-duty chopping?",
          "knifeUsage",
          ["Delicate Slicing Only", "Balanced", "Heavy-Duty Chopping Only"],
          [1, 3, 5]
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 pt-40">
      <Nav resetQuestionnaire={resetQuestionnaire} />
      <div className="contentContainer">
        {!result ? (
          <Card>
            <CardContent className="space-y-6 p-6 flex flex-col justify-between min-h-[300px]">
              {renderQuestion()}
              {step >= 1 && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={resetQuestionnaire}
                    className="border border-spydercoRed text-spydercoRed text-xs px-2 py-1 rounded hover:bg-red-700 hover:border-red-700 hover:text-white transition"
                  >
                    Start Over
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="resultContainer">
                <div className="flex flex-wrap justify-center gap-6 px-4 sm:px-8 md:px-12">
                  {Array.isArray(result) && (
                    <div className="flex-1 min-w-[350px] max-w-[550px]">
                      <SteelTable steels={result} title={prefs.category + " Steel"} />
                    </div>
                  )}
                  {result.tool?.length > 0 && (
                    <div className="flex-1 min-w-[350px] max-w-[550px]">
                      <SteelTable steels={result.tool} title="Tool Steel" />
                    </div>
                  )}
                  {result.stainless?.length > 0 && (
                    <div className="flex-1 min-w-[350px] max-w-[550px]">
                      <SteelTable steels={result.stainless} title="Stainless Steel" />
                    </div>
                  )}
                </div>

                <div className="flex flex-row flex-wrap justify-center items-start mt-6 px-2 gap-x-2 gap-y-4">
                  <div className="w-[60%] min-w-[640px] max-w-[880px]">
                    <DataPlot data={steels} prefs={prefs} />
                  </div>
                  <div className="transform scale-75 origin-top-left lg:ml-0 mt-4 lg:mt-0">
                    <SteelKey steels={steels} prefs={prefs} />
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={resetQuestionnaire}
                  className="border border-spydercoRed text-spydercoRed text-xs px-2 py-1 rounded hover:bg-red-700 hover:border-red-700 hover:text-white transition"
                >
                  Start a new recommendation
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;
