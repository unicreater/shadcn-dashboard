import React from "react";

type Props = {
  id: number;
  name: string;
  full_name: string;
};

// export default function page({ params }: Props) {
//   return <div>ID: {params.id}</div>;
// }

export default async function Page() {
  const res = await fetch("https://api.github.com/repos/vercel/next.js", {
    cache: "no-store", // This will result in the response being retrieved every time the page refreshes
    // next: { // This will result in the response to only be able to be retrieved every 5s
    //     revalidate: 5
    // }
  });
  const data: Props = await res.json();

  return (
    <h1>
      Hello: {data.full_name}, {data.name}
    </h1>
  );
}
