// azerbaycan-carousel: her kare 400 karelik bir pencere; PNG pencerenin son karesinden alınır (01.png … 12.png)
import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {COLORS, ThemeName} from '../../brand/tokens';
import {Headline, Kicker, MONO, QaCtx} from '../../brand/ui';
import {CAROUSEL, CarouselFrame, CBOX, slideAt} from '../../brand/Carousel';
import {DonutStat} from '../../brand/DonutStat';
import {NEUTRAL_LINE, SplitCard} from '../../brand/SplitCard';
import {QuoteCard, QuoteLine} from '../../brand/QuoteCard';
import {CAROUSEL_AZ} from '../../data/azerbaycan.carousel';
import {AccentHeadline, BigNumber, BodyText, EndSlide, Source, Stage} from './shared';
import {FlightCard, Timeline} from './azGraphics';

type Slide = {theme: ThemeName; bg?: string; body: React.ReactNode};

export const azerbaycanSlides = (): Slide[] => {
  const c = CAROUSEL_AZ;
  const s = c.sides;
  const t = c.today;

  return [
    // 01 — kanca + sondaki bölüme teaser (lacivert zemin, videonun açılışı gibi)
    {
      theme: 'dark',
      bg: COLORS.navy,
      body: (
        <Stage align="bottom">
          <Kicker color="rgba(242,238,230,0.85)">{c.cover.kicker}</Kicker>
          <div style={{marginTop: 18}}>
            <AccentHeadline text={c.cover.headline} accent={c.cover.accent} mode="box" color={COLORS.cream} size={100} />
          </div>
          <BodyText size={36} color="rgba(242,238,230,0.92)" style={{marginTop: 34, marginBottom: 6, fontWeight: 600}}>
            <span style={{color: COLORS.red}}>→</span> {c.cover.teaser}
          </BodyText>
        </Stage>
      ),
    },
    // 02 — 309 sayılı karar
    {
      theme: 'dark',
      bg: COLORS.navy,
      body: (
        <Stage>
          <Kicker>{c.rule.kicker}</Kicker>
          <div style={{marginTop: 26, background: COLORS.cream, borderRadius: 18, padding: '26px 32px 32px'}}>
            <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: 3, color: 'rgba(22,22,22,0.55)'}}>{c.rule.cardKicker}</div>
            <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 46, lineHeight: 1.25, color: COLORS.black, marginTop: 14}}>{c.rule.cardText}</div>
          </div>
          <Headline size={80} style={{marginTop: 44}}>
            {c.rule.headline}
          </Headline>
          <BodyText style={{marginTop: 22}}>{c.rule.body}</BodyText>
          <Source>{c.rule.source}</Source>
        </Stage>
      ),
    },
    // 03 — öğretmenler + 37 gözaltı
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{c.protest.kicker}</Kicker>
          <BodyText style={{marginTop: 18, fontWeight: 600}}>{c.protest.step}</BodyText>
          <div style={{marginTop: 30}}>
            <BigNumber size={300} color={COLORS.red}>
              {c.protest.value}
            </BigNumber>
          </div>
          <Headline size={96}>{c.protest.label}</Headline>
          <BodyText style={{marginTop: 22}}>{c.protest.body}</BodyText>
          <Source>{c.protest.source}</Source>
        </Stage>
      ),
    },
    // 04 — iki taraf: aynı bileşen, aynı punto, aynı nötr çizgi
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{s.kicker}</Kicker>
          <Headline size={84} style={{marginTop: 14, marginBottom: 34}}>
            {s.headline}
          </Headline>
          <SplitCard
            size="small"
            width={CBOX.width}
            left={{title: s.left.title, text: s.left.text, who: s.left.source, lineColor: NEUTRAL_LINE}}
            right={{title: s.right.title, text: s.right.text, who: s.right.source, lineColor: NEUTRAL_LINE}}
            footer={<BodyText size={36} style={{marginTop: 28, fontWeight: 600}}>{s.common}</BodyText>}
          />
          <Source>{s.source}</Source>
        </Stage>
      ),
    },
    // 05 — Ankara → Bakü: iki alıntı, aynı kart
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{c.exchange.kicker}</Kicker>
          <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 26}}>
            {[c.exchange.a, c.exchange.b].map((q) => (
              <QuoteCard key={q.name} size="small" width={CBOX.width} text={q.text} name={q.name} title={q.title} date={q.date} />
            ))}
          </div>
        </Stage>
      ),
    },
    // 06 — Herzog'un uçuşu
    {
      theme: 'dark',
      bg: COLORS.navy,
      body: (
        <Stage>
          <Kicker>{c.flight.kicker}</Kicker>
          <BodyText style={{marginTop: 18, fontWeight: 600}}>{c.flight.rule}</BodyText>
          <div style={{marginTop: 34}}>
            <FlightCard {...c.flight.card} width={CBOX.width} />
          </div>
          <Headline size={68} style={{marginTop: 40}}>
            {c.flight.headline}
          </Headline>
          <BodyText size={38} style={{marginTop: 22}}>
            {c.flight.body}
          </BodyText>
          <Source>{c.flight.source}</Source>
        </Stage>
      ),
    },
    // 07 — CICA zirvesi
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{c.cica.kicker}</Kicker>
          <Headline size={84} style={{marginTop: 18}}>
            {c.cica.headline}
          </Headline>
          <BodyText style={{marginTop: 30}}>{c.cica.body}</BodyText>
          <Source>{c.cica.source}</Source>
        </Stage>
      ),
    },
    // 08 — silah ticareti: iki halka aynı boyut
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{c.arms.kicker}</Kicker>
          <Headline size={96} style={{marginTop: 14, marginBottom: 40}}>
            {c.arms.headline}
          </Headline>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            {[c.arms.left, c.arms.right].map((d) => (
              <div key={d.label} style={{width: 440, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <DonutStat value={d.value} label="" size={340} />
                <BodyText size={36} style={{textAlign: 'center', marginTop: 12}}>
                  {d.label}
                </BodyText>
              </div>
            ))}
          </div>
          <BodyText size={38} style={{marginTop: 46, fontWeight: 600, borderTop: '2px solid rgba(22,22,22,0.14)', paddingTop: 24}}>
            {c.arms.note}
          </BodyText>
          <Source>{c.arms.source}</Source>
        </Stage>
      ),
    },
    // 09 — BUGÜN: Saral görevden ayrıldı
    {
      theme: 'dark',
      body: (
        <Stage>
          <div style={{alignSelf: 'flex-start', background: COLORS.red, color: COLORS.cream, borderRadius: 8, padding: '8px 16px', fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 3}}>
            {t.kicker}
          </div>
          <Headline size={96} style={{marginTop: 24}}>
            {t.headline}
          </Headline>
          <div style={{marginTop: 34, background: COLORS.cream, borderRadius: 20, padding: '28px 32px'}}>
            <QuoteLine text={t.quote} size={40} />
            <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 24, color: 'rgba(22,22,22,0.62)', marginTop: 16}}>{t.who}</div>
          </div>
          <BodyText size={36} style={{marginTop: 24}}>
            {t.answer}
          </BodyText>
          <div style={{marginTop: 44}}>
            <Timeline items={t.timeline} width={CBOX.width} />
          </div>
          <Source style={{marginTop: 30}}>{t.source}</Source>
        </Stage>
      ),
    },
    // 10 — soru (bugünkü gelişmeden zirveye)
    {
      theme: 'light',
      body: (
        <Stage>
          <Kicker>{c.question.kicker}</Kicker>
          <div style={{marginTop: 18}}>
            <AccentHeadline text={c.question.text} accent={c.question.accent} mode="box" size={104} />
          </div>
          <div style={{marginTop: 36}}>
            <Kicker style={{fontSize: 34, letterSpacing: 1, lineHeight: 1.35}}>{c.question.note}</Kicker>
          </div>
        </Stage>
      ),
    },
    // 11 — kaynaklar + CTA
    {
      theme: 'light',
      body: <EndSlide headline={c.end.headline} sources={c.sources} photoLine={c.caption.photoLine} cta={c.end.cta} />,
    },
  ];
};

export const AZERBAYCAN_SLIDE_COUNT = 11;

export const AzerbaycanCarousel: React.FC<{qa?: boolean}> = ({qa = false}) => {
  const frame = useCurrentFrame();
  const slides = azerbaycanSlides();
  const i = slideAt(frame, slides.length);
  const sl = slides[i];
  return (
    <QaCtx.Provider value={qa}>
      <Sequence from={i * CAROUSEL.slideFrames} durationInFrames={CAROUSEL.slideFrames}>
        <CarouselFrame theme={sl.theme} bg={sl.bg} index={i} total={slides.length}>
          {sl.body}
        </CarouselFrame>
      </Sequence>
    </QaCtx.Provider>
  );
};
