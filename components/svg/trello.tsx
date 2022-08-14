import { SVGProps } from 'react';

export default function TrelloLogo(props?: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
      <defs>
        <linearGradient
          id="linear-gradient"
          x1="-501.63"
          y1="535.17"
          x2="-501.63"
          y2="536.44"
          gradientTransform="matrix(25.21, 0, 0, -25.19, 12661.11, 13514.01)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#0052cc" />
          <stop offset="1" stopColor="#2684ff" />
        </linearGradient>
      </defs>
      <rect x="3.72" y="5.28" width="24.56" height="20.11" fill="#fff" />
      <path
        d="M28.2,0H3.8A3.8,3.8,0,0,0,0,3.8V28.18A3.81,3.81,0,0,0,3.8,32H28.2A3.81,3.81,0,0,0,32,28.18V3.8A3.8,3.8,0,0,0,28.2,0ZM13.8,23.05a1.28,1.28,0,0,1-1.28,1.27H7.19a1.27,1.27,0,0,1-1.26-1.27V7.17A1.27,1.27,0,0,1,7.19,5.9h5.33a1.28,1.28,0,0,1,1.27,1.27Zm12.3-7.29a1.26,1.26,0,0,1-.37.9,1.29,1.29,0,0,1-.91.37H19.49a1.28,1.28,0,0,1-1.27-1.27V7.17A1.28,1.28,0,0,1,19.49,5.9h5.33a1.27,1.27,0,0,1,1.26,1.27Z"
        fillRule="evenodd"
        fill="url(#linear-gradient)"
      />
    </svg>
  );
}
