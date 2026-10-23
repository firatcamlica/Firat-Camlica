import React from 'react';
import {AbsoluteFill, Easing, getInputProps, interpolate, useCurrentFrame} from 'remotion';
import {PHOTO_SLOTS, SCENES, SceneId, TEXT} from '../../data/f35';
import {Hook} from '../../brand/Hook';
import {BrollClip, MediaLabel, ParallaxPhoto} from '../../brand/Media';
import {NumberBlock, useCount} from '../../brand/NumberBlock';
import {LockIcon, RuleCard} from '../../brand/Lock';
import {QuoteCard, useCardMotion} from '../../brand/QuoteCard';
import {RegionMap} from '../../brand/RegionMap';
import {NEUTRAL_LINE, SplitCard} from '../../brand/SplitCard';
import {SourceLine} from '../../brand/Captions';
import {Timeline} from '../../brand/Timeline';
import {COLORS, CONTENT, FONTS, LAYOUT} from '../../brand/tokens';
import {keepHyphens} from '../../brand/ui';
import {F35Side, Hangar, S400Side} from './illustrations';
import {broll, cueLocal, photo, sceneFrames, snapLocal} from './timing';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);
const src = (id: SceneId) => SCENES.find((s) => s.id === id)?.source;
/** Güvenli alan QA'sı (tools/f35/verify.mjs): tam ekran zeminler gizlenir, zemin siyah olur; yalnızca içerik kalır. */
const safeQa = () => Boolean((getInputProps() as {safeQa?: boolean}).safeQa);
const bg = (c: string) => (safeQa() ? '#000' : c);

const Kicker: React.FC<{children: React.ReactNode; tone?: 'dark' | 'light'; top?: number}> = ({children, tone = 'light', top = 290}) => (
  <div
    style={{
      position: 'absolute',
      left: CONTENT.left,
      top,
      fontFamily: FONTS.mono,
      fontWeight: 700,
      fontSize: 28,
      letterSpacing: 4,
      color: tone === 'dark' ? COLORS.dimDark : COLORS.dimLight,
    }}
  >
    {children}
  </div>
);

const Fade: React.FC<{at: number; children: React.ReactNode; dy?: number; style?: React.CSSProperties}> = ({at, children, dy = 30, style}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 9], [0, 1], {...clamp, easing: ease});
  if (f < at) return null;
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * dy}px)`, ...style}}>{children}</div>;
};

/** Sahne arka planı: fotoğraf (parallax) → yoksa çizim; varsa üstte en fazla 2,5 sn B-roll (%35) */
const Backdrop: React.FC<{scene: SceneId; photoId?: string; fallback: React.ReactNode; fallbackLabel?: string; dim?: number}> = ({
  scene,
  photoId,
  fallback,
  fallbackLabel = 'ÇİZİM',
  dim,
}) => {
  const p = photo(photoId);
  const b = broll(scene);
  const f = useCurrentFrame();
  if (safeQa()) return null;
  const afterBroll = !b || f >= 75;
  return (
    <AbsoluteFill>
      {p ? <ParallaxPhoto src={p.file} fg={p.fg} intensity={p.intensity} dim={dim} /> : fallback}
      {b ? <BrollClip src={b.file} /> : null}
      {afterBroll ? <MediaLabel text={p ? p.credit : fallbackLabel} /> : null}
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------------------- S1 · Hook

export const S1: React.FC = () => (
  <AbsoluteFill>
    <Hook
      text={TEXT.hook}
      background={{kind: 'node', node: <Backdrop scene="S1" photoId={PHOTO_SLOTS.hook} fallback={<Hangar />} dim={0.45} />}}
      centerCounter={{value: TEXT.hookCounter.value, stopFrame: TEXT.hookCounter.stopFrame, size: 470}}
      sfx={null}
      subtitleTop={LAYOUT.captionTop}
    />
    <SourceLine text={src('S1')} />
  </AbsoluteFill>
);

// ----------------------------------------------------------------------------- S2 · Ortaklık

export const S2: React.FC = () => {
  const f = useCurrentFrame();
  const order = ['body', 'cockpit', 'gear'] as const;
  const litAt = [10, 26, 42];
  const lit = Object.fromEntries(order.map((k, i) => [k, interpolate(f, [litAt[i], litAt[i] + 8], [0, 1], clamp)]));
  const cStart = Math.max(30, cueLocal('S2', 'parts') - 8);
  const cStop = snapLocal('S2', cStart + 22);
  const count = useCount(TEXT.s2.counter.value, cStop, cStart);
  const shown = f >= cStart;
  return (
    <AbsoluteFill style={{background: bg(COLORS.cream)}}>
      <Kicker>TÜRKİYE · F-35 ORTAKLIĞI</Kicker>
      <div style={{position: 'absolute', left: CONTENT.left - 10, top: 390}}>
        <F35Side width={CONTENT.width + 20} lit={lit} />
      </div>
      <div style={{position: 'absolute', left: CONTENT.left, top: 730, display: 'flex', gap: 14, flexWrap: 'wrap', width: CONTENT.width}}>
        {TEXT.s2.parts.map((p, i) => (
          <Fade key={p} at={litAt[i]} dy={16}>
            <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: COLORS.cream, background: COLORS.blue, borderRadius: 999, padding: '10px 20px'}}>
              {p}
            </div>
          </Fade>
        ))}
      </div>
      {shown ? (
        <div style={{position: 'absolute', left: CONTENT.left, top: 830, display: 'flex', alignItems: 'baseline', gap: 24}}>
          <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 250, lineHeight: 1, letterSpacing: '-0.05em', color: COLORS.blue, fontVariantNumeric: 'tabular-nums'}}>
            {count}
            {TEXT.s2.counter.suffix}
          </div>
          <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 52, letterSpacing: 4, color: COLORS.black}}>{TEXT.s2.counter.label}</div>
        </div>
      ) : null}
      <Fade at={Math.max(cStop + 6, cueLocal('S2', 'paid') - 30)} style={{position: 'absolute', left: CONTENT.left, top: 1130, width: CONTENT.width}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 30, lineHeight: 1.4, color: COLORS.black}}>{TEXT.s2.sub}</div>
      </Fade>
      <MediaLabel text={TEXT.s2.drawingLabel} tone="light" />
      <SourceLine text={src('S2')} tone="light" />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------------------- S3 · Zaman çizelgesi

export const S3: React.FC = () => {
  const e1 = cueLocal('S3', 'e1');
  const e2 = Math.max(e1 + 15, cueLocal('S3', 'e2'));
  const five = cueLocal('S3', 'fiveDays');
  return (
    <AbsoluteFill style={{background: bg(COLORS.black)}}>
      <Backdrop
        scene="S3"
        photoId={PHOTO_SLOTS.s400}
        dim={0.6}
        fallback={
          <AbsoluteFill style={{background: '#0E1120'}}>
            <div style={{position: 'absolute', left: 300, top: 860, opacity: 0.5}}>
              <S400Side width={680} />
            </div>
          </AbsoluteFill>
        }
      />
      <Kicker tone="dark">{TEXT.s3.kicker}</Kicker>
      <div style={{position: 'absolute', left: CONTENT.left, top: 380}}>
        <Timeline
          events={TEXT.s3.events}
          reveal={[e1, e2, five]}
          bracket={{from: TEXT.s3.bracket.from, to: TEXT.s3.bracket.to, label: TEXT.s3.bracket.label, frame: five}}
          width={CONTENT.width}
        />
      </div>
      <SourceLine text={src('S3')} />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------------------- S4 · İki taraf

export const S4: React.FC = () => {
  const {left, right, footer} = TEXT.s4;
  return (
    <AbsoluteFill style={{background: bg(COLORS.cream)}}>
      <Kicker>İKİ TARAF · S-400</Kicker>
      <SplitCard
        left={{...left, lineColor: NEUTRAL_LINE}}
        right={{...right, lineColor: NEUTRAL_LINE}}
        width={CONTENT.width}
        size="xl"
        startFrame={6}
        style={{position: 'absolute', left: CONTENT.left, top: 380}}
        footer={
          <Fade at={cueLocal('S4', 'footer') - 6} style={{width: CONTENT.width, textAlign: 'center', marginTop: 44}}>
            <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 28, lineHeight: 1.45, color: COLORS.black}}>{footer}</div>
          </Fade>
        }
      />
      <SourceLine text={src('S4')} tone="light" />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------------------- S5 · Trump ve yasa

export const S5: React.FC = () => {
  const {quote, rule} = TEXT.s5;
  return (
    <AbsoluteFill style={{background: bg(COLORS.cream)}}>
      <Kicker>ABD · CAATSA</Kicker>
      <QuoteCard {...quote} width={CONTENT.width} startFrame={6} style={{position: 'absolute', left: CONTENT.left, top: 350}} />
      <div style={{position: 'absolute', left: CONTENT.left, top: 830}}>
        <RuleCard kicker={rule.kicker} text={rule.text} footer={rule.footer} width={CONTENT.width} startFrame={cueLocal('S5', 'rule')} />
      </div>
      <SourceLine text={src('S5')} tone="light" />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------------------- S6 · Körfez ve Moskova

const ANKARA: [number, number] = [32.85, 39.93];
const ABU_DHABI: [number, number] = [54.37, 24.45];
const DOHA: [number, number] = [51.53, 25.29];
const MOSCOW: [number, number] = [37.62, 55.75];

const SmallCard: React.FC<{kicker: string; text: string; startFrame: number; until?: number}> = ({kicker, text, startFrame, until}) => {
  const m = useCardMotion(startFrame, until);
  if (!m.visible) return null;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: CONTENT.width, opacity: m.opacity, transform: m.transform}}>
      <div style={{background: COLORS.cream, borderRadius: 22, padding: '26px 32px 30px', boxSizing: 'border-box'}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: COLORS.dimLight}}>{kicker}</div>
        <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 44, lineHeight: 1.12, letterSpacing: '-0.015em', color: COLORS.black, marginTop: 12}}>{keepHyphens(text)}</div>
      </div>
    </div>
  );
};

export const S6: React.FC = () => {
  const {labels, cardA, cardB, cardC} = TEXT.s6;
  const a = cueLocal('S6', 'cardA');
  const b = Math.max(a + 45, cueLocal('S6', 'cardB'));
  const c = Math.max(b + 45, cueLocal('S6', 'cardC'));
  const {duration} = sceneFrames('S6');
  const bgClip = broll('S6');
  return (
    <AbsoluteFill style={{background: bg(COLORS.black)}}>
      {bgClip && !safeQa() ? <BrollClip src={bgClip.file} /> : null}
      <div style={{position: 'absolute', left: CONTENT.left, top: 250, opacity: bgClip ? 0.9 : 1}}>
        <RegionMap
          width={CONTENT.width}
          height={630}
          bounds={[
            [27, 21],
            [58, 57],
          ]}
          highlight={['792']}
          outline={['784', '634']}
          pushFrames={duration}
          arrows={[
            {from: ANKARA, to: ABU_DHABI, frame: 8, endLabel: '?', bend: -0.12, labelOffset: [18, -70]},
            {from: ANKARA, to: DOHA, frame: 14, endLabel: '?', bend: 0.2, labelOffset: [-74, -70]},
          ]}
          links={[{from: MOSCOW, to: ANKARA, frame: 30, icon: 'lock'}]}
          labels={[
            {at: ANKARA, text: labels.turkey, frame: 2, dx: -170, dy: 20, strong: true, dot: true},
            {at: ABU_DHABI, text: labels.uae, frame: 24, dx: 16, dy: 8, strong: true, dot: true},
            {at: DOHA, text: labels.qatar, frame: 30, dx: -136, dy: 6, strong: true, dot: true},
            {at: MOSCOW, text: labels.moscow, frame: 30, dx: 16, dy: -16, strong: true, dot: true},
          ]}
        />
      </div>
      <div style={{position: 'absolute', left: CONTENT.left, top: 910}}>
        <SmallCard kicker={cardA.kicker} text={cardA.text} startFrame={a} until={b} />
        <SmallCard kicker={cardB.kicker} text={cardB.text} startFrame={b} until={c} />
        <QuoteCard {...cardC} size="small" width={CONTENT.width} startFrame={c} />
      </div>
      <SourceLine text={src('S6')} />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------------------- S7 · Karşılaştırma

export const S7: React.FC = () => {
  const {left, right} = TEXT.s7;
  const ls = cueLocal('S7', 'saudi');
  const rs = Math.max(ls + 30, cueLocal('S7', 'turkey'));
  const lStop = snapLocal('S7', ls + 20);
  const rStop = snapLocal('S7', rs + 12);
  const n48 = useCount(left.value, lStop, ls);
  const colW = (CONTENT.width - 28) / 2;
  const colStyle: React.CSSProperties = {width: colW, boxSizing: 'border-box', borderTop: `6px solid ${COLORS.cream}`, paddingTop: 22};
  const country: React.CSSProperties = {fontFamily: FONTS.mono, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: COLORS.cream, height: 76};
  const unit: React.CSSProperties = {fontFamily: FONTS.sans, fontWeight: 800, fontSize: 56, color: COLORS.cream, marginTop: 20};
  const line: React.CSSProperties = {fontFamily: FONTS.mono, fontWeight: 500, fontSize: 27, lineHeight: 1.4, color: COLORS.dimDark};
  return (
    <AbsoluteFill style={{background: bg(COLORS.black)}}>
      <Backdrop scene="S7" fallback={<Hangar push={0.03} dim={0.55} />} />
      <Kicker tone="dark">F-35 · BUGÜN</Kicker>
      <div style={{position: 'absolute', left: CONTENT.left, top: 400, display: 'flex', gap: 28}}>
        <Fade at={ls}>
          <div style={colStyle}>
            <div style={country}>{left.country}</div>
            <div style={{height: 300, display: 'flex', alignItems: 'center'}}>
              <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 270, lineHeight: 1, letterSpacing: '-0.05em', color: COLORS.cream, fontVariantNumeric: 'tabular-nums'}}>{n48}</div>
            </div>
            <div style={unit}>{left.unit}</div>
            <div style={{marginTop: 14}}>
              {left.lines.map((l) => (
                <div key={l} style={line}>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </Fade>
        <Fade at={rs}>
          <div style={{...colStyle, borderTopColor: COLORS.blue}}>
            <div style={country}>{right.country}</div>
            <div style={{height: 300, display: 'flex', alignItems: 'center'}}>
              <NumberBlock value={right.value} stopFrame={rStop} startFrame={rs} size={280} />
            </div>
            <div style={unit}>{right.unit}</div>
            <div style={{marginTop: 14}}>
              {right.lines.map((l) => (
                <div key={l} style={{...line, color: COLORS.cream, fontWeight: 700}}>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </Fade>
      </div>
      <SourceLine text={src('S7')} />
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------------------- S8 · Sonuç

export const S8: React.FC = () => {
  const f = useCurrentFrame();
  const q = cueLocal('S8', 'question');
  const [who, said] = TEXT.s8.small.split(': ');
  const pop = interpolate(f, [q, q + 5, q + 10], [0.9, 1.04, 1], clamp);
  return (
    <AbsoluteFill style={{background: bg(COLORS.cream)}}>
      <Fade at={4} style={{position: 'absolute', left: CONTENT.left, top: 300, width: CONTENT.width}}>
        <div style={{fontFamily: FONTS.mono, fontWeight: 500, fontSize: 26, letterSpacing: 1, color: COLORS.dimLight}}>{who.toLocaleUpperCase('tr-TR')}</div>
        <div style={{fontFamily: FONTS.sans, fontWeight: 500, fontSize: 44, lineHeight: 1.18, color: COLORS.black, marginTop: 12}}>“{keepHyphens(said)}”</div>
      </Fade>
      {f >= q ? (
        <div style={{position: 'absolute', left: CONTENT.left, top: 640, width: CONTENT.width, transform: `scale(${pop})`, transformOrigin: 'left center'}}>
          <LockIcon size={120} bg={COLORS.blue} color={COLORS.cream} closed={1} />
          <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: 132, lineHeight: 0.98, letterSpacing: '-0.035em', color: COLORS.black, marginTop: 24}}>
            {TEXT.s8.big}
          </div>
        </div>
      ) : null}
      <Fade at={q + 14} style={{position: 'absolute', left: CONTENT.left, top: 1120, width: CONTENT.width}}>
        <div style={{display: 'inline-block', background: COLORS.black, color: COLORS.cream, borderRadius: 16, padding: '18px 26px', fontFamily: FONTS.sans, fontWeight: 500, fontSize: 36}}>
          {TEXT.s8.card}
        </div>
      </Fade>
      <SourceLine text={src('S8')} tone="light" />
    </AbsoluteFill>
  );
};
