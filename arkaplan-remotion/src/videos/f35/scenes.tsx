import React from 'react';
import {AbsoluteFill, Easing, Freeze, getInputProps, interpolate, useCurrentFrame} from 'remotion';
import {PHOTO_SLOTS, SCENES, STEPS, SceneId, TEXT} from '../../data/f35';
import {BrollClip, MediaLabel, ParallaxPhoto} from '../../brand/Media';
import {NumberBlock, useCount} from '../../brand/NumberBlock';
import {KeyIcon, LockIcon} from '../../brand/Lock';
import {QuoteCard, useCardMotion} from '../../brand/QuoteCard';
import {RegionMap} from '../../brand/RegionMap';
import {NEUTRAL_LINE, SplitCard} from '../../brand/SplitCard';
import {SourceLine} from '../../brand/Captions';
import {CalendarFlip} from '../../brand/CalendarFlip';
import {GridBackground, ProgressSteps, Stamp, TRACK_BG, TrackKicker, TrackingCard} from '../../brand/Tracking';
import {COLORS, CONTENT, FONTS, STATUS} from '../../brand/tokens';
import {keepHyphens} from '../../brand/ui';
import {F35Side, Hangar, S400Side} from './illustrations';
import {broll, cueLocal, photo, sceneFrames, sceneWords, snapLocal} from './timing';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);
const src = (id: SceneId) => SCENES.find((s) => s.id === id)?.source;
/** Güvenli alan QA'sı (tools/f35/verify.mjs): tam ekran zeminler gizlenir; yalnızca içerik kalır. */
const safeQa = () => Boolean((getInputProps() as {safeQa?: boolean}).safeQa);

const Fade: React.FC<{at: number; until?: number; children: React.ReactNode; dy?: number; style?: React.CSSProperties}> = ({at, until, children, dy = 30, style}) => {
  const f = useCurrentFrame();
  if (f < at || (until !== undefined && f >= until)) return null;
  const p = interpolate(f, [at, at + 9], [0, 1], {...clamp, easing: ease});
  const out = until !== undefined ? interpolate(f, [until - 6, until], [1, 0], clamp) : 1;
  return <div style={{opacity: p * out, transform: `translateY(${(1 - p) * dy}px)`, ...style}}>{children}</div>;
};

/** Takip ekranı zemini: ızgara; fotoğraf varsa üstüne yarı saydam ızgara */
const Screen: React.FC<{children: React.ReactNode; photoId?: string; fallback?: React.ReactNode; dim?: number; label?: string}> = ({children, photoId, fallback, dim = 0.55, label}) => {
  const p = photo(photoId);
  if (safeQa()) return <AbsoluteFill style={{background: '#000'}}>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      {p ? <ParallaxPhoto src={p.file} fg={p.fg} intensity={p.intensity} dim={dim} /> : fallback ? fallback : <GridBackground />}
      {p || fallback ? (
        <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(242,238,230,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(242,238,230,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
      ) : null}
      {p ? <MediaLabel text={p.credit} /> : fallback && label ? <MediaLabel text={label} /> : null}
      {children}
    </AbsoluteFill>
  );
};

const Broll: React.FC<{scene: SceneId}> = ({scene}) => {
  const b = broll(scene);
  return b && !safeQa() ? <BrollClip src={b.file} /> : null;
};

// ----------------------------------------------------------------------------- S1 · Kanca

export const S1: React.FC = () => {
  const f = useCurrentFrame();
  const words = TEXT.quote.text.split(' ');
  const timed = sceneWords('S1');
  const at = words.map((_, i) => (i === 0 ? 0 : Math.max(i * 6, timed[i]?.frame ?? i * 14)));
  const countStop = cueLocal('S1', 'countStop');
  const count0 = countStop - TEXT.hookCounter.frames;
  // alıntı ortada yazılır; sayaç başlamadan 10 karede küçülerek üst üçte bire çıkar
  const m = interpolate(f, [count0 - 10, count0 + 2], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const scale = 1 - 0.48 * m;
  const top = 640 - 330 * m;
  const stamp = cueLocal('S1', 'stamp');
  return (
    <Screen photoId={PHOTO_SLOTS.hook} fallback={<Hangar dim={0.35} />} label="ÇİZİM" dim={0.5}>
      <div style={{position: 'absolute', left: CONTENT.left, top, width: CONTENT.width, transform: `scale(${scale})`, transformOrigin: '50% 0%', textAlign: 'center'}}>
        <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 112, lineHeight: 1.08, color: COLORS.cream, textShadow: '0 4px 28px rgba(0,0,0,0.6)'}}>
          {words.map((w, i) => (
            <span key={i} style={{opacity: f >= at[i] ? 1 : 0}}>
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 28, letterSpacing: 2, color: COLORS.dimDark, marginTop: 26, opacity: interpolate(f, [at[words.length - 1], at[words.length - 1] + 8], [0, 1], clamp)}}>
          {TEXT.quote.author} · {TEXT.quote.work}
        </div>
      </div>
      {f >= count0 ? (
        <div style={{position: 'absolute', left: CONTENT.left, top: 640, width: CONTENT.width, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
          <NumberBlock value={TEXT.hookCounter.value} stopFrame={countStop} startFrame={count0} size={360} />
          <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 58, letterSpacing: '-0.015em', color: COLORS.cream, textShadow: '0 4px 20px rgba(0,0,0,0.6)', opacity: interpolate(f, [count0, count0 + 6], [0, 1], clamp)}}>
            {TEXT.hook}
          </div>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: CONTENT.left, top: 1130, width: CONTENT.width, display: 'flex', justifyContent: 'center'}}>
        <Stamp text={TEXT.stamps.wait} tone="wait" at={stamp} rotate={-4} size={72} />
      </div>
      <SourceLine text={src('S1')} />
    </Screen>
  );
};

// ----------------------------------------------------------------------------- S2 · Ortaklık

export const S2: React.FC = () => {
  const f = useCurrentFrame();
  const order = ['body', 'cockpit', 'gear'] as const;
  const litAt = [8, 22, 36];
  const lit = Object.fromEntries(order.map((k, i) => [k, interpolate(f, [litAt[i], litAt[i] + 8], [0, 1], clamp)]));
  const cStop = cueLocal('S2', 'parts') + 6;
  const cStart = Math.max(20, cStop - 24);
  const count = useCount(TEXT.s2.counter.value, cStop, cStart);
  const prog = Math.min(cueLocal('S2', 'progress'), sceneFrames('S2').duration - 50);
  return (
    <Screen>
      <TrackKicker>{TEXT.s2.kicker}</TrackKicker>
      <div style={{position: 'absolute', left: CONTENT.left - 10, top: 370}}>
        <F35Side width={CONTENT.width + 20} lit={lit} fill="rgba(242,238,230,0.9)" line={COLORS.black} />
      </div>
      <div style={{position: 'absolute', left: CONTENT.left, top: 690, display: 'flex', gap: 14, flexWrap: 'wrap', width: CONTENT.width}}>
        {TEXT.s2.parts.map((p, i) => (
          <Fade key={p} at={litAt[i]} dy={16}>
            <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: COLORS.cream, background: COLORS.blue, borderRadius: 999, padding: '10px 18px'}}>{p}</div>
          </Fade>
        ))}
      </div>
      {f >= cStart ? (
        <div style={{position: 'absolute', left: CONTENT.left, top: 770}}>
          <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 210, lineHeight: 1, letterSpacing: '-0.05em', color: COLORS.cream, fontVariantNumeric: 'tabular-nums'}}>
            {count}
            <span style={{color: COLORS.blue}}>{TEXT.s2.counter.suffix}</span>
          </div>
          <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: COLORS.cream, marginTop: 10}}>{TEXT.s2.counter.label}</div>
        </div>
      ) : null}
      <Fade at={cStop + 4} style={{position: 'absolute', left: CONTENT.left, top: 1060, width: CONTENT.width}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 26, lineHeight: 1.4, color: COLORS.dimDark}}>{TEXT.s2.sub}</div>
      </Fade>
      <Fade at={prog} style={{position: 'absolute', left: CONTENT.left, top: 1140}}>
        <ProgressSteps steps={STEPS} width={CONTENT.width} at={prog} upTo={2} />
      </Fade>
      <MediaLabel text={TEXT.s2.drawingLabel} />
      <SourceLine text={src('S2')} />
    </Screen>
  );
};

// ----------------------------------------------------------------------------- S3 · Teslimat durdu

export const S3: React.FC = () => {
  const f = useCurrentFrame();
  const stop = cueLocal('S3', 'fiveDays');
  const stamp = Math.max(stop + 18, cueLocal('S3', 'stamp'));
  const pop = interpolate(f, [stop, stop + 4, stop + 9], [0.7, 1.08, 1], clamp);
  return (
    <Screen
      photoId={PHOTO_SLOTS.s400}
      dim={0.62}
      label="ÇİZİM"
      fallback={
        <GridBackground>
          <div style={{position: 'absolute', left: 330, top: 930, opacity: 0.35}}>
            <S400Side width={620} />
          </div>
        </GridBackground>
      }
    >
      <Broll scene="S3" />
      <TrackKicker>{TEXT.s3.kicker}</TrackKicker>
      <Fade at={4} style={{position: 'absolute', left: CONTENT.left, top: 350}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 26, color: COLORS.cream, border: '2px solid rgba(242,238,230,0.3)', borderRadius: 10, padding: '10px 16px', background: 'rgba(16,19,31,0.7)'}}>
          {TEXT.s3.note}
        </div>
      </Fade>
      <Fade at={2} style={{position: 'absolute', left: 540 - 170, top: 450}}>
        <CalendarFlip month={TEXT.s3.calendar.month} from={TEXT.s3.calendar.from} to={TEXT.s3.calendar.to} stop={stop} width={340} />
      </Fade>
      {f >= stop ? (
        <div style={{position: 'absolute', left: CONTENT.left, top: 870, width: CONTENT.width, textAlign: 'center', transform: `scale(${pop})`}}>
          <span style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: '-0.04em', color: COLORS.cream, textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>{TEXT.s3.big}</span>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: CONTENT.left, top: 1080, width: CONTENT.width, display: 'flex', justifyContent: 'center'}}>
        <Stamp text={TEXT.stamps.stopped} tone="block" at={stamp} rotate={3} size={42} />
      </div>
      <SourceLine text={src('S3')} />
    </Screen>
  );
};

// ----------------------------------------------------------------------------- S4 · Gerekçe

export const S4: React.FC = () => {
  const {left, right, footer} = TEXT.s4;
  return (
    <Screen>
      <TrackKicker>{TEXT.s4.kicker}</TrackKicker>
      <SplitCard
        left={{...left, lineColor: NEUTRAL_LINE}}
        right={{...right, lineColor: NEUTRAL_LINE}}
        width={CONTENT.width}
        size="xl"
        startFrame={6}
        style={{position: 'absolute', left: CONTENT.left, top: 370}}
        footer={
          <Fade at={cueLocal('S4', 'footer') - 6} style={{width: CONTENT.width, textAlign: 'center', marginTop: 40}}>
            <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 27, lineHeight: 1.45, color: COLORS.cream}}>{footer}</div>
          </Fade>
        }
      />
      <SourceLine text={src('S4')} />
    </Screen>
  );
};

// ----------------------------------------------------------------------------- S5 · Yeni güncelleme

export const S5: React.FC = () => {
  const {quote, rule, footer} = TEXT.s5;
  const prog = cueLocal('S5', 'progress') - 12;
  const extra = cueLocal('S5', 'rule');
  const law = Math.max(extra + 12, cueLocal('S5', 'law'));
  return (
    <Screen>
      <TrackKicker>{TEXT.s5.kicker}</TrackKicker>
      <QuoteCard {...quote} width={CONTENT.width} startFrame={4} style={{position: 'absolute', left: CONTENT.left, top: 350}} />
      <Fade at={prog} style={{position: 'absolute', left: CONTENT.left, top: 770}}>
        <ProgressSteps steps={STEPS} width={CONTENT.width} at={prog} flashAt={prog + 16} />
      </Fade>
      <div style={{position: 'absolute', left: 470, top: 740}}>
        <Stamp text={TEXT.stamps.extra} tone="block" at={extra} rotate={-4} size={64} />
      </div>
      <Fade at={law} style={{position: 'absolute', left: CONTENT.left, top: 920, width: CONTENT.width}}>
        <div style={{display: 'flex', gap: 18, alignItems: 'flex-start'}}>
          <LockIcon size={60} bg={STATUS.block} color={COLORS.cream} />
          <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 44, lineHeight: 1.12, color: COLORS.cream}}>{keepHyphens(rule)}</div>
        </div>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 25, color: COLORS.dimDark, marginTop: 22}}>{footer}</div>
      </Fade>
      <SourceLine text={src('S5')} />
    </Screen>
  );
};

// ----------------------------------------------------------------------------- S6 · Plot twist

export const S6: React.FC = () => {
  const f = useCurrentFrame();
  const s5 = sceneFrames('S5').duration;
  const cards = Math.max(30, cueLocal('S6', 'cards'));
  const note = cueLocal('S6', 'note');
  const jitter = f < 8 ? [((f * 37) % 7) - 3, ((f * 53) % 5) - 2] : [0, 0];
  const w = (CONTENT.width - 24) / 2;
  const {left, right} = TEXT.s6;
  if (f < cards) {
    return (
      <AbsoluteFill style={{background: TRACK_BG}}>
        <AbsoluteFill style={{transform: `translate(${jitter[0] * 2}px, ${jitter[1] * 2}px)`, filter: `grayscale(${f < 8 ? 0.3 : 0.8}) brightness(${f < 8 ? 0.9 : 0.4})`}}>
          <Freeze frame={s5 - 1}>
            <S5 />
          </Freeze>
        </AbsoluteFill>
        <Fade at={6} dy={0} style={{position: 'absolute', left: CONTENT.left, top: 680, width: CONTENT.width, textAlign: 'center'}}>
          <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 130, letterSpacing: '-0.03em', color: COLORS.cream}}>{TEXT.s6.wait}</div>
        </Fade>
      </AbsoluteFill>
    );
  }
  return (
    <Screen>
      <Broll scene="S6" />
      <TrackKicker>{TEXT.s6.kicker}</TrackKicker>
      <div style={{position: 'absolute', left: CONTENT.left, top: 370, display: 'flex', gap: 24}}>
        {[left, right].map((p) => (
          <TrackingCard key={p.pkg} pkg={p.pkg} name={p.name} location={p.location} updated={p.updated} status={{text: TEXT.stamps.wait, tone: 'wait'}} steps={STEPS} note={p.note} noteAt={note} width={w} height={700} at={cards} />
        ))}
      </div>
      <Fade at={cards + 14} dy={0} style={{position: 'absolute', left: CONTENT.left + w - 28, top: 680}}>
        <div style={{position: 'relative', width: 80, height: 80}}>
          <div style={{position: 'absolute', left: -20, right: -20, top: 38, height: 4, background: STATUS.wait}} />
          <div style={{position: 'absolute', left: 8, top: 8}}>
            <LockIcon size={64} bg={COLORS.black} color={STATUS.wait} />
          </div>
        </div>
      </Fade>
      <SourceLine text={src('S6')} />
    </Screen>
  );
};

// ----------------------------------------------------------------------------- S7 · Devir talebi

const ANKARA: [number, number] = [32.85, 39.93];
const ABU_DHABI: [number, number] = [54.37, 24.45];
const DOHA: [number, number] = [51.53, 25.29];
const MOSCOW: [number, number] = [37.62, 55.75];
const ROUTE_MID: [number, number] = [42.5, 32.0];

const PressCard: React.FC<{text: string; startFrame: number; until?: number}> = ({text, startFrame, until}) => {
  const m = useCardMotion(startFrame, until);
  if (!m.visible) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: CONTENT.width, opacity: m.opacity, transform: m.transform}}>
      <div style={{background: COLORS.cream, borderRadius: 20, padding: '24px 30px 28px', boxSizing: 'border-box'}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: COLORS.dimLight}}>BASIN İDDİASI · DOĞRULANMADI</div>
        <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 42, lineHeight: 1.12, color: COLORS.black, marginTop: 10}}>{keepHyphens(text)}</div>
      </div>
    </div>
  );
};

export const S7: React.FC = () => {
  const {labels, press, qatarNote, lavrov} = TEXT.s7;
  const routes = cueLocal('S7', 'routes');
  const pr = Math.max(routes + 20, cueLocal('S7', 'press'));
  const stamp = Math.max(pr + 30, cueLocal('S7', 'stamp'));
  const {duration} = sceneFrames('S7');
  return (
    <Screen>
      <TrackKicker>{TEXT.s7.kicker}</TrackKicker>
      <div style={{position: 'absolute', left: CONTENT.left, top: 340}}>
        <RegionMap
          width={CONTENT.width}
          height={560}
          bounds={[
            [27, 21],
            [58, 57],
          ]}
          outline={['792', '784', '634']}
          pushFrames={duration}
          arrows={[
            {from: ANKARA, to: ABU_DHABI, frame: routes + 4, endLabel: '?', bend: -0.12, labelOffset: [18, -70]},
            {from: ANKARA, to: DOHA, frame: routes + 10, endLabel: '?', bend: 0.2, labelOffset: [-74, -70]},
          ]}
          links={[{from: MOSCOW, to: ROUTE_MID, frame: stamp - 10}]}
          labels={[
            {at: ANKARA, text: labels.turkey, frame: 2, dx: -170, dy: 20, strong: true, dot: true},
            {at: ABU_DHABI, text: labels.uae, frame: routes + 20, dx: 16, dy: 8, strong: true, dot: true},
            {at: DOHA, text: labels.qatar, frame: routes + 24, dx: -136, dy: 6, strong: true, dot: true},
            {at: MOSCOW, text: labels.moscow, frame: 2, dx: 16, dy: -16, strong: true, dot: true},
          ]}
          markers={[{at: [39.5, 44.5], frame: stamp, dx: 10, dy: -30, node: <Stamp text={TEXT.stamps.approval} tone="wait" at={stamp} rotate={-4} size={34} />}]}
        />
      </div>
      <div style={{position: 'absolute', left: CONTENT.left, top: 935}}>
        <PressCard text={press} startFrame={pr} until={stamp + 6} />
        <QuoteCard {...lavrov} size="small" width={CONTENT.width} startFrame={stamp + 6} />
      </div>
      <Fade at={pr + 24} until={stamp + 6} dy={10} style={{position: 'absolute', left: CONTENT.left, top: 1150, width: CONTENT.width}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 24, lineHeight: 1.35, color: COLORS.cream}}>{keepHyphens(qatarNote)}</div>
      </Fade>
      <SourceLine text={src('S7')} />
    </Screen>
  );
};

// ----------------------------------------------------------------------------- S8 · Hâlâ beklemede

export const S8: React.FC = () => {
  const f = useCurrentFrame();
  const {duration} = sceneFrames('S8');
  const keys = cueLocal('S8', 'keys');
  const outro = duration - 60;
  const lines = Math.min(keys + 45, outro - 75);
  const fadeMain = interpolate(f, [outro - 8, outro], [1, 0], clamp);
  const w = (CONTENT.width - 24) / 2;
  const {left, right} = TEXT.s6;
  return (
    <Screen>
      <div style={{opacity: fadeMain}}>
        <TrackKicker>{TEXT.s8.kicker}</TrackKicker>
        <div style={{position: 'absolute', left: CONTENT.left, top: 340, display: 'flex', gap: 24}}>
          {[left, right].map((p) => (
            <TrackingCard key={p.pkg} pkg={p.pkg} name={p.name} location={p.location} updated={p.updated} status={{text: TEXT.stamps.wait, tone: 'wait'}} steps={STEPS} width={w} height={580} at={2} />
          ))}
        </div>
        <div style={{position: 'absolute', left: CONTENT.left, top: 950, display: 'flex', gap: 24}}>
          {TEXT.s8.keys.map((k) => (
            <Fade key={k} at={keys} dy={20}>
              <div style={{width: w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
                <KeyIcon size={92} color={COLORS.cream} />
                <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: COLORS.cream}}>{k}</div>
              </div>
            </Fade>
          ))}
        </div>
        <Fade at={lines} dy={12} style={{position: 'absolute', left: CONTENT.left, top: 1130, width: CONTENT.width}}>
          {TEXT.s8.lines.map((l) => (
            <div key={l} style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 21, lineHeight: 1.4, color: COLORS.dimDark, marginBottom: 8}}>
              {keepHyphens(l)}
            </div>
          ))}
        </Fade>
        <SourceLine text={src('S8')} />
      </div>
      <Fade at={outro} dy={20} style={{position: 'absolute', left: CONTENT.left, top: 560, width: CONTENT.width, textAlign: 'center'}}>
        <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 64, lineHeight: 1.1, color: COLORS.cream}}>{TEXT.quote.text}</div>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 24, letterSpacing: 2, color: COLORS.dimDark, marginTop: 18}}>{TEXT.quote.author}</div>
        <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 74, lineHeight: 1.05, letterSpacing: '-0.02em', color: COLORS.cream, marginTop: 90}}>{TEXT.s8.question}</div>
      </Fade>
    </Screen>
  );
};
