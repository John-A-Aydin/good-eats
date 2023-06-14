import Link from "next/link";

import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);

type RecipeWithUser = RouterOutputs["recipe"]["getAll"][number];

export const RecipePreview = (props: RecipeWithUser) => {
  return (
    <div>Hello</div>
  )
};