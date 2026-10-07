import React from "react";
import { Composition, Still } from "remotion";
import { Espresso, TOTAL_FRAMES } from "./Espresso";
import { Cover } from "./Cover";
import { H, W } from "./theme";
import { Cover2, Part2, TOTAL2 } from "./p2/Part2";

export const Root: React.FC = () => (
  <>
    <Composition id="Espresso" component={Espresso} durationInFrames={TOTAL_FRAMES} fps={30} width={W} height={H} defaultProps={{ debug: false }} />
    <Composition id="EspressoDebug" component={Espresso} durationInFrames={TOTAL_FRAMES} fps={30} width={W} height={H} defaultProps={{ debug: true }} />
    <Still id="Cover" component={Cover} width={W} height={H} defaultProps={{ debug: false }} />
    <Still id="CoverDebug" component={Cover} width={W} height={H} defaultProps={{ debug: true }} />
    <Composition id="Part2" component={Part2} durationInFrames={TOTAL2} fps={30} width={W} height={H} defaultProps={{ debug: false }} />
    <Composition id="Part2Debug" component={Part2} durationInFrames={TOTAL2} fps={30} width={W} height={H} defaultProps={{ debug: true }} />
    <Still id="Cover2" component={Cover2} width={W} height={H} defaultProps={{ debug: false }} />
    <Still id="Cover2Debug" component={Cover2} width={W} height={H} defaultProps={{ debug: true }} />
  </>
);
