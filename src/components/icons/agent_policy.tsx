// AgentPolicy.tsx
import clsx from "clsx";
import React from "react";

type Props = { selected: boolean };

const AgentPolicy = ({ selected }: Props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx(
          "dark:group-hover:stroke-[#C8C7FF] transition-all dark:stroke-[#353346] stroke-[#BABABB] group-hover:stroke-[#7540A9]",
          { "dark:!stroke-[#C8C7FF] !stroke-[#7540A9] ": selected }
        )}
      />
      <path
        d="M14 2V8H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx(
          "dark:group-hover:stroke-[#C8C7FF] transition-all dark:stroke-[#353346] stroke-[#BABABB] group-hover:stroke-[#7540A9]",
          { "dark:!stroke-[#C8C7FF] !stroke-[#7540A9] ": selected }
        )}
      />
      <path
        d="M16 13H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx(
          "dark:group-hover:stroke-[#C8C7FF] transition-all dark:stroke-[#353346] stroke-[#BABABB] group-hover:stroke-[#7540A9]",
          { "dark:!stroke-[#C8C7FF] !stroke-[#7540A9] ": selected }
        )}
      />
      <path
        d="M16 17H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx(
          "dark:group-hover:stroke-[#C8C7FF] transition-all dark:stroke-[#353346] stroke-[#BABABB] group-hover:stroke-[#7540A9]",
          { "dark:!stroke-[#C8C7FF] !stroke-[#7540A9] ": selected }
        )}
      />
      <path
        d="M10 9H9H8"
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
        cy="15"
        r="1"
        className={clsx(
          "dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]",
          { "dark:!fill-[#C8C7FF] !fill-[#7540A9] ": selected }
        )}
      />
    </svg>
  );
};

export default AgentPolicy;
