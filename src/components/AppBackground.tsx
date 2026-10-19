/** Warm, blurred light blobs behind the UI; they give the glass surfaces something to frost. */
export function AppBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-24 size-96 rounded-full bg-amber-500/30 blur-3xl" />
      <div className="absolute top-1/3 -right-32 size-96 rounded-full bg-rose-500/25 blur-3xl" />
      <div className="absolute -bottom-40 left-1/4 size-[28rem] rounded-full bg-orange-400/20 blur-3xl" />
    </div>
  )
}
