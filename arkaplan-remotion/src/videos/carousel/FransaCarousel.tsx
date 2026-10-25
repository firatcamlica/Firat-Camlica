// fransa-carousel: her kare 400 karelik bir pencere; PNG pencerenin son karesinden alınır (01.png … 13.png)
import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {COLORS, ThemeName} from '../../brand/tokens';
import {Headline, Kicker, MONO, QaCtx, formatTr} from '../../brand/ui';
import {CAROUSEL, CarouselFrame, CBOX, slideAt} from '../../brand/Carousel';
import {CompareBars} from '../../brand/DataCard';
import {DonutStat} from '../../brand/DonutStat';
import {NEUTRAL_LINE, SplitCard} from '../../brand/SplitCard';
import {PhotoCredit} from '../../brand/Photo';
import {ACCENT, PHOTO_SLOTS, TEXT} from '../../data/fransa';
import {CAROUSEL_FR} from '../../data/fransa.carousel';
import {AccentHeadline, BigNumber, BodyText, EndSlide, Source, Stage} from './shared';
import {FridgeThermo, LoginScreen} from './graphics';

export type CarouselProps = {photos: PhotoCredit[]; qa?: boolean};

type Slide = {theme: ThemeName; photo?: PhotoCredit; photoOpacity?: number; photoTop?: number; body: React.ReactNode};

const resolvePhotos = (photos: PhotoCredit[]) => {
  const by = (id: string) => photos.find((p) => p.id === id);
  return {hook: by(PHOTO_SLOTS.hook), s4: by(PHOTO_SLOTS.s4)};
};

export const fransaSlides = (photos: PhotoCredit[]): Slide[] => {
  const p = resolvePhotos(photos);
  const c = CAROUSEL_FR;
  const s4 = TEXT.s4;
  const s5 = TEXT.s5;
  const e = c.election;
  const w1 = c.sameWeek1;
  const w2 = c.sameWeek2;

  return [
    // 01 — kanca + kapak fotoğrafı + sondaki bölüme teaser
    {
      theme: 'dark',
      photo: p.hook,
      photoTop: 240,
      body: (
        <Stage align="bottom">
          <Kicker color="rgba(242,238,230,0.85)">{TEXT.s0.kicker}</Kicker>
          <div style={{marginTop: 18}}>
            <AccentHeadline text={TEXT.s0.headline} accent={TEXT.s0.accentWord} mode="color" color={COLORS.cream} size={118} />
          </div>
          <BodyText size={36} color="rgba(242,238,230,0.92)" style={{marginTop: 34, marginBottom: 6, fontWeight: 600}}>
            <span style={{color: ACCENT}}>→</span> {c.cover.teaser}
          </BodyText>
        </Stage>
      ),
    },
    // 02 — kıvılcım
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{c.spark.kicker}</Kicker>
          <Headline size={96} style={{marginTop: 18}}>
            {c.spark.headline}
          </Headline>
          <BodyText style={{marginTop: 30}}>{c.spark.body}</BodyText>
          <Source>{c.spark.source}</Source>
        </Stage>
      ),
    },
    // 03 — 35+ kişilik sınıflar
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{c.classSize.kicker}</Kicker>
          <BigNumber size={300}>{c.classSize.value}</BigNumber>
          <Headline size={84} style={{marginTop: 10}}>
            {c.classSize.label}
          </Headline>
          <Source>{c.classSize.source}</Source>
        </Stage>
      ),
    },
    // 04 — yayılma
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{c.spread.kicker}</Kicker>
          <BigNumber size={300}>{formatTr(TEXT.s2.steps[TEXT.s2.steps.length - 1].value, 0)}</BigNumber>
          <Headline size={84} style={{marginTop: 10}}>
            {TEXT.s2.counterLabel}
          </Headline>
          <BodyText style={{marginTop: 26}}>{TEXT.s2.footer}</BodyText>
          <Source>{c.spread.source}</Source>
        </Stage>
      ),
    },
    // 05 — gözaltı (koyu, fotoğraf %35)
    {
      theme: 'dark',
      photo: p.s4,
      photoOpacity: 0.35,
      body: (
        <Stage>
          <BigNumber size={250} color={ACCENT}>
            {formatTr(s4.detentions.value, 0)}
          </BigNumber>
          <Headline size={96} color={COLORS.cream}>
            {s4.detentions.label}
          </Headline>
          <Headline size={72} color={ACCENT} style={{marginTop: 30}}>
            {s4.minors.text}
          </Headline>
          <Source>{s4.source}</Source>
        </Stage>
      ),
    },
    // 06 — Lens olayı
    {
      theme: 'dark',
      body: (
        <Stage>
          <div style={{background: COLORS.cream, borderRadius: 22, padding: '40px 40px 44px'}}>
            <Headline size={72} color={COLORS.black} style={{lineHeight: 1.06}}>
              {s4.event}
            </Headline>
            <BodyText color="rgba(22,22,22,0.75)" style={{marginTop: 22}}>
              {s4.eventNote}
            </BodyText>
          </div>
          <Source>{s4.source}</Source>
        </Stage>
      ),
    },
    // 07 — 13 Ekim katılımı
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{c.turnout.kicker}</Kicker>
          <Headline size={96} style={{marginTop: 14}}>
            {s5.turnout.title}
          </Headline>
          <div style={{marginTop: 60}}>
            <CompareBars width={CBOX.width} bars={s5.turnout.bars} />
          </div>
          <Source>{s5.turnout.source}</Source>
        </Stage>
      ),
    },
    // 08 — %62
    {
      theme: 'light',
      body: (
        <Stage>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <DonutStat value={s5.split.ring} label="" size={420} valueColor={ACCENT} />
          </div>
          <Headline size={72} style={{textAlign: 'center', marginTop: 10}}>
            {s5.split.ringLabel}
          </Headline>
          <Source style={{textAlign: 'center'}}>{s5.split.source}</Source>
        </Stage>
      ),
    },
    // 09 — YENİ: sandık hesabı. İki taraf aynı bileşen, aynı punto, aynı nötr çizgi, aynı anda.
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{e.kicker}</Kicker>
          <Headline size={84} style={{marginTop: 14, marginBottom: 34}}>
            {e.headline}
          </Headline>
          <SplitCard
            size="small"
            width={CBOX.width}
            left={{title: e.left.title, quote: e.left.quote, text: e.left.text, who: e.left.source, lineColor: NEUTRAL_LINE}}
            right={{title: e.right.title, quote: e.right.quote, text: e.right.text, who: e.right.source, lineColor: NEUTRAL_LINE}}
            footer={<BodyText size={36} style={{marginTop: 28, fontWeight: 600}}>{e.common}</BodyText>}
          />
        </Stage>
      ),
    },
    // 10 — soru
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{c.question.kicker}</Kicker>
          <div style={{marginTop: 18}}>
            <AccentHeadline text={TEXT.s6.question} accent="sandığa" mode="box" size={112} />
          </div>
          <div style={{marginTop: 36}}>
            <Kicker style={{fontSize: 40, letterSpacing: 1}}>{TEXT.s6.note}</Kicker>
          </div>
        </Stage>
      ),
    },
    // 11 — YENİ: aynı hafta 1
    {
      theme: 'dark',
      body: (
        <Stage>
          <Kicker>{w1.kicker}</Kicker>
          <div style={{alignSelf: 'flex-start', marginTop: 16, background: '#D9D5CE', color: COLORS.black, borderRadius: 8, padding: '8px 16px', fontFamily: MONO, fontWeight: 500, fontSize: 24}}>
            {w1.disclaimer}
          </div>
          <Headline size={76} style={{marginTop: 28}}>
            {w1.headline}
          </Headline>
          <div style={{marginTop: 34}}>
            <FridgeThermo from={w1.thermo.from} to={w1.thermo.to} height={250} />
          </div>
          <div style={{marginTop: 26, display: 'flex', flexDirection: 'column'}}>
            {w1.rows.map((r) => (
              <BodyText key={r} size={36} style={{borderTop: '2px solid rgba(242,238,230,0.16)', padding: '12px 0'}}>
                {r}
              </BodyText>
            ))}
          </div>
          <Source style={{marginTop: 10}}>{w1.source}</Source>
        </Stage>
      ),
    },
    // 12 — YENİ: aynı hafta 2
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{w2.kicker}</Kicker>
          <Headline size={96} style={{marginTop: 14}}>
            {w2.headline}
          </Headline>
          <div style={{marginTop: 30}}>
            <LoginScreen user={w2.login.user} pass={w2.login.pass} width={CBOX.width} />
          </div>
          <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14}}>
            {w2.points.map((pt, i) => (
              <div key={pt} style={{display: 'flex', gap: 16}}>
                <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 36, lineHeight: 1.2, color: COLORS.blue}}>{i + 1}.</div>
                <BodyText size={36}>{pt}</BodyText>
              </div>
            ))}
          </div>
          <BodyText size={36} color="rgba(22,22,22,0.6)" style={{marginTop: 26}}>
            {w2.footnote}
          </BodyText>
          <Source style={{marginTop: 14}}>{w2.source}</Source>
        </Stage>
      ),
    },
    // 13 — kaynaklar + CTA
    {
      theme: 'light',
      body: <EndSlide headline={c.end.headline} sources={c.sources} photoLine={c.caption.photoLine} cta={c.end.cta} />,
    },
  ];
};

export const FRANSA_SLIDE_COUNT = 13;

export const FransaCarousel: React.FC<CarouselProps> = ({photos, qa = false}) => {
  const frame = useCurrentFrame();
  const slides = fransaSlides(photos);
  const i = slideAt(frame, slides.length);
  const s = slides[i];
  return (
    <QaCtx.Provider value={qa}>
      <Sequence from={i * CAROUSEL.slideFrames} durationInFrames={CAROUSEL.slideFrames}>
        <CarouselFrame theme={s.theme} index={i} total={slides.length} photo={s.photo} photoOpacity={s.photoOpacity} photoTop={s.photoTop}>
          {s.body}
        </CarouselFrame>
      </Sequence>
    </QaCtx.Provider>
  );
};
