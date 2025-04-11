import React, { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import CardContent from "../components/ui/CardContent";
import SteelTable from "../components/ui/SteelTable";
import { steels } from "../data/steelData";
import DataPlot from "../components/ui/DataPlot";
import PrefPlot from "../components/ui/PrefPlot";
import Nav from "../components/ui/Nav";
import SteelKey from "../components/ui/SteelKey";

const Home = () => {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({
    category: "",
    primaryUse: 0,
    sharpeningFrequency: 0,
    corrosionConcern: 0,
    sharpeningEase: 0,
    knifeUsage: 0,
    toughnessWeight: 1,
    edgeRetentionWeight: 1,
    corrosionWeight: 1,
  });

  const handleWeightChange = (toughness, edgeRetention, corrosion) => {
    setPrefs({
      ...prefs,
      toughnessWeight: toughness,
      edgeRetentionWeight: edgeRetention,
      corrosionWeight: corrosion,
    });
  };

  const [result, setResult] = useState(null);

  const normalize = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 0;
    return val / 12;
  };

  const getScore = (steel, prefs) => {
    if (!steel.toughness || !steel.edgeRetention || !steel.corrosion) {
      console.error(`Invalid data for steel: ${steel.name}`);
      return -1;
    }

    const clamp = val => Math.min(12, Math.max(1, val));

    let E = prefs.edgeRetentionWeight * 2;
    let T = prefs.toughnessWeight * 2;
    let C = prefs.corrosionWeight * 2;

    if (prefs.primaryUse === 1 || prefs.primaryUse === 5) T += 1.5;
    if (prefs.primaryUse === 3 || prefs.primaryUse === 4) E += 1.5;

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

    const score =
      normalize(steel.edgeRetention) * clamp(E) +
      normalize(steel.toughness) * clamp(T) +
      normalize(steel.corrosion) * clamp(C);

    return score;
  };

  const handleNext = (updates) => {
    const newPrefs = { ...prefs, ...updates };

    setPrefs(newPrefs);

    if (step === 6) {
      let scored = [];

      if (newPrefs.category === "Both") {
        const tool = steels
          .filter((steel) => steel.category === "Tool")
          .map((steel) => {
            const score = getScore(steel, newPrefs);
            return { ...steel, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        const stainless = steels
          .filter((steel) => steel.category === "Stainless")
          .map((steel) => {
            const score = getScore(steel, newPrefs);
            return { ...steel, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        scored = { tool, stainless };
      } else {
        scored = steels
          .filter((steel) => steel.category === newPrefs.category || !newPrefs.category)
          .map((steel) => {
            const score = getScore(steel, newPrefs);
            return { ...steel, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
      }

      setResult(scored);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="app-container" >
      <Nav />
      <div className="contentContainer" >
        {!result && (
          <Card>
            <CardContent className="space-y-6 p-6">
              {step === 0 && (
                <div>
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
                </div>
              )}

              {step === 1 && (
                <div className="prefplot-wrapper">
                  <PrefPlot onWeightChange={handleWeightChange} />
                  <div className="mt-4 space-x-2">
                    <Button onClick={() => handleNext({})}>Next</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="question">What’s your primary use case for the knife?</p>
                  <div className="space-x-2">
                    <Button onClick={() => handleNext({ primaryUse: 5 })}>Hunting</Button>
                    <Button onClick={() => handleNext({ primaryUse: 4 })}>Fishing</Button>
                    <Button onClick={() => handleNext({ primaryUse: 3 })}>Cooking</Button>
                    <Button onClick={() => handleNext({ primaryUse: 2 })}>Camping</Button>
                    <Button onClick={() => handleNext({ primaryUse: 1 })}>Everyday Carry</Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="question">How often do you plan on sharpening the knife?</p>
                  <div className="space-x-2">
                    <Button onClick={() => handleNext({ sharpeningFrequency: 5 })}>Very Frequently (Every Week)</Button>
                    <Button onClick={() => handleNext({ sharpeningFrequency: 4 })}>Frequently</Button>
                    <Button onClick={() => handleNext({ sharpeningFrequency: 3 })}>Occasionally</Button>
                    <Button onClick={() => handleNext({ sharpeningFrequency: 2 })}>Rarely</Button>
                    <Button onClick={() => handleNext({ sharpeningFrequency: 1 })}>Never</Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <p className="question">Are you primarily concerned with corrosion resistance?</p>
                  <div className="space-x-2">
                    <Button onClick={() => handleNext({ corrosionConcern: 5 })}>Extremely Concerned</Button>
                    <Button onClick={() => handleNext({ corrosionConcern: 4 })}>Somewhat Concerned</Button>
                    <Button onClick={() => handleNext({ corrosionConcern: 3 })}>Neutral</Button>
                    <Button onClick={() => handleNext({ corrosionConcern: 2 })}>Slightly Concerned</Button>
                    <Button onClick={() => handleNext({ corrosionConcern: 1 })}>Not Concerned</Button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div>
                  <p className="question">Do you have a preference for ease of sharpening?</p>
                  <div className="space-x-2">
                    <Button onClick={() => handleNext({ sharpeningEase: 5 })}>I'm a beginner</Button>
                    <Button onClick={() => handleNext({ sharpeningEase: 4 })}>I'm still getting comfortable with sharpening</Button>
                    <Button onClick={() => handleNext({ sharpeningEase: 3 })}>I'm comfortable with sharpening</Button>
                    <Button onClick={() => handleNext({ sharpeningEase: 2 })}>This isn't my first rodeo</Button>
                    <Button onClick={() => handleNext({ sharpeningEase: 1 })}>I'm a sharpening pro</Button>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div>
                  <p className="question">Will your knife be used for delicate slicing or heavy-duty chopping?</p>
                  <div className="space-x-2">
                    <Button onClick={() => handleNext({ knifeUsage: 1 })}>Delicate Slicing Only</Button>
                    <Button onClick={() => handleNext({ knifeUsage: 3 })}>Balanced</Button>
                    <Button onClick={() => handleNext({ knifeUsage: 5 })}>Heavy-Duty Chopping Only</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="resultContainer">
                <div className="tableContainer">
                  {Array.isArray(result) && (
                    <SteelTable steels={result} title={prefs.category + " Steel"} />
                  )}
                  {result.tool && result.tool.length > 0 && (
                    <SteelTable steels={result.tool} title="Tool Steel" />
                  )}
                  {result.stainless && result.stainless.length > 0 && (
                    <SteelTable steels={result.stainless} title="Stainless Steel" />
                  )}
                </div>

                <div className="dataDisplay">
                  <DataPlot data={steels} prefs={prefs} />
                  <SteelKey steels={steels} prefs={prefs} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;
