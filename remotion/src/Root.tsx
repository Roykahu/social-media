import { Composition } from "@remotion/core";
import { HookOpener } from "./HookOpener";
import { TipOverlay } from "./TipOverlay";
import { CTAOutro } from "./CTAOutro";
import { StatHighlight } from "./StatHighlight";
import { canvas } from "../theme";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="HookOpener"
        component={HookOpener}
        durationInFrames={90}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{
          hookText: "Stop scrolling. This changes everything.",
        }}
      />
      <Composition
        id="TipOverlay"
        component={TipOverlay}
        durationInFrames={150}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{
          tipText: "Use Claude Projects to save 10 hours a week",
        }}
      />
      <Composition
        id="CTAOutro"
        component={CTAOutro}
        durationInFrames={120}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{
          ctaText: "Book a Claude training for your team",
          websiteUrl: "roykahuthu.com",
        }}
      />
      <Composition
        id="StatHighlight"
        component={StatHighlight}
        durationInFrames={90}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{
          stat: "40",
          label: "hours saved per month",
        }}
      />
    </>
  );
};
