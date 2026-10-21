import React from 'react';
import {
  Body,
  C,
  FONT,
  Frame,
  Graphic,
  Label,
  LogoMark,
  Mark,
  Meta,
  Source,
  Spacer,
  SplitCard,
  Title,
  useEnter,
} from '../brand';
import {PHOTO_CREDIT_LINE, PHOTO_CREDITS, PHOTO_SLOTS, fransa} from '../data/fransa';
import {CreteilMap, Donut, FranceMap, FridgeThermo, LoginScreen} from './graphics';

const d = fransa.carousel;
const credit = (id: string) => `Foto: ${PHOTO_CREDITS[id]}`;

const Chip: React.FC<{children: React.ReactNode; active?: boolean}> = ({children, active}) => (
  <span
    style={{
      fontFamily: FONT.mono,
      fontWeight: 500,
      fontSize: 26,
      padding: '6px 14px',
      borderRadius: 6,
      background: active ? C.blue : 'rgba(22,22,22,0.82)',
      color: C.white,
      display: 'inline-block',
    }}
  >
    {children}
  </span>
);

// 01 ------------------------------------------------------------------------------------
const Kapak: React.FC = () => {
  const a = useEnter(0);
  const [pre, red, post] = d.kapak.title;
  return (
    <Frame bg="photo" photo={PHOTO_SLOTS.kapak} photoY={240} shade={0.3}>
      <Label tone="light">{d.kapak.label}</Label>
      <Spacer />
      <div style={a.style}>
        <Title size={92} tone="light">
          {pre}
          <span style={{color: C.red}}>{red}</span>
          {post}
        </Title>
      </div>
      <div style={{height: 120}} />
      <Body tone="light" weight={600} style={{...a.style, display: 'flex', gap: 14, alignItems: 'baseline'}}>
        <span style={{color: C.red}}>→</span>
        <span>{d.kapak.teaser}</span>
      </Body>
      <Meta tone="light" style={{marginTop: 22}}>{credit(PHOTO_SLOTS.kapak)}</Meta>
    </Frame>
  );
};

// 02 ------------------------------------------------------------------------------------
const Kivilcim: React.FC = () => {
  const a = useEnter(0);
  const b = useEnter(6);
  return (
    <Frame bg="photo" photo={PHOTO_SLOTS.kivilcim} photoY={300} shade={0.35}>
      <Label tone="light">{d.kivilcim.label}</Label>
      <Graphic style={{marginTop: 34, ...a.style}}>
        <CreteilMap width={600} height={260} />
      </Graphic>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginTop: 22, ...b.style}}>
        <Chip>{d.kivilcim.chips[0]}</Chip>
        <Chip active>{d.kivilcim.chips[1]}</Chip>
      </div>
      <Spacer />
      <Title size={76} tone="light" style={b.style}>
        {d.kivilcim.title}
      </Title>
      <Source tone="light" style={{marginTop: 28}}>{d.kivilcim.source}</Source>
      <Meta tone="light">{credit(PHOTO_SLOTS.kivilcim)}</Meta>
    </Frame>
  );
};

// 03 ------------------------------------------------------------------------------------
const Sinif: React.FC = () => {
  const a = useEnter(0);
  const b = useEnter(6);
  return (
    <Frame bg="cream">
      <Label>{d.sinif.label}</Label>
      <Spacer />
      <div style={a.style}>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 380, lineHeight: 0.9, letterSpacing: '-0.05em', color: C.ink}}>
          {d.sinif.number}
        </div>
        <Title size={96} style={{marginTop: 18}}>{d.sinif.unit}</Title>
      </div>
      <Spacer />
      <div style={{borderTop: `2px solid ${C.line}`, paddingTop: 28, ...b.style}}>
        <Body muted>{d.sinif.also}</Body>
      </div>
      <Source style={{marginTop: 26}}>{d.sinif.source}</Source>
    </Frame>
  );
};

// 04 ------------------------------------------------------------------------------------
const Liseler: React.FC = () => {
  const a = useEnter(0);
  const m = useEnter(4, 24);
  return (
    <Frame bg="cream">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div style={a.style}>
          <Label>{d.liseler.label}</Label>
          <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 190, lineHeight: 0.95, letterSpacing: '-0.04em', color: C.ink, marginTop: 6}}>
            {d.liseler.number}
          </div>
          <div style={{display: 'flex', gap: 14, marginTop: 14}}>
            {d.liseler.steps.map((s, i) => (
              <Chip key={s.date} active={i === d.liseler.steps.length - 1}>
                {s.date} · {s.value}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <Graphic style={{alignSelf: 'flex-end', marginRight: 6, marginTop: -60}}>
        <FranceMap width={640} t={m.t} />
      </Graphic>
      <Spacer />
      <Title size={64} style={a.style}>{d.liseler.title}</Title>
      <Body muted style={{marginTop: 14}}>{d.liseler.note}</Body>
      <Source style={{marginTop: 18}}>{d.liseler.source}</Source>
    </Frame>
  );
};

// 05 ------------------------------------------------------------------------------------
const Gozalti: React.FC = () => {
  const a = useEnter(0);
  return (
    <Frame bg="photo" photo={PHOTO_SLOTS.gozalti} photoY={330} shade={0.4}>
      <Label tone="light">{d.gozalti.label}</Label>
      <div style={{marginTop: 40, ...a.style}}>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 250, lineHeight: 0.92, letterSpacing: '-0.04em', color: C.red}}>
          {d.gozalti.number}
        </div>
        <Title size={96} tone="light" style={{marginTop: 4}}>{d.gozalti.unit}</Title>
        <Title size={64} color="#FF4A55" style={{marginTop: 22}}>{d.gozalti.sub}</Title>
      </div>
      <Spacer />
      <Source tone="light">{d.gozalti.source}</Source>
      <Meta tone="light">{credit(PHOTO_SLOTS.gozalti)}</Meta>
    </Frame>
  );
};

// 06 ------------------------------------------------------------------------------------
const Lens: React.FC = () => {
  const a = useEnter(0);
  return (
    <Frame bg="photo" photo={PHOTO_SLOTS.gozalti} photoY={520} shade={0.5}>
      <Label tone="light">{d.lens.label}</Label>
      <Spacer />
      <div style={{background: C.paper, borderRadius: 22, padding: '40px 40px 44px', ...a.style}}>
        <Title size={72}>{d.lens.title}</Title>
        <Body style={{marginTop: 26}} muted>{d.lens.sub}</Body>
      </div>
      <Spacer />
      <Source tone="light">{d.lens.source}</Source>
      <Meta tone="light">{credit(PHOTO_SLOTS.gozalti)}</Meta>
    </Frame>
  );
};

// 07 ------------------------------------------------------------------------------------
const Rakamlar: React.FC = () => {
  const a = useEnter(0);
  const g = useEnter(6, 24);
  const max = Math.max(...d.rakamlar.bars.map((b) => b.value));
  return (
    <Frame bg="cream">
      <Label>{d.rakamlar.label}</Label>
      <Title size={104} style={{marginTop: 18, ...a.style}}>{d.rakamlar.title}</Title>
      <Spacer />
      <Graphic>
        {d.rakamlar.bars.map((b) => (
          <div key={b.name} style={{marginBottom: 46}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14}}>
              <span style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 44, color: C.ink}}>{b.name}</span>
              <span style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 52, color: C.ink}}>{b.text}</span>
            </div>
            <div style={{height: 46, background: '#DCD6CB', borderRadius: 6}}>
              <div style={{height: '100%', width: `${(b.value / max) * 100 * g.t}%`, background: C.ink, borderRadius: 6}} />
            </div>
          </div>
        ))}
      </Graphic>
      <Body muted>{d.rakamlar.note}</Body>
      <Spacer />
      <Source>{d.rakamlar.source}</Source>
    </Frame>
  );
};

// 08 ------------------------------------------------------------------------------------
const Anket: React.FC = () => {
  const a = useEnter(0);
  const g = useEnter(0, 26);
  return (
    <Frame bg="cream">
      <Label>{d.anket.label}</Label>
      <Spacer />
      <Graphic style={{alignSelf: 'center'}}>
        <Donut pct={d.anket.pct} size={480} t={g.t} />
      </Graphic>
      <Title size={84} style={{marginTop: 56, textAlign: 'center', ...a.style}}>{d.anket.title}</Title>
      <Spacer />
      <Source style={{textAlign: 'center'}}>{d.anket.source}</Source>
    </Frame>
  );
};

// 09 ------------------------------------------------------------------------------------
const Sandik: React.FC = () => {
  const a = useEnter(0);
  const c = useEnter(24);
  return (
    <Frame bg="cream">
      <Label>{d.sandik.label}</Label>
      <Title size={80} style={{marginTop: 16, marginBottom: 40, ...a.style}}>{d.sandik.title}</Title>
      <SplitCard left={d.sandik.left} right={d.sandik.right} quoteSize={44} noteSize={38} delay={6} duration={18} />
      <Spacer />
      <div style={{borderTop: `2px solid ${C.line}`, paddingTop: 24, ...c.style}}>
        <Body weight={600}>{d.sandik.common}</Body>
      </div>
    </Frame>
  );
};

// 10 ------------------------------------------------------------------------------------
const Soru: React.FC = () => {
  const a = useEnter(0);
  return (
    <Frame bg="cream">
      <Spacer />
      <div style={a.style}>
        <Title size={108}>
          {d.soru.before} <Mark>{d.soru.mark}</Mark> {d.soru.after}
        </Title>
        <Label style={{marginTop: 48}}>{d.soru.label}</Label>
      </div>
      <Spacer />
    </Frame>
  );
};

// 11 ------------------------------------------------------------------------------------
const Hafta1: React.FC = () => {
  const a = useEnter(0);
  const th = useEnter(8, 30);
  return (
    <Frame bg="dark">
      <Label tone="light">{d.hafta1.label}</Label>
      <div
        style={{
          alignSelf: 'flex-start',
          marginTop: 18,
          background: '#2B2B2B',
          border: '1px solid #4A4A4A',
          borderRadius: 8,
          padding: '8px 16px',
          fontFamily: FONT.mono,
          fontSize: 24,
          color: '#C9C5BE',
        }}
      >
        {d.hafta1.disclaimer}
      </div>
      <Title size={68} tone="light" style={{marginTop: 30, ...a.style}}>{d.hafta1.title}</Title>
      <Graphic style={{marginTop: 30}}>
        <FridgeThermo t={th.t} from={d.hafta1.thermo.from} to={d.hafta1.thermo.to} />
      </Graphic>
      <Spacer />
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {d.hafta1.rows.map((r) => (
          <div key={r} style={{display: 'flex', gap: 16, borderTop: '1px solid #3A3A3A', paddingTop: 14}}>
            <span style={{color: C.red, fontFamily: FONT.display, fontWeight: 800, fontSize: 36}}>•</span>
            <Body tone="light" size={36}>{r}</Body>
          </div>
        ))}
      </div>
      <Source tone="light" style={{marginTop: 22}}>{d.hafta1.source}</Source>
    </Frame>
  );
};

// 12 ------------------------------------------------------------------------------------
const Hafta2: React.FC = () => {
  const a = useEnter(0);
  const l = useEnter(6, 26);
  return (
    <Frame bg="cream">
      <Label>{d.hafta2.label}</Label>
      <Title size={96} style={{marginTop: 14, ...a.style}}>{d.hafta2.title}</Title>
      <Graphic style={{marginTop: 30}}>
        <LoginScreen user={d.hafta2.login.user} pass={d.hafta2.login.pass} t={l.t} />
      </Graphic>
      <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 34}}>
        {d.hafta2.points.map((p, i) => (
          <div key={p} style={{display: 'flex', gap: 18}}>
            <span style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 36, color: C.blue, lineHeight: 1.25}}>{i + 1}.</span>
            <Body>{p}</Body>
          </div>
        ))}
      </div>
      <Spacer />
      <Body muted style={{fontStyle: 'italic'}}>{d.hafta2.footnote}</Body>
      <Source style={{marginTop: 14}}>{d.hafta2.source}</Source>
    </Frame>
  );
};

// 13 ------------------------------------------------------------------------------------
const Kaynaklar: React.FC = () => (
  <Frame bg="cream">
    <Label>{d.kaynaklar.label}</Label>
    <div style={{marginTop: 26, display: 'flex', flexDirection: 'column'}}>
      {d.kaynaklar.list.map((s) => (
        <Body key={s} size={40} style={{borderBottom: `2px solid ${C.line}`, padding: '16px 0'}}>
          {s}
        </Body>
      ))}
    </div>
    <Meta size={24} style={{marginTop: 26, color: C.ink}}>{d.kaynaklar.links}</Meta>
    <Spacer />
    <div style={{fontFamily: FONT.display, fontWeight: 500, fontSize: 21, color: C.gray, whiteSpace: 'nowrap', marginBottom: 30}}>
      {PHOTO_CREDIT_LINE}
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
      <LogoMark size={92} />
      <div
        style={{
          flex: 1,
          background: C.blue,
          color: C.white,
          borderRadius: 999,
          padding: '26px 34px',
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 44,
          textAlign: 'center',
        }}
      >
        {d.kaynaklar.cta} →
      </div>
    </div>
  </Frame>
);

export const FRANSA_SLIDES: React.FC[] = [
  Kapak, Kivilcim, Sinif, Liseler, Gozalti, Lens, Rakamlar, Anket, Sandik, Soru, Hafta1, Hafta2, Kaynaklar,
];
