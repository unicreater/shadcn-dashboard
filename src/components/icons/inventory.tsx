// Inventory.tsx
import clsx from "clsx";
import React from "react";

type Props = { selected: boolean };

const Inventory = ({ selected }: Props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V8H14V4H5C4.44772 4 4 4.44772 4 4Z"
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
        d="M14 4V8H20L14 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx(
          "dark:group-hover:stroke-[#C8C7FF] transition-all dark:stroke-[#353346] stroke-[#BABABB] group-hover:stroke-[#7540A9]",
          { "dark:!stroke-[#C8C7FF] !stroke-[#7540A9] ": selected }
        )}
      />
      <rect
        x="8"
        y="12"
        width="2"
        height="2"
        className={clsx(
          "dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]",
          { "dark:!fill-[#C8C7FF] !fill-[#7540A9] ": selected }
        )}
      />
      <rect
        x="12"
        y="12"
        width="2"
        height="2"
        className={clsx(
          "dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]",
          { "dark:!fill-[#C8C7FF] !fill-[#7540A9] ": selected }
        )}
      />
      <rect
        x="8"
        y="16"
        width="6"
        height="1"
        className={clsx(
          "dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]",
          { "dark:!fill-[#C8C7FF] !fill-[#7540A9] ": selected }
        )}
      />
    </svg>
  );
};

export default Inventory;
