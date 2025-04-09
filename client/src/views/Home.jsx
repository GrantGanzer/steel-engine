import React, { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import CardContent from "../components/ui/CardContent";
import SteelTable from "../components/ui/SteelTable";
import { steels } from "../data/steelData";
import DataPlot from "../components/ui/DataPlot";
import PrefPlot from "../components/ui/PrefPlot";

const Home = () => {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({
    category: "",
    primaryUse: 0,
    sharpeningFrequency: 0,
    corrosionConcern: 0,
    sharpeningEase: 0,
    knifeUsage: 0,
    toughnessWeight: 1,  // Add the weights directly in prefs
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
    console.log("Updated preferences:", {
      ...prefs,
      toughnessWeight: toughness,
      edgeRetentionWeight: edgeRetention,
      corrosionWeight: corrosion,
    });
  }
  const [result, setResult] = useState(null);

  // Normalize function to prevent invalid calculations
  const normalize = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 0; // Ensure the value is a number
    return val / 12; // Normalize value between 0 and 1
  };
  const getScore = (steel, prefs) => {
    if (!steel.toughness || !steel.edgeRetention || !steel.corrosion) {
      console.error(`Invalid data for steel: ${steel.name}`);
      return -1;
    }

    let score = 0;

    // Base score using normalized toughness, edge retention, and corrosion properties
    score += prefs.edgeRetentionWeight * normalize(steel.edgeRetention);
    score += prefs.toughnessWeight * normalize(steel.toughness);
    score += prefs.corrosionWeight * normalize(steel.corrosion);

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
            const score = getScore(steel, newPrefs); // Use the updated prefs with weights
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
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Blade Steel Recommender</h1>

      {!result && (
        <Card>
          <CardContent className="space-y-4 p-4">
            {/* Step 1: Category Selection */}
            {step === 0 && (
              <div>
                <p className="mb-2 font-semibold">What type of steel are you most interested in?</p>
                <p className="text-sm mb-4 text-muted-foreground">
                  <strong>Stainless Steel</strong>: Excellent corrosion resistance.
                  <br />
                  <strong>Tool</strong>: Durable and tough, offering excellent edge retention.
                  <br />
                  <strong>Both</strong>: If you're open to both, we can recommend based on your needs.
                </p>
                <div className="space-x-2">
                  <Button onClick={() => handleNext({ category: "Stainless" })}>Stainless Steel</Button>
                  <Button onClick={() => handleNext({ category: "Tool" })}>Tool Steel</Button>
                  <Button onClick={() => handleNext({ category: "Both" })}>Both</Button>
                </div>
              </div>
            )}

            {/* Step 2: PrefPlot for Selecting Weights */}
            {step === 1 && (
              <div>
                <PrefPlot onWeightChange={handleWeightChange}  // Pass setPrefs to update prefs
                />
                <div className="mt-4 space-x-2">
                  <Button onClick={() => handleNext({})}>Next</Button>
                </div>
              </div>
            )}

            {/* Step 3: Primary Use Selection */}
            {step === 2 && (
              <div>
                <p className="mb-2 font-semibold">What’s your primary use case for the knife?</p>
                <div className="space-x-2">
                  <Button onClick={() => handleNext({ primaryUse: 5 })}>Hunting</Button>
                  <Button onClick={() => handleNext({ primaryUse: 4 })}>Fishing</Button>
                  <Button onClick={() => handleNext({ primaryUse: 3 })}>Cooking</Button>
                  <Button onClick={() => handleNext({ primaryUse: 2 })}>Camping</Button>
                  <Button onClick={() => handleNext({ primaryUse: 1 })}>Everyday Carry</Button>
                </div>
              </div>
            )}

            {/* Step 4: Sharpening Frequency */}
            {step === 3 && (
              <div>
                <p className="mb-2 font-semibold">How often do you plan on sharpening the knife?</p>
                <div className="space-x-2">
                  <Button onClick={() => handleNext({ sharpeningFrequency: 5 })}>Very Frequently (Every Week)</Button>
                  <Button onClick={() => handleNext({ sharpeningFrequency: 4 })}>Frequently</Button>
                  <Button onClick={() => handleNext({ sharpeningFrequency: 3 })}>Occasionally</Button>
                  <Button onClick={() => handleNext({ sharpeningFrequency: 2 })}>Rarely</Button>
                  <Button onClick={() => handleNext({ sharpeningFrequency: 1 })}>Never</Button>
                </div>
              </div>
            )}

            {/* Step 5: Corrosion Concern */}
            {step === 4 && (
              <div>
                <p className="mb-2 font-semibold">Are you primarily concerned with corrosion resistance?</p>
                <div className="space-x-2">
                  <Button onClick={() => handleNext({ corrosionConcern: 5 })}>Extremely Concerned</Button>
                  <Button onClick={() => handleNext({ corrosionConcern: 4 })}>Somewhat Concerned</Button>
                  <Button onClick={() => handleNext({ corrosionConcern: 3 })}>Neutral</Button>
                  <Button onClick={() => handleNext({ corrosionConcern: 2 })}>Slightly Concerned</Button>
                  <Button onClick={() => handleNext({ corrosionConcern: 1 })}>Not Concerned</Button>
                </div>
              </div>
            )}

            {/* Step 6: Sharpening Ease */}
            {step === 5 && (
              <div>
                <p className="mb-2 font-semibold">Do you have a preference for ease of sharpening?</p>
                <div className="space-x-2">
                  <Button onClick={() => handleNext({ sharpeningEase: 5 })}>I'm a beginner</Button>
                  <Button onClick={() => handleNext({ sharpeningEase: 4 })}>I'm still getting comfortable with sharpening</Button>
                  <Button onClick={() => handleNext({ sharpeningEase: 3 })}>I'm comfortable with sharpening</Button>
                  <Button onClick={() => handleNext({ sharpeningEase: 2 })}>This isn't my first rodeo</Button>
                  <Button onClick={() => handleNext({ sharpeningEase: 1 })}>I'm a sharpening pro</Button>
                </div>
              </div>
            )}

            {/* Step 7: Knife Usage */}
            {step === 6 && (
              <div>
                <p className="mb-2 font-semibold">Will your knife be used for delicate slicing or heavy-duty chopping?</p>
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
          <CardContent className="p-4 text-center">
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
            <div className="plotContainer">
              <DataPlot data={steels} prefs={prefs} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;
