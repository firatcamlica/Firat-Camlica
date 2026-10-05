import React from "react";
import { Composition, Still } from "remotion";
import { Espresso, TOTAL_FRAMES } from "./Espresso";
import { Cover } from "./Cover";
import { H, W } from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="Espresso" component={Espresso} durationInFrames={TOTAL_FRAMES} fps={30} width={W} height={H} defaultProps={{ debug: false }} />
    <Composition id="EspressoDebug" component={Espresso} durationInFrames={TOTAL_FRAMES} fps={30} width={W} height={H} defaultProps={{ debug: true }} />
    <Still id="Cover" component={Cover} width={W} height={H} defaultProps={{ debug: false }} />
    <Still id="CoverDebug" component={Cover} width={W} height={H} defaultProps={{ debug: true }} />
  </>
);
