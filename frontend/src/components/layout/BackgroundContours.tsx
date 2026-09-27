/** Topographic contour lines behind the page, echoing the data "terrain". */
export const BackgroundContours = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 1500"
      preserveAspectRatio="xMidYMin slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-[1500px] w-full text-edge/60"
    >
      <path d="M980 120 C 1180 60, 1400 180, 1380 380 S 1180 640, 1000 560 S 820 200, 980 120 Z" />
      <path d="M1000 160 C 1160 110, 1340 210, 1330 370 S 1170 590, 1020 520 S 870 230, 1000 160 Z" />
      <path d="M1020 200 C 1140 160, 1280 240, 1280 360 S 1160 540, 1040 480 S 920 260, 1020 200 Z" />
      <path d="M1040 240 C 1130 210, 1230 270, 1230 350 S 1150 490, 1060 440 S 970 290, 1040 240 Z" />
      <path d="M1060 280 C 1120 260, 1180 300, 1180 345 S 1135 440, 1080 405 S 1020 320, 1060 280 Z" />
      <path d="M-60 980 C 160 900, 380 1040, 360 1220 S 120 1480, -60 1400" />
      <path d="M-60 1030 C 130 960, 320 1080, 305 1220 S 100 1430, -60 1360" />
      <path d="M-60 1080 C 100 1020, 260 1120, 250 1220 S 80 1380, -60 1320" />
      <path d="M600 1500 C 700 1320, 980 1300, 1120 1420 S 1400 1480, 1500 1380" />
      <path d="M640 1500 C 740 1360, 980 1350, 1100 1450 S 1380 1520, 1500 1430" />
    </svg>
  </div>
)
