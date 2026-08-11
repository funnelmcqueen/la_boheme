/**
 * The fixed layers that sit behind and in front of everything: the water itself,
 * and the grain over it. Both are inert — the colour comes from --ground, which
 * the DepthEngine owns.
 */
export function Ground() {
  return (
    <>
      <div className="vj-ground" aria-hidden="true" />
      <div className="vj-grain" aria-hidden="true" />
    </>
  );
}
