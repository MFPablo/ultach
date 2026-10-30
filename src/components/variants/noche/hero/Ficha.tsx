"use client";

import { HeroStage } from "./stage";
import { Backdrop } from "./Backdrop";
import { DONE, SWEEP_END, Tiles } from "./Tiles";
import { Slats } from "./Slats";
import { usePlayStart } from "./play";

// Hero 3D de Noche, "Ficha". Miles de piezas vuelan en espiral y arman el emblema Atardecer (Tiles),
// con onda expansiva y barrido de luz (Backdrop, Tiles). Apenas termina el barrido (SWEEP_END), las
// láminas (Slats) reemplazan a las piezas de golpe, con el mismo color plano, así el relevo no se ve;
// desde ahí el emblema es una ficha que hace una onda en cascada y se inclina con el puntero.
// El texto del hero entra sincronizado (HERO_TIMING).

export default function Ficha() {
  const start = usePlayStart();
  return (
    <HeroStage camera={{ position: [0, 0, 10], fov: 35 }}>
      {(env) => (
        <>
          <Backdrop reduced={env.reduced} done={DONE} time={env.time} />
          <Tiles env={env} onStart={start} hideAfter={SWEEP_END + 0.05} />
          <Slats env={env} startAt={SWEEP_END} />
        </>
      )}
    </HeroStage>
  );
}
