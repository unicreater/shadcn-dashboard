// Agents.tsx
import clsx from "clsx";
import React from "react";

type Props = { selected: boolean };

const Agents = ({ selected }: Props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx(
          "dark:group-hover:stroke-[#C8C7FF] transition-all dark:stroke-[#353346] stroke-[#BABABB] group-hover:stroke-[#7540A9]",
          { "dark:!stroke-[#C8C7FF] !stroke-[#7540A9] ": selected }
        )}
      />
      <circle
        cx="12"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx(
          "dark:group-hover:stroke-[#C8C7FF] transition-all dark:stroke-[#353346] stroke-[#BABABB] group-hover:stroke-[#7540A9]",
          { "dark:!stroke-[#C8C7FF] !stroke-[#7540A9] ": selected }
        )}
      />
      <circle
        cx="18"
        cy="8"
        r="2"
        className={clsx(
          "dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]",
          { "dark:!fill-[#C8C7FF] !fill-[#7540A9] ": selected }
        )}
      />
      <circle
        cx="6"
        cy="8"
        r="2"
        className={clsx(
          "dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]",
          { "dark:!fill-[#C8C7FF] !fill-[#7540A9] ": selected }
        )}
      />
    </svg>
  );
};

export default Agents;
