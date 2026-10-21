import React from 'react';
import {AbsoluteFill, Freeze, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, EndCard, FONTS} from '../brand';
import {COORDS, ENDCARD_SECONDS, FPS, SAFE, SceneId, SIDES, TEXT, TWEETS} from '../data/twitter-savasi';
import {
  Camera,
  CONTENT_W,
  fade,
  fadeOut,
  greatCircle,
  hasShot,
  haversineKm,
  lerpCam,
  ll,
  RED,
  RouteArrow,
  SideTag,
  SourceLine,
  Stamp,
  TableIcon,
  Target,
  TiltCard,
  TopicIcon,
  TopTag,
  TweetCard,
  WallSilhouette,
  WAR_BG,
  WarMap,
  WordByWord,
} from './parts';
import {AUDIO, sceneClock, sceneFrames, snapLocal, STARTS} from './timing';

const slot = (id: string) => TWEETS.find((t) => t.id === id)!;


/**
 * Sahne içi anahtar anlar, varsayılan yerel saniye (ses yokken). Seslendirme varsa
 * tools/voice_cues_tw.json'dan gelen mutlak zamanlar (AUDIO.cues["S3.stamp"] gibi) bunların yerine geçer.
 */
export const CUES = {
  S0: {title: 0.35, tag: 1.9},
  S1: {card: 0.6, reply: 4.3, replyText: 4.45},
  S2: {topics: 0.3, topic0: 0.6, topic1: 1.35, topic2: 2.1, route: 4.0},
  S3: {drop0: 0.3, drop1: 0.9, memes: 2.0, meme1: 2.6, alliance: 5.8, stamp: 7.0},
  S4: {ban: 1.4, question: 4.4, answer0: 5.6, answer1: 6.6, bot: 8.2, botSub: 9.0},
  S5: {title: 0.2, region: 1.2, line0: 2.2, line1: 4.4},
  S6: {tag: 0.2, meeting: 0.5, oneChina: 3.8, split: 6.8},
  S7: {cta: 1.1},
} as const;

type CueKey<S extends SceneId> = keyof (typeof CUES)[S];

/** Yerel kare: seslendirme cue'su varsa ona, yoksa sahne saatine göre; istenirse vuruşa hizalı (en fazla 3 kare). */
export const cue = <S extends SceneId>(id: S, key: CueKey<S>, snap = false) => {
  const abs = AUDIO.cues?.[`${id}.${String(key)}`];
  const f = abs != null ? Math.round((abs - STARTS[id]) * FPS) : sceneClock(id)((CUES[id] as Record<string, number>)[key as string]);
  return snap ? snapLocal(id, f) : f;
};

/** Ses efektleri için mutlak kareler (TwitterSavasi.tsx kullanır). */
export const sfxCues = () => {
  const abs = <S extends SceneId>(id: S, key: CueKey<S>, snap = false) => sceneFrames(id).from + cue(id, key, snap);
  return {
    whoosh: [abs('S1', 'card', true), abs('S1', 'reply', true), abs('S3', 'memes', true), abs('S3', 'alliance', true), abs('S4', 'ban')],
    stamp: [abs('S3', 'stamp', true)],
    scratch: [sceneFrames('S4').from],
  };
};

const Center: React.FC<{children: React.ReactNode; top?: number; justify?: 'center' | 'flex-start'}> = ({children, top = 340, justify = 'center'}) => (
  <AbsoluteFill
    style={{
      paddingTop: top,
      paddingBottom: SAFE.bottom + 70,
      paddingLeft: SAFE.left,
      paddingRight: SAFE.right,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      alignItems: 'flex-start',
      gap: 36,
    }}
  >
    {children}
  </AbsoluteFill>
);

const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 32, color = COLORS.dimDark, style}) => (
  <div style={{font: `700 ${size}px/1.3 ${FONTS.mono}`, letterSpacing: '0.05em', color, ...style}}>{children}</div>
);

const pt = (p: (c: [number, number]) => [number, number] | null, c: {lon: number; lat: number}) => p(ll(c)) ?? [0, 0];

// --- S0 KANCA -----------------------------------------------------------------

const ROUTE = greatCircle(ll(COORDS.istanbul), ll(COORDS.pekin), 80);
const KM = Math.round(haversineKm(COORDS.istanbul, COORDS.pekin) / 10) * 10;

// --- S0 KANCA -----------------------------------------------------------------

export const S0: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const title = cue('S0', 'title');
  const tag = cue('S0', 'tag');
  const cam: Camera = {lon: 72, lat: 38, scale: interpolate(f, [0, d], [470, 540])};
  const grow = interpolate(f, [4, Math.min(d - 10, 75)], [0, 0.46], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const half = Math.floor(ROUTE.length / 2);
  const west = ROUTE.slice(0, half + 1);
  const east = [...ROUTE].reverse().slice(0, half + 1);
  return (
    <AbsoluteFill>
      <WarMap cam={cam} cy={820}>
        {(p) => {
          const [ix, iy] = pt(p, COORDS.istanbul);
          const [bx, by] = pt(p, COORDS.pekin);
          return (
            <>
              <RouteArrow proj={p} pts={west} progress={grow / 0.5} color={SIDES.tr.color} />
              <RouteArrow proj={p} pts={east} progress={grow / 0.5} color={SIDES.cn.color} />
              <Target x={ix} y={iy} color={SIDES.tr.color} label={SIDES.tr.label} labelSide="right" appear={fade(f, 0, 8)} />
              <Target x={bx} y={by} color={SIDES.cn.color} label={SIDES.cn.label} labelSide="left" appear={fade(f, 3, 11)} />
            </>
          );
        }}
      </WarMap>
      <TopTag tag="" appear={fade(f, 0, 9)} />
      <div style={{position: 'absolute', left: SAFE.left, right: SAFE.right, top: 1090}}>
        <WordByWord text={TEXT.s0.title} t={f - title} size={108} every={6} />
        <Mono size={34} color={RED} style={{marginTop: 30, opacity: fade(f, tag, tag + 8)}}>
          {TEXT.s0.tag}
        </Mono>
      </div>
    </AbsoluteFill>
  );
};

// --- S1 FİTİL -----------------------------------------------------------------

export const S1: React.FC = () => {
  const f = useCurrentFrame();
  const c = sceneClock('S1');
  const reply = cue('S1', 'reply', true);
  const cardSlot = slot(TEXT.s1.tweet);
  // Ekran görüntüsü en fazla ~3 sn ekranda kalır; öncesinde sahne etiketi büyük gösterilir.
  const card = hasShot(cardSlot) ? Math.max(cue('S1', 'card', true), reply - 96) : cue('S1', 'card', true);
  const replySlot = slot(TEXT.s1.reply);
  const replyShot = hasShot(replySlot);
  // Ekran görüntüsü varsa 3 sn ekranda kalır, sonra duvar üzerindeki metne geçilir.
  const wallText = replyShot ? reply + 90 + 4 : Math.max(reply + 4, cue('S1', 'replyText'));
  return (
    <AbsoluteFill>
      <WarMap cam={{lon: 35, lat: 39, scale: 1500}} highlight={['tr']} dim={interpolate(f, [reply - 6, reply], [0.55, 0.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <TopTag tag={TEXT.s1.tag} appear={fade(f, 0, c(0.5))} />
      {f < card ? (
        <Center>
          <div style={{font: `800 120px/1 ${FONTS.sans}`, color: COLORS.cream, letterSpacing: '-0.02em', opacity: fade(f, 2, 10) * fadeOut(f, card - 6, card)}}>İlk ateş</div>
          <Mono size={36} color={RED} style={{opacity: fade(f, 6, 14) * fadeOut(f, card - 6, card)}}>
            ÇİNCE BİR PAYLAŞIM · 19 EKİM
          </Mono>
        </Center>
      ) : f < reply ? (
        <Center>
          <TweetCard slot={cardSlot} t={f - card} dir={1} exitAt={reply - card - 8} maxShotH={900} />
        </Center>
      ) : (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: SAFE.bottom + 100, display: 'flex', justifyContent: 'center', opacity: fade(f, reply - 4, reply + 6)}}>
            <WallSilhouette width={1080} draw={interpolate(f, [reply, reply + 48], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
          </div>
          <Center top={360} justify="flex-start">
            <Mono size={44} color={SIDES.tr.color} style={{opacity: fade(f, reply - 2, reply + 5)}}>
              {TEXT.s1.replyLabel}
            </Mono>
            {replyShot && f < wallText ? <TweetCard slot={replySlot} t={f - reply} dir={-1} exitAt={86} maxShotH={760} /> : null}
            {f >= wallText ? (
              <div style={{width: CONTENT_W}}>
                <WordByWord text={replySlot.summary} t={f - wallText} size={92} every={4} />
                <div style={{marginTop: 26, opacity: fade(f, wallText + 10, wallText + 16), color: COLORS.cream}}>
                  <SideTag side="tr" text="TÜRK HESAPLARDAN" />
                </div>
              </div>
            ) : null}
          </Center>
        </>
      )}
      <SourceLine text={TEXT.s1.source} appear={fade(f, c(0.8), c(1.2))} />
    </AbsoluteFill>
  );
};

// --- S2 KARŞI ATAK --------------------------------------------------------------
// Sıra seslendirmeye göre: önce Çinli hesapların başlıkları, sonra mesafe.

export const S2: React.FC = () => {
  const f = useCurrentFrame();
  const c = sceneClock('S2');
  const topics = cue('S2', 'topics');
  const route = cue('S2', 'route');
  const r1 = route + 45;
  const prog = interpolate(f, [route, r1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const km = Math.round((KM * prog) / 10) * 10;
  const cam = lerpCam(f, [
    [route - 6, {lon: 62, lat: 40, scale: 600}],
    [r1, {lon: 73, lat: 41, scale: 520}],
  ]);
  const mapDim = interpolate(f, [route - 8, route + 2], [0.28, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const topicAt = [cue('S2', 'topic0', true), cue('S2', 'topic1', true), cue('S2', 'topic2', true)];
  return (
    <AbsoluteFill>
      <WarMap cam={cam} cy={700} dim={mapDim}>
        {(p) => {
          if (f < route - 8) return null;
          const [ix, iy] = pt(p, COORDS.istanbul);
          const [bx, by] = pt(p, COORDS.pekin);
          return (
            <>
              <RouteArrow proj={p} pts={ROUTE} progress={prog} color={COLORS.cream} dashed width={5} />
              <Target x={ix} y={iy} color={SIDES.tr.color} label={COORDS.istanbul.name.toLocaleUpperCase('tr')} labelSide="right" />
              <Target x={bx} y={by} color={SIDES.cn.color} label={COORDS.pekin.name.toLocaleUpperCase('tr')} labelSide="left" appear={fade(f, r1 - 6, r1)} />
            </>
          );
        }}
      </WarMap>
      <TopTag tag={TEXT.s2.tag} appear={fade(f, 0, c(0.5))} />
      {f < route ? (
        <Center top={360}>
          <Mono size={34} color={COLORS.cream} style={{opacity: fade(f, topics, topics + 6) * fadeOut(f, route - 8, route - 2)}}>
            {TEXT.s2.topicsTitle}
          </Mono>
          {TEXT.s2.topics.map((tp, i) => {
            const t = f - topicAt[i];
            const sp = spring({frame: t, fps: FPS, config: {damping: 15, stiffness: 190}});
            if (t < 0) return <div key={tp.id} style={{height: 200}} />;
            return (
              <div
                key={tp.id}
                style={{
                  width: CONTENT_W,
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 40,
                  padding: '0 40px',
                  boxSizing: 'border-box',
                  background: COLORS.cardDark,
                  borderLeft: `10px solid ${SIDES.cn.color}`,
                  borderRadius: 16,
                  transform: `translateX(${(1 - sp) * 300}px) rotate(${(1 - sp) * 4}deg)`,
                  opacity: Math.min(1, sp * 2) * fadeOut(f, route - 8, route - 2),
                  boxShadow: '0 14px 30px rgba(0,0,0,0.4)',
                }}
              >
                <TopicIcon id={tp.id} size={120} color={SIDES.cn.color} />
                <div style={{font: `800 76px ${FONTS.sans}`, color: COLORS.cream, letterSpacing: '-0.01em'}}>{tp.label}</div>
              </div>
            );
          })}
        </Center>
      ) : (
        <div style={{position: 'absolute', left: SAFE.left, right: SAFE.right, top: 900}}>
          <Mono size={30} color={SIDES.cn.color} style={{opacity: fade(f, route, route + 6)}}>
            {TEXT.s2.distance.label}
          </Mono>
          <div style={{font: `800 132px/1 ${FONTS.sans}`, color: COLORS.cream, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginTop: 14}}>
            {TEXT.s2.distance.prefix} {km.toLocaleString('tr-TR')} {TEXT.s2.distance.unit}
          </div>
          <Mono size={30} style={{marginTop: 16}}>{TEXT.s2.distance.note}</Mono>
          <Mono size={24} style={{marginTop: 6, opacity: 0.8}}>{TEXT.s2.distance.source}</Mono>
        </div>
      )}
      <SourceLine text={TEXT.s2.source} appear={fade(f, topics, topics + 8)} />
    </AbsoluteFill>
  );
};

// --- S3 CEPHE GENİŞLİYOR -------------------------------------------------------

const AllianceCard: React.FC<{t: number; stampT: number}> = ({t, stampT}) => {
  const {fps} = useVideoConfig();
  const merge = spring({frame: t - 18, fps, config: {damping: 18, stiffness: 140}});
  const f = useCurrentFrame();
  const blink = Math.floor(f / 5) % 2 ? 0.4 : 1;
  const left = [
    {label: 'Türk hesaplar', color: SIDES.tr.color},
    {label: 'Japon hesaplar', color: SIDES.jp.color},
    {label: 'Tayvanlı hesaplar', color: SIDES.tw.color},
  ];
  return (
    <TiltCard t={t} light={false} style={{padding: '34px 36px 40px'}}>
      <Mono size={30} color={COLORS.cream}>
        {TEXT.s3.allianceTitle.toLocaleUpperCase('tr')}
      </Mono>
      <div style={{position: 'relative', height: 460, marginTop: 24}}>
        {left.map((b, i) => {
          const y = interpolate(merge, [0, 1], [i * 150, 60 + i * 118]);
          const x = 0;
          return (
            <div
              key={b.label}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 330,
                height: 120,
                borderRadius: 14,
                border: `4px solid ${b.color}`,
                background: '#25262A',
                color: COLORS.cream,
                font: `700 34px/1.1 ${FONTS.sans}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 22px',
                boxSizing: 'border-box',
                boxShadow: '0 8px 18px rgba(0,0,0,0.5)',
              }}
            >
              {b.label}
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 160,
            width: 270,
            height: 150,
            borderRadius: 14,
            border: `4px solid ${SIDES.cn.color}`,
            background: '#25262A',
            color: COLORS.cream,
            font: `700 38px/1.1 ${FONTS.sans}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 22px',
            boxSizing: 'border-box',
          }}
        >
          Çinli hesaplar
        </div>
        <svg width={180} height={120} style={{position: 'absolute', left: 345, top: 175, opacity: merge * blink}}>
          <path d="M6 40H160M140 20L170 40L140 60" stroke={COLORS.cream} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M170 85H20M40 65L10 85L40 105" stroke={SIDES.cn.color} strokeWidth={6} fill="none" strokeLinecap="round" />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center'}}>
          <Stamp text={TEXT.s3.stamp} t={stampT} size={50} />
        </div>
      </div>
    </TiltCard>
  );
};

export const S3: React.FC = () => {
  const f = useCurrentFrame();
  const c = sceneClock('S3');
  const drops = [cue('S3', 'drop0'), cue('S3', 'drop1')];
  const memes = cue('S3', 'memes', true);
  const meme1 = cue('S3', 'meme1', true);
  const alliance = cue('S3', 'alliance', true);
  const stamp = cue('S3', 'stamp', true);
  const cam = lerpCam(f, [
    [0, {lon: 72, lat: 41, scale: 560}],
    [c(1.4), {lon: 86, lat: 36, scale: 400}],
  ]);
  const mapDim = interpolate(f, [memes - 4, memes + 6], [1, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const [m0, m1] = TEXT.s3.memes.map(slot);
  return (
    <AbsoluteFill>
      <WarMap cam={cam} cy={760} dim={mapDim} highlight={['tr', 'cn', 'jp', 'tw']}>
        {(p) => {
          const [ix, iy] = pt(p, COORDS.istanbul);
          const [bx, by] = pt(p, COORDS.pekin);
          const [tx, ty] = pt(p, COORDS.tokyo);
          const [wx, wy] = pt(p, COORDS.taipei);
          return (
            <>
              <RouteArrow proj={p} pts={ROUTE} progress={1} color={COLORS.cream} dashed width={4} head={false} />
              <Target x={ix} y={iy} color={SIDES.tr.color} />
              <Target x={bx} y={by} color={SIDES.cn.color} />
              <Target x={tx} y={ty} color={SIDES.jp.color} appear={fade(f, drops[0], drops[0] + 8)} />
              <Target x={wx} y={wy} color={SIDES.tw.color} appear={fade(f, drops[1], drops[1] + 8)} />
            </>
          );
        }}
      </WarMap>
      <TopTag tag="CEPHE GENİŞLİYOR" appear={fade(f, 0, c(0.5))} />
      {f < memes ? (
        <div style={{position: 'absolute', left: SAFE.left, right: SAFE.right, top: 1060, display: 'flex', flexDirection: 'column', gap: 24, opacity: fadeOut(f, memes - 6, memes)}}>
          {TEXT.s3.newFronts.map((label, i) => {
            const t = f - drops[i];
            const y = interpolate(t, [0, 8], [-120, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const side = i === 0 ? 'jp' : 'tw';
            return (
              <div key={label} style={{opacity: fade(t, 0, 5), transform: `translateY(${y}px)`, display: 'flex', alignItems: 'center', gap: 22, padding: '22px 30px', background: COLORS.cardDark, borderRadius: 14, borderLeft: `10px solid ${SIDES[side].color}`, width: 'fit-content'}}>
                <Mono size={26} color={RED} style={{whiteSpace: 'nowrap'}}>YENİ CEPHE</Mono>
                <div style={{font: `800 56px ${FONTS.sans}`, color: COLORS.cream, whiteSpace: 'nowrap'}}>{label}</div>
              </div>
            );
          })}
        </div>
      ) : f < alliance ? (
        <Center top={330} justify="flex-start">
          <Mono size={30} color={COLORS.cream} style={{opacity: fade(f, memes, memes + 6), marginBottom: -6}}>
            MEME CEPHESİ
          </Mono>
          <TweetCard slot={m0} t={f - memes} dir={-1} exitAt={alliance - memes - 7} maxShotH={600} />
          <TweetCard slot={m1} t={f - meme1} dir={1} exitAt={alliance - meme1 - 7} compact />
        </Center>
      ) : (
        <Center top={360}>
          <AllianceCard t={f - alliance} stampT={f - stamp} />
        </Center>
      )}
      <SourceLine text={TEXT.s3.source} appear={fade(f, c(0.8), c(1.2))} />
    </AbsoluteFill>
  );
};

// --- S4 PLOT TWIST --------------------------------------------------------------

const S3_FREEZE_FRAME = () => cue('S3', 'stamp') + 14;

export const S4: React.FC = () => {
  const f = useCurrentFrame();
  const ban = cue('S4', 'ban');
  const q = cue('S4', 'question');
  const answers = [cue('S4', 'answer0'), cue('S4', 'answer1')];
  const bot = cue('S4', 'bot');
  const botSub = cue('S4', 'botSub');
  if (f < ban) {
    const jitter = f < 8 ? (f % 2 ? 14 : -14) : 0;
    return (
      <AbsoluteFill style={{background: WAR_BG}}>
        <AbsoluteFill style={{transform: `translateX(${jitter}px)`, filter: `grayscale(${fade(f, 0, 4)}) contrast(1.15) brightness(0.55)`}}>
          <Freeze frame={S3_FREEZE_FRAME()}>
            <S3 />
          </Freeze>
        </AbsoluteFill>
        <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 3px, transparent 3px 7px)'}} />
        <Center>
          <Mono size={34} color={RED} style={{opacity: Math.floor(f / 8) % 2 ? 0.4 : 1}}>❚❚ DURAKLATILDI</Mono>
          <div style={{font: `800 150px/1 ${FONTS.sans}`, color: COLORS.cream, letterSpacing: '-0.02em', transform: `scale(${interpolate(f, [0, 6], [1.25, 1], {extrapolateRight: 'clamp'})})`, transformOrigin: 'left center'}}>
            {TEXT.s4.freeze}
          </div>
        </Center>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <WarMap cam={{lon: 104, lat: 35, scale: 900}} highlight={['cn']} dim={0.3} />
      <TopTag tag="PLOT TWIST" appear={1} />
      {f < answers[0] ? (
        <Center>
          <TiltCard t={f - ban} dir={-1}>
            <Mono size={28} color={COLORS.dimLight}>
              BİLGİ NOTU
            </Mono>
            <div style={{font: `800 80px/1.08 ${FONTS.sans}`, marginTop: 18, letterSpacing: '-0.015em'}}>{TEXT.s4.ban.text}</div>
          </TiltCard>
          <div style={{font: `800 76px/1.05 ${FONTS.sans}`, color: COLORS.cream, letterSpacing: '-0.02em', opacity: fade(f, q, q + 6), marginTop: 30}}>{TEXT.s4.question}</div>
        </Center>
      ) : f < bot ? (
        <Center>
          <div style={{font: `800 76px/1.05 ${FONTS.sans}`, color: COLORS.cream, letterSpacing: '-0.02em'}}>{TEXT.s4.question}</div>
          {TEXT.s4.answers.map((a, i) => {
            const t = f - answers[i];
            return (
              <div key={a} style={{opacity: fade(t, 0, 6), transform: `translateY(${interpolate(t, [0, 8], [40, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`, width: CONTENT_W, boxSizing: 'border-box', padding: '30px 36px', background: COLORS.cardDark, borderRadius: 16, borderLeft: `10px solid ${COLORS.blue}`, display: 'flex', gap: 26, alignItems: 'baseline'}}>
                <Mono size={34} color={'#8FA6FF'}>{String(i + 1).padStart(2, '0')}</Mono>
                <div style={{font: `800 60px/1.1 ${FONTS.sans}`, color: COLORS.cream}}>{a}</div>
              </div>
            );
          })}
        </Center>
      ) : (
        <Center>
          <TiltCard t={f - bot} dir={1} light={false} style={{border: `2px solid ${COLORS.lineDark}`}}>
            <svg width={120} height={96} viewBox="0 0 120 96">
              {[0, 34, 68].map((y) => (
                <g key={y}>
                  <rect x={4} y={y + 2} width={112} height={26} rx={5} fill="none" stroke={COLORS.cream} strokeWidth={4} />
                  <circle cx={20} cy={y + 15} r={4} fill={Math.floor(f / 7 + y) % 2 ? '#8FA6FF' : COLORS.cream} />
                </g>
              ))}
            </svg>
            <div style={{font: `800 80px/1.08 ${FONTS.sans}`, marginTop: 22}}>{TEXT.s4.bot.main}</div>
            <div style={{font: `500 42px/1.25 ${FONTS.sans}`, marginTop: 20, color: COLORS.dimDark, opacity: fade(f, botSub - 4, botSub + 4)}}>{TEXT.s4.bot.sub}</div>
          </TiltCard>
        </Center>
      )}
      {f >= ban && f < answers[0] ? <SourceLine text={TEXT.s4.ban.source} /> : null}
    </AbsoluteFill>
  );
};

// --- S5 CİDDİ BİR BAŞLIK ------------------------------------------------------
// Bu sahnede espri, efekt, damga ve hareketli harita yok: krem zemin, sade tipografi, yalnızca yumuşak beliriş.

export const S5: React.FC = () => {
  const f = useCurrentFrame();
  const show = (at: number) => ({opacity: fade(f, at, at + 10)});
  const lines = [cue('S5', 'line0'), cue('S5', 'line1')];
  return (
    <AbsoluteFill style={{background: COLORS.cream, color: COLORS.black}}>
      <TopTag tag={TEXT.s5.tag} light noBlink appear={fade(f, 0, 10)} />
      <Center top={360} justify="flex-start">
        <div style={{font: `800 88px/1.04 ${FONTS.sans}`, letterSpacing: '-0.02em', ...show(cue('S5', 'title'))}}>{TEXT.s5.title}</div>
        <div style={show(cue('S5', 'region'))}>
          <div style={{font: `700 28px ${FONTS.mono}`, letterSpacing: '0.08em', color: COLORS.dimLight}}>BÖLGE</div>
          <div style={{font: `800 50px/1.2 ${FONTS.sans}`, marginTop: 8}}>{TEXT.s5.region}</div>
        </div>
        <div style={{width: CONTENT_W, height: 3, background: COLORS.black, opacity: 0.85 * fade(f, lines[0], lines[0] + 10)}} />
        {TEXT.s5.lines.map((l, i) => (
          <div key={l} style={{font: `500 50px/1.25 ${FONTS.sans}`, ...show(lines[i])}}>
            {l}
          </div>
        ))}
      </Center>
      <SourceLine text={TEXT.s5.source} light appear={fade(f, lines[0], lines[0] + 10)} />
    </AbsoluteFill>
  );
};


// --- S6 MASADA BAŞKA BİR TABLO ----------------------------------------------------

const BAKU = {lon: 49.8671, lat: 40.4093};

export const S6: React.FC = () => {
  const f = useCurrentFrame();
  const tag = cue('S6', 'tag');
  const meet = cue('S6', 'meeting');
  const oc = cue('S6', 'oneChina');
  const split = cue('S6', 'split');
  const intro = fade(f, 0, 12);
  if (f >= split) {
    const t = f - split;
    const wipe = interpolate(t, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
    return (
      <AbsoluteFill style={{background: WAR_BG}}>
        <AbsoluteFill style={{clipPath: 'inset(0 50% 0 0)'}}>
          <WarMap cam={{lon: 72, lat: 40, scale: 330}} cy={880}>
            {(p) => {
              const [ix, iy] = pt(p, COORDS.istanbul);
              const [bx, by] = pt(p, COORDS.pekin);
              return (
                <>
                  <RouteArrow proj={p} pts={ROUTE.slice(0, 41)} progress={fade(t, 0, 16)} color={SIDES.tr.color} width={5} />
                  <RouteArrow proj={p} pts={[...ROUTE].reverse().slice(0, 41)} progress={fade(t, 0, 16)} color={SIDES.cn.color} width={5} />
                  <Target x={ix} y={iy} color={SIDES.tr.color} />
                  <Target x={bx} y={by} color={SIDES.cn.color} />
                </>
              );
            }}
          </WarMap>
        </AbsoluteFill>
        <div style={{position: 'absolute', left: 540, top: 0, bottom: 0, right: 0, background: COLORS.cream, transform: `translateX(${(1 - wipe) * 540}px)`}}>
          <div style={{position: 'absolute', left: 0, right: SAFE.right, top: 700, display: 'flex', justifyContent: 'center'}}>
            <TableIcon size={300} color={COLORS.black} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 540 - 2, width: 4, top: 0, bottom: 0, background: COLORS.blue}} />
        <div style={{position: 'absolute', top: 1180, left: SAFE.left, width: 540 - SAFE.left - 30, font: `800 64px/1.05 ${FONTS.sans}`, color: COLORS.cream, opacity: fade(t, 6, 14)}}>
          {TEXT.s6.splitLeft}
        </div>
        <div style={{position: 'absolute', top: 1180, left: 580, width: 1080 - SAFE.right - 580, font: `800 64px/1.05 ${FONTS.sans}`, color: COLORS.black, opacity: fade(t, 10, 18)}}>
          {TEXT.s6.splitRight}
        </div>
        <TopTag tag="İKİ TABLO" />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <WarMap cam={{lon: BAKU.lon, lat: BAKU.lat, scale: interpolate(f, [0, split], [1300, 1450])}} highlight={[]} dim={0.45 * intro} cy={760}>
        {(p) => {
          const [x, y] = pt(p, BAKU);
          return <Target x={x} y={y} color={COLORS.cream} label="BAKÜ" />;
        }}
      </WarMap>
      <TopTag tag={f < tag ? 'DİPLOMASİ' : TEXT.s6.tag} appear={1} />
      {f < meet ? (
        <div style={{position: 'absolute', left: SAFE.left, right: SAFE.right, top: 1040, opacity: fadeOut(f, meet - 6, meet)}}>
          <WordByWord text={TEXT.s6.intro} t={f - 4} size={96} every={5} />
        </div>
      ) : null}
      <Center top={980} justify="flex-start">
        {f < meet ? null : f < oc ? (
          <TiltCard t={f - meet} dir={-1}>
            <Mono size={28} color={COLORS.dimLight}>
              İKİLİ GÖRÜŞME
            </Mono>
            <div style={{font: `800 58px/1.12 ${FONTS.sans}`, marginTop: 16}}>{TEXT.s6.meeting.text}</div>
          </TiltCard>
        ) : (
          <TiltCard t={f - oc} dir={1} light={false} style={{border: `2px solid ${COLORS.lineDark}`}}>
            <div style={{font: `500 48px/1.25 ${FONTS.sans}`}}>{TEXT.s6.oneChina.text}</div>
            <Mono size={28} style={{marginTop: 18}}>
              {TEXT.s6.oneChina.source}
            </Mono>
          </TiltCard>
        )}
      </Center>
      {f < oc ? <SourceLine text={TEXT.s6.meeting.source} appear={fade(f, meet + 6, meet + 12)} /> : null}
    </AbsoluteFill>
  );
};

// --- S7 KAPANIŞ -------------------------------------------------------------

export const S7: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const end = durationInFrames - ENDCARD_SECONDS * FPS;
  const cta = cue('S7', 'cta');
  return (
    <AbsoluteFill>
      <WarMap cam={{lon: 72, lat: 38, scale: 470}} dim={0.35} cy={820} />
      <TopTag tag="SON DURUM" />
      <Center>
        <WordByWord text={TEXT.s7.question} t={f} size={104} every={5} />
        <div style={{font: `500 56px/1.2 ${FONTS.sans}`, color: COLORS.cream, opacity: fade(f, cta, cta + 8)}}>{TEXT.s7.cta}</div>
      </Center>
      <Sequence from={end}>
        <EndCard note={TEXT.s7.endNote} />
      </Sequence>
    </AbsoluteFill>
  );
};
