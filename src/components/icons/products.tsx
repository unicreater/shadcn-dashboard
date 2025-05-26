import clsx from "clsx";
import React from "react";

type Props = { selected: boolean };

const Products = ({ selected }: Props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 7L12 2L21 7L12 12L3 7ZM3 7V17L12 22L21 17V7M12 12V22"
        className={clsx(
          "dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]",
          { "dark:!fill-[#C8C7FF] !fill-[#7540A9] ": selected }
        )}
      />
    </svg>
  );
};

export default Products;
