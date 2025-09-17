export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  title?: string;
};

export const Cswap = ({ size = 28 }: IconProps) => (
  <svg width={size} height={Number(size) * 1.14285714} viewBox="0 0 28 32" fill="none">
    <path d="M14 32l14-8V8l-14 8v16z" fill="url(#paint0_linear_5140_22880)" />

    <path d="M14 0L0 8l14 8 14-8-14-8z" fill="url(#paint1_linear_5140_22880)" />

    <path d="M0 8v16l14 8V16L0 8z" fill="url(#paint2_linear_5140_22880)" />

    <path
      d="M14.44 8.561s5.78 3.275 5.868 3.39c.088.114.096.237.03.344-.173.168-.285.19-.497.087l-5.402-3.074v6.297h5.46v4.561l-5.401 3.074c-.292.115-.613-.32-.234-.546 1.951-1.16 3.13-1.74 5.08-2.901v-3.577h-5.489V4.022L12.22 3.19 1.915 9.094v11.934l4.555 2.568a.969.969 0 01.642-.241c.532 0 .964.424.964.947a.956.956 0 01-.964.948.956.956 0 01-.942-1.149l-4.868-2.786V8.746L12.308 2.5c.821.479 1.31.699 2.132 1.178V8.56z"
      fill="#000"
    />

    <path
      d="M24.454 10.023L20.045 7.54a.97.97 0 01-.613.217.956.956 0 01-.963-.948c0-.524.431-.948.963-.948a.956.956 0 01.945 1.133l4.749 2.658v12.525L14 28.5l-1.956-1.21v-3.907l-5.46-3.188v-8.431l5.577-3.203c.38-.172.613.316.292.488L7.2 12.11v7.741l5.43 3.246v3.907l1.372.833 10.453-5.918V10.023z"
      fill="#000"
    />

    <defs>
      <linearGradient
        id="paint0_linear_5140_22880"
        x1={25.5036}
        y1={28.8977}
        x2={25.599}
        y2={14.7221}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#00D330" />

        <stop offset={0.891595} stopColor="#00EAD4" />
      </linearGradient>

      <linearGradient
        id="paint1_linear_5140_22880"
        x1={63.2701}
        y1={-0.847396}
        x2={3.4532}
        y2={6.48843}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.6525} stopColor="#01E735" />

        <stop offset={1} stopColor="#00EAD4" />
      </linearGradient>

      <linearGradient
        id="paint2_linear_5140_22880"
        x1={1.76642}
        y1={17.307}
        x2={1.25881}
        y2={25.3687}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#01E735" />

        <stop offset={1} stopColor="#00EAD4" />
      </linearGradient>
    </defs>
  </svg>
);
